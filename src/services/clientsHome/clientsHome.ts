import axios from "axios";

import { API, default as instance } from "@/utils/api/api";

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
  if (q.coordinators.length) params.set("coordinators", q.coordinators.join(","));
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

/** Nombre de archivo del `Content-Disposition`, con fallback al ascii. */
const dispositionFilename = (disposition: string): string | null => {
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1];
  if (utf8) {
    try {
      return decodeURIComponent(utf8);
    } catch {
      // Encabezado mal codificado: se intenta con el nombre ascii.
    }
  }
  const ascii = /filename="?([^";]+)"?/i.exec(disposition)?.[1];
  return ascii ? ascii.trim() : null;
};

/**
 * Descarga el Excel "Cartera por cliente" (3 hojas) con los mismos filtros
 * de la tabla: corte, proyección, mercados, ejecutivos, coordinadores,
 * búsqueda, tramo, forecast y orden. El backend aplica el alcance del
 * usuario, así que un externo solo recibe su cliente.
 *
 * Devuelve el nombre del archivo para mostrarlo en el aviso de éxito.
 */
export const downloadClientsHomeExcel = async (
  projectId: number,
  query: Omit<IClientsHomeListQuery, "page" | "limit">
): Promise<string> => {
  const params = baseParams(query);
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.aging) params.set("aging", query.aging);
  if (query.forecastStatuses.length)
    params.set("forecast_status", query.forecastStatuses.join(","));
  params.set("sort_by", query.sortBy);
  params.set("sort_dir", query.sortDir);

  try {
    const response = await instance.get(
      `/portfolio/clients-home/project/${projectId}/export?${params.toString()}`,
      {
        responseType: "blob",
        // Las vistas de cartera tardan ~15 s en el proyecto grande.
        timeout: 120000
      }
    );

    const disposition = (response.headers["content-disposition"] as string) || "";
    const filename =
      dispositionFilename(disposition) ||
      `Cashport_Cartera_por_cliente_${new Date().toLocaleDateString("en-CA")}.xlsx`;

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return filename;
  } catch (error) {
    // Con responseType "blob" el error del backend también llega como Blob.
    let message: string | undefined;
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        message = JSON.parse(await error.response.data.text())?.message;
      } catch {
        // Cuerpo que no es JSON (p. ej. un 502 del gateway): queda el texto por defecto.
      }
    }
    throw new Error(message || "No se pudo descargar el Excel de cartera por cliente.");
  }
};
