import { API } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";
import {
  IClientAgreements,
  IClientsHomeClients,
  IClientsHomeListQuery,
  IClientsHomePending,
  IClientsHomeQuery,
  IClientsHomeSummary
} from "@/types/clients/IClientsHome";

const baseParams = (q: IClientsHomeQuery) => {
  const params = new URLSearchParams();
  if (q.projectToMonthEnd) params.set("project_to_month_end", "true");
  if (q.markets.length) params.set("markets", q.markets.join(","));
  if (q.executives.length) params.set("executives", q.executives.join(","));
  if (q.dueFrom) params.set("due_from", q.dueFrom);
  if (q.dueTo) params.set("due_to", q.dueTo);
  return params;
};

/** KPIs del Home de Clientes. 202 + `snapshotPending` mientras se genera la foto. */
export const getClientsHomeSummary = async (
  projectId: number,
  query: IClientsHomeQuery
): Promise<GenericResponse<IClientsHomeSummary | IClientsHomePending>> => {
  const response: GenericResponse<IClientsHomeSummary | IClientsHomePending> = await API.get(
    `/portfolio/clients-home/project/${projectId}/summary?${baseParams(query).toString()}`
  );
  return response;
};

/** Tabla por cliente: búsqueda, filtro de edad, orden y paginación en el servidor. */
export const getClientsHomeClients = async (
  projectId: number,
  query: IClientsHomeListQuery
): Promise<GenericResponse<IClientsHomeClients | IClientsHomePending>> => {
  const params = baseParams(query);
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.aging) params.set("aging", query.aging);
  if (query.forecastStatuses.length)
    params.set("forecast_status", query.forecastStatuses.join(","));
  params.set("sort_by", query.sortBy);
  params.set("sort_dir", query.sortDir);
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));

  const response: GenericResponse<IClientsHomeClients | IClientsHomePending> = await API.get(
    `/portfolio/clients-home/project/${projectId}/clients?${params.toString()}`
  );
  return response;
};

/** Acuerdos de pago de un cliente (tooltip de recaudo). */
export const getClientAgreements = async (
  projectId: number,
  clientUuid: string
): Promise<GenericResponse<IClientAgreements>> => {
  const response: GenericResponse<IClientAgreements> = await API.get(
    `/portfolio/clients-home/project/${projectId}/client/${clientUuid}/agreements`
  );
  return response;
};

export const isClientsHomePending = (data: unknown): data is IClientsHomePending =>
  Boolean((data as IClientsHomePending)?.snapshotPending);
