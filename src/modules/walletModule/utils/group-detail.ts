/* Reglas de lectura del detalle de un grupo: SLA, estado de un ticket y
   resumen de sus facturas. Todas son funciones puras sobre los datos. */
import { getTranslator } from "@/i18n/translator";
import { HOY, diasEntre } from "./format";
import type { IWalletNovedad, IWalletTicket, Sev } from "../types";

/** Semáforo del compromiso de una novedad. Null si no se conoce la fecha. */
export function slaDe(nov: IWalletNovedad): { sev: Sev; txt: string } | null {
  const t = getTranslator("wallet");
  if (nov.cerrada) return { sev: "ok", txt: t("sla.closed") };
  if (!nov.compromiso) return null;

  const d = diasEntre(HOY, nov.compromiso);
  if (d < 0) return { sev: "crit", txt: t("sla.overdueBy", { days: Math.abs(d) }) };
  if (d === 0) return { sev: "crit", txt: t("sla.dueToday") };
  if (d <= 2) return { sev: "warn", txt: t("sla.dueIn", { days: d }) };
  return { sev: "ok", txt: t("sla.dueIn", { days: d }) };
}

/** Severidad de una fecha próxima: vencida o de hoy es crítica. */
export function sevDias(fecha: Date, warnEn = 2): { sev: Sev; txt: string } {
  const d = diasEntre(HOY, fecha);
  const sev: Sev = d <= 0 ? "crit" : d <= warnEn ? "warn" : "ok";
  const t = getTranslator("wallet");
  return { sev, txt: d === 0 ? t("sla.today") : t("sla.days", { days: Math.abs(d) }) };
}

export const resueltoTarde = (t: IWalletTicket): boolean =>
  t.estado === "resuelto" && !!t.resueltoEl && !!t.deadline && t.resueltoEl > t.deadline;

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
  const tr = getTranslator("wallet");
  if (t.estado === "resuelto") {
    return {
      k: "ok",
      ico: "✓",
      estado: tr("ticketStatus.resolved"),
      sev: "ok",
      tiempo: resueltoTarde(t) ? tr("ticketStatus.late") : null,
      tsev: "warn"
    };
  }

  const base = {
    k: "abierto",
    ico: "•",
    estado: tr("ticketStatus.open"),
    sev: "idle"
  } as const;
  // Sin fecha límite no hay urgencia que medir: queda abierto, sin chip de tiempo.
  if (!t.deadline) return { ...base, tiempo: null, tsev: null };

  const d = diasEntre(HOY, t.deadline);
  if (d < 0) {
    return {
      ...base,
      k: "tarde",
      ico: "!",
      tiempo: tr("ticketStatus.overdueBy", { days: Math.abs(d) }),
      tsev: "crit"
    };
  }
  if (d === 0) return { ...base, k: "hoy", tiempo: tr("sla.dueToday"), tsev: "crit" };
  if (d <= 2) return { ...base, tiempo: tr("sla.dueIn", { days: d }), tsev: "warn" };
  return { ...base, tiempo: tr("sla.dueIn", { days: d }), tsev: null };
}

/**
 * Vencido del grupo: todo lo que no es corriente.
 *
 * Se lee del reparto por tramo y no de las facturas, que son una muestra.
 */
export const vencidoDeTramos = (tramos: number[]): number =>
  tramos.slice(1).reduce((a, m) => a + m, 0);
