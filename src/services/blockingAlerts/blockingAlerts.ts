import type {
  BlockingAlertsDocumentTab,
  IBlockingAlertsListQuery
} from "@/types/blockingAlerts/IBlockingAlerts";

// El proyecto viaja en el header projectId (interceptores de api.ts), no en la ruta
const BLOCKING_ALERTS_API = "/portfolio/blocking-alerts";

export type BlockingAlertsListView = "clients" | "points-of-sale";

/** Total cartera y conteos por estado de clientes y puntos de venta (o de un cliente). */
export const blockingAlertsSummaryPath = (clientUuid?: string) =>
  clientUuid
    ? `${BLOCKING_ALERTS_API}/summary?${new URLSearchParams({ client_uuid: clientUuid })}`
    : `${BLOCKING_ALERTS_API}/summary`;

/** Una página del listado: filtro, búsqueda, orden y paginación los resuelve el API. */
export const blockingAlertsListPath = (
  view: BlockingAlertsListView,
  query: IBlockingAlertsListQuery
) => {
  const params = new URLSearchParams({
    sort_by: query.sortBy,
    page: String(query.page),
    limit: String(query.limit)
  });
  if (query.sortDir) params.set("sort_dir", query.sortDir);
  if (query.status) params.set("status", query.status);
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.clientUuid) params.set("client_uuid", query.clientUuid);
  return `${BLOCKING_ALERTS_API}/${view}?${params}`;
};

/** Detalle de un cliente o, con `code`, de uno de sus puntos de venta. */
export const blockingAlertsDetailPath = (clientUuid: string, code?: string) =>
  `${BLOCKING_ALERTS_API}/clients/${encodeURIComponent(clientUuid)}` +
  (code ? `/points-of-sale/${encodeURIComponent(code)}` : "");

/** Una página de los documentos de una pestaña del detalle. */
export const blockingAlertsDocumentsPath = (
  clientUuid: string,
  code: string | undefined,
  query: { tab: BlockingAlertsDocumentTab; page: number; limit: number }
) =>
  `${blockingAlertsDetailPath(clientUuid, code)}/documents?${new URLSearchParams({
    tab: query.tab,
    page: String(query.page),
    limit: String(query.limit)
  })}`;
