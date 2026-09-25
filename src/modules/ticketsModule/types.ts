import type { TicketSituation } from "@/types/tickets/ITickets";

/**
 * Filtros que comparten el listado y las tarjetas de resumen. `situation` sólo
 * aplica al listado: cada tarjeta ya es una situación.
 */
export interface TicketFilters {
  situation?: TicketSituation | null;
  assignedToUserId?: number | null;
  categoryId?: number | null;
  search?: string;
}

export type TicketLaneId = "vencidos" | "hoy" | "semana" | "despues" | "ok";
export type TicketView = "lista" | "tablero";
