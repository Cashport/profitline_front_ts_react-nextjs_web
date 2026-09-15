export type TicketStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

/** Buckets de GET /tickets/summary; también es el param `situation` del listado. */
export type TicketSituation =
  | "pending"
  | "overdue"
  | "due_soon"
  | "completed_late"
  | "completed_on_time";

/** Fila de GET /tickets y cuerpo de GET /tickets/:id. */
export interface ITicket {
  id: number;
  ticket_code: string;
  project_id: number;
  title: string;
  description: string | null;
  client_id: string;
  client_name: string;
  created_by_user_id: number;
  created_by_name: string;
  assigned_to_user_id: number | null;
  assigned_to_name: string | null;
  category_id: number | null;
  category_name: string | null;
  amount: number;
  status: TicketStatus;
  priority: TicketPriority;
  /** ISO8601; null cuando el ticket se creó sin fecha límite. */
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ITicketSummaryBucket {
  count: number;
  amount: number;
}

export type ITicketsSummary = Record<TicketSituation, ITicketSummaryBucket>;

/** Fila de GET /tickets/categories. */
export interface ITicketCategory {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  sort_order: number;
}
