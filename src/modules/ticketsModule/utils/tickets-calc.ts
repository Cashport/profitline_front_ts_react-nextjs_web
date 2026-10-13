import type { KpiCardItem } from "@/components/ui/kpi-cards/kpi-cards";
import { parseApiDate } from "@/modules/walletModule/utils/api-adapter";
import { diasEntre, fmtM } from "@/modules/walletModule/utils/format";
import type { Sev } from "@/modules/walletModule/types";
import type { ITicket, ITicketsSummary } from "@/types/tickets/ITickets";
import { TICKET_KPI_CARDS, TICKET_STATUS_LABEL } from "../constants";
import type { TicketLaneId } from "../types";

/**
 * Hoy a medianoche local. Los buckets del API (overdue, due_soon) se calculan
 * con la fecha real, así que aquí no sirve el corte fijo `HOY` de cartera: los
 * carriles y las tarjetas dejarían de coincidir.
 */
export const hoy = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const fechaLimite = (t: ITicket): Date | null => parseApiDate(t.due_at);

export const esAbierto = (t: ITicket): boolean => t.status === "OPEN" || t.status === "IN_PROGRESS";

export const esResuelto = (t: ITicket): boolean => t.status === "COMPLETED";

export const resueltoTarde = (t: ITicket): boolean => {
  const fin = parseApiDate(t.completed_at);
  const limite = fechaLimite(t);
  return esResuelto(t) && !!fin && !!limite && fin > limite;
};

/** Días de aquí a la fecha de resolución; negativo si ya pasó. Sin fecha, nunca urge. */
export const diasAlLimite = (t: ITicket): number => {
  const limite = fechaLimite(t);
  return limite ? diasEntre(hoy(), limite) : Infinity;
};

/** Semáforo de la fecha límite de un ticket abierto: vencida u hoy es crítica, ámbar en los 5 días previos. */
export const sevLimite = (t: ITicket): Sev => {
  const d = diasAlLimite(t);
  return d <= 0 ? "crit" : d <= 5 ? "warn" : "ok";
};

export interface TicketStatusView {
  estado: string;
  sev: Sev;
  /** Texto del chip de tiempo, si aplica. */
  tiempo: string | null;
  tsev: Sev | null;
}

/** Misma lectura que `estadoTicket` de cartera, sobre el ticket del API. */
export function estadoDe(t: ITicket): TicketStatusView {
  const estado = TICKET_STATUS_LABEL[t.status];

  if (t.status === "CANCELLED") return { estado, sev: "idle", tiempo: null, tsev: null };
  if (esResuelto(t)) {
    return {
      estado,
      sev: "ok",
      tiempo: resueltoTarde(t) ? "Fuera de fecha" : null,
      tsev: "warn"
    };
  }

  // Sin fecha límite no hay urgencia que medir: queda abierto, sin chip de tiempo.
  const d = diasAlLimite(t);
  if (d === Infinity) return { estado, sev: "idle", tiempo: null, tsev: null };
  if (d < 0) return { estado, sev: "idle", tiempo: `Vencido ${Math.abs(d)}d`, tsev: "crit" };
  if (d === 0) return { estado, sev: "idle", tiempo: "Vence hoy", tsev: "crit" };
  if (d <= 2) return { estado, sev: "idle", tiempo: `En ${d}d`, tsev: "warn" };
  return { estado, sev: "idle", tiempo: `En ${d}d`, tsev: null };
}

/** Carril del tablero al que cae un ticket. */
export function laneDe(t: ITicket): TicketLaneId {
  if (!esAbierto(t)) return "ok";

  const d = diasAlLimite(t);
  if (d < 0) return "vencidos";
  if (d === 0) return "hoy";
  return d <= 7 ? "semana" : "despues";
}

/** Valor por el que ordena cada columna de la lista. */
export function valorDeColumna(t: ITicket, col: string): string | number {
  switch (col) {
    case "ticket":
      return t.ticket_code;
    case "cliente":
      return t.client_name;
    case "cat":
      return t.category_name ?? "";
    case "resp":
      return t.assigned_to_name ?? "";
    case "fecha":
      return fechaLimite(t)?.getTime() ?? Infinity;
    // Los abiertos primero dentro de cada estado, como en la referencia.
    case "estado":
      return estadoDe(t).estado + (esAbierto(t) ? "0" : "1");
    default:
      return t.amount;
  }
}

/** Suma de lo que hay en juego en un conjunto de tickets. */
export const sumaMonto = (tickets: ITicket[]): number => tickets.reduce((a, t) => a + t.amount, 0);

/** Las tarjetas con las cifras del API; en cero mientras no llegan. */
export const toKpiCards = (summary: ITicketsSummary | undefined): KpiCardItem[] =>
  TICKET_KPI_CARDS.map((c) => ({
    ...c,
    valor: fmtM(summary?.[c.id]?.amount ?? 0),
    conteo: summary?.[c.id]?.count ?? 0
  }));
