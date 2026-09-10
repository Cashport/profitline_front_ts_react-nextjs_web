/* Reglas de lectura del detalle de un grupo: SLA, estado de un ticket y
   resumen de sus facturas. Todas son funciones puras sobre los datos. */
import { HOY, diasEntre } from "./format";
import type { IWalletNovedad, IWalletTicket, Sev } from "../types";

/** Semáforo del compromiso de una novedad. Null si no se conoce la fecha. */
export function slaDe(nov: IWalletNovedad): { sev: Sev; txt: string } | null {
  if (nov.cerrada) return { sev: "ok", txt: "Cerrada" };
  if (!nov.compromiso) return null;

  const d = diasEntre(HOY, nov.compromiso);
  if (d < 0) return { sev: "crit", txt: `Vencida ${Math.abs(d)}d` };
  if (d === 0) return { sev: "crit", txt: "Vence hoy" };
  if (d <= 2) return { sev: "warn", txt: `En ${d}d` };
  return { sev: "ok", txt: `En ${d}d` };
}

/** Severidad de una fecha próxima: vencida o de hoy es crítica. */
export function sevDias(fecha: Date, warnEn = 2): { sev: Sev; txt: string } {
  const d = diasEntre(HOY, fecha);
  const sev: Sev = d <= 0 ? "crit" : d <= warnEn ? "warn" : "ok";
  return { sev, txt: d === 0 ? "Hoy" : `${Math.abs(d)}d` };
}

export const resueltoTarde = (t: IWalletTicket): boolean =>
  t.estado === "resuelto" && !!t.resueltoEl && t.resueltoEl > t.deadline;

export interface TicketStatus {
  /** Clave del borde izquierdo de la tarjeta. */
  k: "ok" | "tarde" | "hoy" | "abierto";
  ico: string;
  estado: string;
  sev: Sev;
  /** Texto del chip de tiempo, si aplica. */
  tiempo: string | null;
  tsev: Sev | null;
}

export function estadoTicket(t: IWalletTicket): TicketStatus {
  if (t.estado === "resuelto") {
    return {
      k: "ok",
      ico: "✓",
      estado: "Resuelto",
      sev: "ok",
      tiempo: resueltoTarde(t) ? "Fuera de fecha" : null,
      tsev: "warn"
    };
  }

  const d = diasEntre(HOY, t.deadline);
  const base = { k: "abierto", ico: "•", estado: "Por resolver", sev: "idle" } as const;

  if (d < 0) {
    return { ...base, k: "tarde", ico: "!", tiempo: `Vencido ${Math.abs(d)}d`, tsev: "crit" };
  }
  if (d === 0) return { ...base, k: "hoy", tiempo: "Vence hoy", tsev: "crit" };
  if (d <= 2) return { ...base, tiempo: `En ${d}d`, tsev: "warn" };
  return { ...base, tiempo: `En ${d}d`, tsev: null };
}

/**
 * Vencido del grupo: todo lo que no es corriente.
 *
 * Se lee del reparto por tramo y no de las facturas, que son una muestra. Es
 * el mismo criterio de `toSummary`, así que el dato del modal y el de las
 * tarjetas superiores no pueden discrepar.
 */
export const vencidoDeTramos = (tramos: number[]): number =>
  tramos.slice(1).reduce((a, m) => a + m, 0);
