import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  IWalletMatrixFilters,
  IWalletMatrixGroupsScope,
  IWalletMatrixSharedFilters,
  IWalletMatrixStatus
} from "@/types/portfolios/IWalletMatrix";

// URLSearchParams codifica espacios y tildes de los valores canónicos
// ("Cristina Osorio", "Jurídico"); la coma de las listas también viaja
// codificada y el backend la parte tras decodificar.
const list = (params: URLSearchParams, key: string, value?: Array<string | number>) => {
  if (value?.length) params.set(key, value.join(","));
};

const single = (params: URLSearchParams, key: string, value?: string | null) => {
  const text = value?.trim();
  if (text) params.set(key, text);
};

/**
 * Los filtros que entienden por igual /portfolio/matrix y /portfolio/matrix/groups:
 * los siete del modal de la matriz más el buscador. Las dos tablas de la
 * pantalla tienen que quedar acotadas a lo mismo.
 */
const appendSharedFilters = (params: URLSearchParams, filters?: IWalletMatrixSharedFilters) => {
  list(params, "status", filters?.status);
  list(params, "novelty_type", filters?.noveltyType);
  list(params, "executive", filters?.executive);
  list(params, "coordinator", filters?.coordinator);
  list(params, "market", filters?.market);
  list(params, "kam", filters?.kam);
  list(params, "kam_lider", filters?.kam_lider);
  single(params, "search", filters?.search);
};

/**
 * Serializa los filtros de /portfolio/matrix a query string.
 *
 * Sólo se serializa lo que tiene valor; la vista también usa el resultado como
 * disparador para volver a la primera página cuando cambia la consulta.
 */
export const buildMatrixQuery = (filters?: IWalletMatrixFilters): string => {
  const params = new URLSearchParams();

  appendSharedFilters(params, filters);

  // Lo que sólo entiende /portfolio/matrix.
  list(params, "clients", filters?.clients);
  list(params, "zones", filters?.zones);
  list(params, "lines", filters?.lines);
  list(params, "sublines", filters?.sublines);
  list(params, "channels", filters?.channels);
  list(params, "holdings", filters?.holdings);
  list(params, "client_group", filters?.clientGroup);
  single(params, "sort_by", filters?.sort_by);
  single(params, "sort_dir", filters?.sort_dir);
  // Siempre explícito: el backend lo espera como indicador 0/1.
  params.set("calculateEndMonth", filters?.calculateEndMonth ? "1" : "0");

  return params.toString();
};

/**
 * Serializa la query de /portfolio/matrix/groups: el acotado a la foto, el
 * cliente y el tramo elegidos, más los filtros que comparte con la matriz.
 *
 * El orden y las listas de cliente/zona/línea se quedan fuera a propósito: el
 * endpoint no los acepta y sólo ensuciarían la cache key de SWR, haciendo que
 * ordenar una columna de la matriz volviera a pedir los mismos grupos.
 */
export const buildMatrixGroupsQuery = (
  scope: IWalletMatrixGroupsScope,
  filters?: IWalletMatrixSharedFilters
): string => {
  const params = new URLSearchParams();

  single(params, "runId", scope.runId);
  single(params, "clientId", scope.clientId);
  single(params, "aging", scope.aging);

  appendSharedFilters(params, filters);

  params.set("calculateEndMonth", scope.calculateEndMonth ? "1" : "0");

  return params.toString();
};

/**
 * Fuerza la regeneración de la foto (solo administradores).
 *
 * Responde 202 y el proceso sigue en background; el avance llega por
 * socket, con el endpoint de estado como respaldo.
 */
export const refreshWalletMatrix = async (): Promise<
  GenericResponse<{ status: string; message: string; startedAt: string }>
> => {
  const response: GenericResponse<{
    status: string;
    message: string;
    startedAt: string;
  }> = await API.post(`/portfolio/matrix/refresh`);
  return response;
};

export const getWalletMatrixStatus = async (): Promise<GenericResponse<IWalletMatrixStatus>> => {
  const response: GenericResponse<IWalletMatrixStatus> = await API.get(`/portfolio/matrix/status`);
  return response;
};
