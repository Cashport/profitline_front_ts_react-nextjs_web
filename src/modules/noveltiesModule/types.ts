/** Tipo de novedad, del catálogo de negocio. */
export type NoveltyTipoKey =
  | "nc_comercial"
  | "nc_precio"
  | "refact"
  | "rechazo"
  | "cruce"
  | "acuerdo"
  | "pago_ni"
  | "faltante";

export type NoveltyView = "lista" | "tablero";

/**
 * Filtros que posee el modal de la bandeja; la vista los mezcla con la
 * búsqueda, la tarjeta KPI y el orden antes de consultar /invoice/incident-list.
 */
export interface INoveltiesFilters {
  novelty_status_id: number | null;
  motive_id: number | null;
  /** Valores canónicos de /incident-list/filters, no texto libre. */
  coordinator: string | null;
  kam: string | null;
  market: string | null;
  executive_id: number | null;
  /** YYYY-MM-DD, sobre incident.created_at. */
  date_from: string | null;
  date_to: string | null;
}
