import type { Sev } from "@/modules/walletModule/types";
import type { TicketPriority, TicketSituation, TicketStatus } from "@/types/tickets/ITickets";
import type { TicketLaneId } from "./types";

interface CardMeta {
  id: TicketSituation;
  label: string;
  /** Explica qué mide la tarjeta; va tras el conteo. */
  pie: string;
  sev?: Extract<Sev, "warn" | "crit">;
}

/** Las cinco tarjetas de la bandeja, en el orden en que se muestran. Cada una es
 *  un bucket de /tickets/summary y el `situation` con el que se pide la lista. */
export const TICKET_KPI_CARDS: CardMeta[] = [
  { id: "pending", label: "Por resolver", pie: "saldo esperando una acción concreta" },
  { id: "overdue", label: "Vencidos", pie: "la fecha de resolución ya pasó", sev: "crit" },
  // El umbral de "próximo" lo fija el backend (TICKETS_DUE_SOON_DAYS).
  { id: "due_soon", label: "Próximos a vencer", pie: "hay que cerrarlos pronto", sev: "warn" },
  {
    id: "completed_late",
    label: "Resueltos fuera de fecha",
    pie: "se cerraron después del compromiso",
    sev: "warn"
  },
  { id: "completed_on_time", label: "Resueltos a tiempo", pie: "cumplieron la fecha pactada" }
];

/** Columnas del tablero: por cercanía de la fecha de resolución. */
export const TICKET_LANES: { id: TicketLaneId; nom: string }[] = [
  { id: "vencidos", nom: "Vencidos" },
  { id: "hoy", nom: "Vencen hoy" },
  { id: "semana", nom: "Próximos 7 días" },
  { id: "despues", nom: "Más adelante" },
  { id: "ok", nom: "Resueltos" }
];

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Por resolver",
  IN_PROGRESS: "En curso",
  COMPLETED: "Resuelto",
  CANCELLED: "Cancelado"
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: "Baja",
  NORMAL: "Normal",
  HIGH: "Alta",
  URGENT: "Urgente"
};
