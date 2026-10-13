import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  IPortfolioClientsRefreshResponse,
  IPortfolioClientsSnapshotStatus
} from "@/types/clients/IPortfolioClientsSnapshot";

/**
 * Regenera la información de la tabla de cartera (solo administradores).
 * Responde 202 con el `runId` y el proceso sigue en el backend; el avance se
 * consulta con `getPortfolioClientsStatus`. Si ya hay una actualización en
 * curso responde 409.
 */
export const refreshPortfolioClients = async (): Promise<
  GenericResponse<IPortfolioClientsRefreshResponse>
> => {
  const response: GenericResponse<IPortfolioClientsRefreshResponse> = await API.post(
    `/portfolio/client/snapshot/refresh`
  );
  return response;
};

export const getPortfolioClientsStatus = async (): Promise<
  GenericResponse<IPortfolioClientsSnapshotStatus>
> => {
  const response: GenericResponse<IPortfolioClientsSnapshotStatus> = await API.get(
    `/portfolio/client/snapshot/status`
  );
  return response;
};
