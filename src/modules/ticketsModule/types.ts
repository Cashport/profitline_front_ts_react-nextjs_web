import type { IWalletTicket } from "@/modules/walletModule/types";

/** Un ticket con el contexto del grupo del que cuelga, que es lo que ve la fila. */
export interface ITicketRow {
  ticket: IWalletTicket;
  /** Clave del grupo: es lo que abre el modal de gestión. */
  clave: string;
  cliente: string;
  monto: number;
  /** null cuando el grupo no es una novedad. */
  novedadId: string | null;
}

export type TicketCardId = "abiertos" | "vencidos" | "proximos" | "tarde" | "atiempo";
export type TicketFilter = TicketCardId | "resueltos" | "todos";
export type TicketLaneId = "vencidos" | "hoy" | "semana" | "despues" | "ok";
export type TicketView = "lista" | "tablero";
