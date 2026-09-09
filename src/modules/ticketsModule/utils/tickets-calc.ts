import { HOY, diasEntre } from "@/modules/walletModule/utils/format";
import { estadoTicket, resueltoTarde } from "@/modules/walletModule/utils/group-detail";
import type { ITicketRow, TicketCardId, TicketFilter, TicketLaneId } from "../types";

/** Días de aquí a la fecha de resolución; negativo si ya pasó. */
export const diasAlLimite = (r: ITicketRow): number => diasEntre(HOY, r.ticket.deadline);

const abierto = (r: ITicketRow) => r.ticket.estado === "abierto";
const resuelto = (r: ITicketRow) => r.ticket.estado === "resuelto";

/**
 * Un predicado por tarjeta, compartido por el conteo y por el filtro de filas.
 * Si se separan, la tarjeta acaba diciendo un número y la lista mostrando otro.
 */
export const TICKET_PREDICATES: Record<TicketCardId, (r: ITicketRow) => boolean> = {
  abiertos: abierto,
  vencidos: (r) => abierto(r) && diasAlLimite(r) < 0,
  proximos: (r) => abierto(r) && diasAlLimite(r) >= 0 && diasAlLimite(r) <= 3,
  tarde: (r) => resuelto(r) && resueltoTarde(r.ticket),
  atiempo: (r) => resuelto(r) && !resueltoTarde(r.ticket)
};

/** Carril del tablero al que cae un ticket. */
export function laneDe(r: ITicketRow): TicketLaneId {
  if (resuelto(r)) return "ok";

  const d = diasAlLimite(r);
  if (d < 0) return "vencidos";
  if (d === 0) return "hoy";
  return d <= 7 ? "semana" : "despues";
}

const esTarjeta = (f: TicketFilter): f is TicketCardId => f in TICKET_PREDICATES;

export function filtrarTickets(
  rows: ITicketRow[],
  filtro: TicketFilter,
  query: string
): ITicketRow[] {
  let xs = rows;
  if (esTarjeta(filtro)) xs = xs.filter(TICKET_PREDICATES[filtro]);
  else if (filtro === "resueltos") xs = xs.filter(resuelto);

  const q = query.trim().toLowerCase();
  if (!q) return xs;

  return xs.filter((r) =>
    `${r.ticket.id} ${r.ticket.titulo} ${r.cliente} ${r.novedadId ?? ""} ${r.ticket.categoria ?? ""}`
      .toLowerCase()
      .includes(q)
  );
}

export const contarPorFiltro = (rows: ITicketRow[], filtro: TicketFilter): number =>
  filtrarTickets(rows, filtro, "").length;

/** Valor por el que ordena cada columna de la lista. */
export function valorDeColumna(r: ITicketRow, col: string): string | number {
  switch (col) {
    case "ticket":
      return r.ticket.id;
    case "cliente":
      return r.cliente;
    case "cat":
      return r.ticket.categoria ?? "";
    case "resp":
      return r.ticket.responsable.nombre;
    case "fecha":
      return r.ticket.deadline.getTime();
    // Los abiertos primero dentro de cada estado, como en la referencia.
    case "estado":
      return estadoTicket(r.ticket).estado + (abierto(r) ? "0" : "1");
    default:
      return r.monto;
  }
}

/** Suma de lo que hay en juego en un conjunto de filas. */
export const sumaMonto = (rows: ITicketRow[]): number => rows.reduce((a, r) => a + r.monto, 0);
