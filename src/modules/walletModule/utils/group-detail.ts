/* Reglas de lectura del detalle de un grupo: SLA, estado de un ticket y
   resumen de sus facturas. Todas son funciones puras sobre los datos. */
import { HOY, diasEntre } from "./format";
import type { IWalletInvoice, IWalletNovedad, IWalletTicket, Sev } from "../types";

/** Semáforo del compromiso de una novedad. */
export function slaDe(nov: IWalletNovedad): { sev: Sev; txt: string } {
  if (nov.cerrada) return { sev: "ok", txt: "Cerrada" };

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

/** Saldo, vencido y mora promedio de un conjunto de facturas. */
export function resumenFacturas(fs: IWalletInvoice[]): {
  total: number;
  vencido: number;
  edad: number;
} {
  const total = fs.reduce((a, f) => a + f.saldo, 0);
  const vencido = fs.filter((f) => f.dias > 0).reduce((a, f) => a + f.saldo, 0);
  const edad = Math.round(fs.reduce((a, f) => a + Math.max(0, f.dias), 0) / (fs.length || 1));
  return { total, vencido, edad };
}
