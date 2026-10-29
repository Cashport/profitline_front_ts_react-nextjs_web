import { fmtD } from "@/modules/walletModule/utils/format";
import type { ITaskConfig, ITicket, TicketPriority, TicketStatus } from "@/types/tickets/ITickets";
import { TASK_AGE_ALERT_MINUTES } from "../constants";

/** Antigüedad como en el prototipo: "40 min", "5 h", "1 día", "3 días". */
export function formatAge(minutes: number): string {
  if (minutes < 60) return `${Math.max(0, Math.round(minutes))} min`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h`;
  const days = Math.floor(minutes / (24 * 60));
  return `${days} ${days === 1 ? "día" : "días"}`;
}

export const isClosedStatus = (config: ITaskConfig | undefined, status: TicketStatus) =>
  Boolean(config?.statuses.find((s) => s.key === status)?.closed);

/** Abierta hace más de 3 días: la antigüedad va en rojo. */
export const isAgeAlert = (config: ITaskConfig | undefined, ticket: ITicket) =>
  !isClosedStatus(config, ticket.status) && ticket.open_minutes >= TASK_AGE_ALERT_MINUTES;

/** "2026-11-01T10:00:00" → "01/11/2026"; vacío → "—". */
export function formatTaskDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : fmtD(date);
}

export const statusMeta = (config: ITaskConfig | undefined, status: TicketStatus) =>
  config?.statuses.find((s) => s.key === status);

export const priorityMeta = (config: ITaskConfig | undefined, priority: TicketPriority) =>
  config?.priorities.find((p) => p.key === priority);

/** Iniciales para el avatar del responsable. */
export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "·";
}
