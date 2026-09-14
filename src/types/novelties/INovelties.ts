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
