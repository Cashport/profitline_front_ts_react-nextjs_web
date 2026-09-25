/** Fila de GET /invoice/incident-list. */
export interface IIncidentListItem {
  incident_id: number;
  novelty_name: string;
  client_name: string;
  client_nit: string;
  coordinator: string | null;
  executive_name: string | null;
  invoice_reference: string | null;
  invoice_count: number;
  id_incident_motive: number;
  status: number;
  is_open: number;
  next_action_title: string | null;
  amount: number;
  assigned_to: number | null;
  assigned_to_name: string | null;
  last_management_at: string | null;
  next_ticket_date: string | null;
  limit_date: string | null;
  novelty_status_id: number;
  novelty_status_name: string;
  novelty_status_color: string;
  created_at: string;
}

/** Totales del universo filtrado, no de la página. */
export interface IIncidentListSummary {
  total_amount: number;
  total_invoices: number;
}

export interface IIncidentListData {
  items: IIncidentListItem[];
  summary: IIncidentListSummary;
}

/** GET /invoice/incident-list/kpis. */
export interface IIncidentListKpis {
  open_count: number;
  overdue_ticket_count: number;
  no_management_7d_count: number;
  past_limit_date_count: number;
  unassigned_count: number;
  open_amount: number;
  overdue_ticket_amount: number;
  no_management_7d_amount: number;
  past_limit_date_amount: number;
  unassigned_amount: number;
}

/** GET /invoice/novelty-status. */
export interface INoveltyStatus {
  id: number;
  description: string;
  color: string;
  sort_order: number;
}

/** GET /invoice/incident/motives. */
export interface IIncidentMotive {
  id: number;
  name: string;
  order: number;
}

/**
 * Valor canonicalizado de un filtro de texto. `canonical` es lo que se muestra
 * y lo que se envía de vuelta al listado; `raw_values` es sólo informativo.
 */
export interface IIncidentListCanonicalFilter {
  canonical: string;
  raw_values: string[];
}

/** GET /invoice/incident-list/filters: catálogo para todos los selects de filtro. */
export interface IIncidentListFilters {
  coordinator: IIncidentListCanonicalFilter[];
  kam: IIncidentListCanonicalFilter[];
  kam_lider: IIncidentListCanonicalFilter[];
  market: IIncidentListCanonicalFilter[];
  executive: { id: number; name: string; email: string }[];
  novelty_type: { id: number; name: string }[];
  novelty_status: INoveltyStatus[];
}

/** Parámetro `card` del listado: mismo predicado que cada tarjeta KPI. */
export type IncidentCard = "abiertas" | "vencidas" | "frias" | "limite" | "sinresp";

export type IncidentSortBy =
  | "id"
  | "created_at"
  | "amount"
  | "next_ticket_date"
  | "limit_date"
  | "last_management_at"
  | "novelty_status"
  | "client_name"
  | "assigned_to_name";

export type IncidentSortDir = "asc" | "desc";

/** Estado de una acción (ticket) de la novedad. Sólo OPEN está documentado. */
export type IncidentActionStatus = "OPEN" | "RESOLVED";

/** Fila de GET /invoice/incident/:id/actions. */
export interface IIncidentAction {
  id: number;
  incident_id: number;
  /** Código visible, p. ej. "TK-3". */
  ticket_code: string;
  title: string;
  description: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  /** "YYYY-MM-DD"; la acción puede crearse sin fecha. */
  due_date: string | null;
  status: IncidentActionStatus;
  resolved_at: string | null;
  resolved_by: number | null;
  resolved_by_name: string | null;
  resolution_comment: string | null;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

/** Body de POST /invoice/incident/:id/actions. Sin `assigned_to` queda asignada a quien la crea. */
export interface ICreateIncidentActionBody {
  title: string;
  description?: string;
  assigned_to?: number;
  /** "YYYY-MM-DD". */
  due_date?: string;
}

/** Body de PATCH /invoice/incident/:id/actions/:actionId/resolve. */
export interface IResolveIncidentActionBody {
  resolution_comment?: string;
}

/** Body de PATCH /invoice/incident/:id/status. `comment` queda en el historial de la novedad. */
export interface IUpdateIncidentStatusBody {
  /** Id del catálogo de estados (GET /invoice/novelty-status). */
  novelty_status_id: number;
  comment?: string;
}

/** Documento (factura o saldo) que se asocia a una novedad al crearla. */
export interface IIncidentDocumentRef {
  document_type: "FINANCIAL_RECORD" | "BALANCE";
  document_id: number;
}

/** Body de POST /invoice/incident/client/:clientUUID. Las fechas van "YYYY-MM-DD". */
export interface ICreateIncidentBody {
  motive_id: number;
  documents: IIncidentDocumentRef[];
  comments?: string;
  assigned_to?: number | null;
  limit_date?: string;
  next_ticket_date?: string;
}

/** `data` de la respuesta de POST /invoice/incident/client/:clientUUID. */
export interface ICreateIncidentData {
  incident_id: number;
}

/** Body de PUT /invoice/incident/:id. Todo opcional: sólo viaja lo que se edita. */
export interface IUpdateIncidentBody {
  motive_id?: number;
  assigned_to?: number | null;
  limit_date?: string | null;
  next_ticket_date?: string | null;
}
