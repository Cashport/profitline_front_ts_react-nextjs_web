import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import { IWalletMatrixFilters, IWalletMatrixStatus } from "@/types/portfolios/IWalletMatrix";

/**
 * Serializa los filtros a query string. Sólo lo usa /portfolio/matrix.
 *
 * /portfolio/matrix/groups NO pasa por aquí: acepta únicamente runId, clientId,
 * aging y calculateEndMonth, y arma su propia query en el hook. Mandarle estos
 * filtros no acotaba nada y metía ruido en la cache key de SWR.
 *
 * Sólo se serializa lo que tiene valor; la vista también usa el resultado como
 * disparador para volver a la primera página cuando cambia la consulta.
 */
export const buildMatrixQuery = (filters?: IWalletMatrixFilters): string => {
  // URLSearchParams codifica espacios y tildes de los valores canónicos
  // ("Cristina Osorio", "Jurídico"); la coma de las listas también viaja
  // codificada y el backend la parte tras decodificar.
  const params = new URLSearchParams();
  const list = (key: string, value?: Array<string | number>) => {
    if (value?.length) params.set(key, value.join(","));
  };
  const single = (key: string, value?: string | null) => {
    const text = value?.trim();
    if (text) params.set(key, text);
  };

  list("clients", filters?.clients);
  list("status", filters?.status);
  list("novelty_type", filters?.noveltyType);
  list("executive", filters?.executive);
  list("kam", filters?.kam);
  list("zones", filters?.zones);
  list("lines", filters?.lines);
  list("sublines", filters?.sublines);
  list("channels", filters?.channels);
  list("holdings", filters?.holdings);
  list("client_group", filters?.clientGroup);
  single("coordinator", filters?.coordinator);
  single("market", filters?.market);
  single("search", filters?.search);
  // Siempre explícito: el backend lo espera como indicador 0/1.
  params.set("calculateEndMonth", filters?.calculateEndMonth ? "1" : "0");

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
