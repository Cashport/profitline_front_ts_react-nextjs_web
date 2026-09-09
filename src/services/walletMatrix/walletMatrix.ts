import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import { IWalletMatrixFilters, IWalletMatrixStatus } from "@/types/portfolios/IWalletMatrix";

/**
 * Serializa los filtros a query string.
 *
 * Vive en un solo lugar porque matriz, detalle y grupos deben mandar
 * EXACTAMENTE los mismos filtros: si el detalle se pidiera con un filtro
 * distinto, su suma dejaría de coincidir con el monto de la celda.
 */
export const buildMatrixQuery = (filters?: IWalletMatrixFilters): string => {
  if (!filters) return "";

  const params: string[] = [];
  const list = (key: string, value?: Array<string | number>) => {
    if (value?.length) params.push(`${key}=${value.join(",")}`);
  };

  list("clients", filters.clients);
  list("status", filters.status);
  list("novelty_type", filters.noveltyType);
  list("executive", filters.executive);
  list("kam", filters.kam);
  list("zones", filters.zones);
  list("lines", filters.lines);
  list("sublines", filters.sublines);
  list("channels", filters.channels);
  list("holdings", filters.holdings);
  list("client_group", filters.clientGroup);

  if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  // Siempre explícito: el backend lo espera como indicador 0/1.
  params.push(`calculateEndMonth=${filters.calculateEndMonth ? 1 : 0}`);

  return params.join("&");
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

export const getWalletMatrixStatus = async (): Promise<
  GenericResponse<IWalletMatrixStatus>
> => {
  const response: GenericResponse<IWalletMatrixStatus> = await API.get(
    `/portfolio/matrix/status`
  );
  return response;
};
