import type { AgreementStatus } from "@/types/collectionTower/ICollectionTower";
import type {
  AgreementView,
  Board,
  BoardId,
  CurveReference,
  Grouping,
  PnaAge,
  Tone
} from "./types";

/**
 * Mientras no exista el API de la torre, el tablero lee los datos de ejemplo
 * (utils/tower-mock), que tienen la misma forma que la respuesta real.
 * OJO: con true, todo el que entre a /dashboard ve cifras de ejemplo.
 */
export const USE_TOWER_MOCK = true;

/**
 * Tableros del encabezado ("cambiar tablero"). El selector se habilita sólo
 * cuando hay más de uno listo; uno en otra ruta (la cartera en /wallet, por
 * ejemplo) entra con `href`.
 */
export const BOARDS: Board[] = [
  {
    id: "torre",
    name: "Torre de control de recaudo",
    description: "Meta, forecast, acuerdos de pago y PNA del mes",
    enabled: true
  }
];

export const DEFAULT_BOARD: BoardId = "torre";

/** Agrupaciones de las tablas "frente a su meta". */
export const GROUPINGS: { id: Grouping; label: string; singular: string; plural: string }[] = [
  { id: "client", label: "Por cliente", singular: "Cliente", plural: "Clientes" },
  { id: "executive", label: "Por ejecutivo", singular: "Ejecutivo", plural: "Ejecutivos" },
  { id: "channel", label: "Por canal", singular: "Canal", plural: "Canales" },
  { id: "coordinator", label: "Por coordinador", singular: "Coordinador", plural: "Coordinadores" }
];

export const GROUPING_BY_ID = Object.fromEntries(GROUPINGS.map((g) => [g.id, g])) as Record<
  Grouping,
  (typeof GROUPINGS)[number]
>;

export const AGREEMENT_VIEWS: { id: AgreementView; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "broken", label: "Incumplidos" },
  { id: "dueSoon", label: "Vencen en 7 días" },
  { id: "fulfilled", label: "Cumplidos" }
];

/** Filtro de los PNA por días pendientes: deja los que llevan más de `minDays`. */
export const PNA_AGES: { id: PnaAge; label: string; minDays: number | null }[] = [
  { id: "all", label: "Todos", minDays: null },
  { id: "over3", label: "Más de 3 días", minDays: 3 },
  { id: "over7", label: "Más de 7 días", minDays: 7 }
];

export const CURVE_REFERENCES: { value: CurveReference; label: string }[] = [
  { value: "median", label: "Mediana 6 meses" },
  { value: "previous", label: "Mes anterior" },
  { value: "both", label: "Ambas" }
];

/** Orden del detalle de acuerdos: incumplidos → pendientes → cumplidos. */
export const STATUS_ORDER: Record<AgreementStatus, number> = {
  BROKEN: 0,
  PENDING: 1,
  FULFILLED: 2
};

/** La barra de avance de "Clientes frente a su meta" llega hasta el 130% de la meta. */
export const AVANCE_SCALE = 1.3;

/** Atraso desde el que el chip de un acuerdo pasa de alerta a crítico. */
export const LATE_DAYS_CRIT = 15;

/** "Vencen en 7 días": pendientes que vencen a 7 días o menos del corte. */
export const DUE_SOON_DAYS = 7;

/** Tiempo pendiente de un PNA: neutro hasta 3 días, alerta de 4 a 7, crítico con más de 7. */
export const PNA_DAYS_WARN = 3;
export const PNA_DAYS_CRIT = 7;

/** Cumplimiento de acuerdos (pagado de lo vencido): ≥80% bien, ≥60% alerta. */
export const AGREEMENT_COMPLIANCE_OK = 0.8;
export const AGREEMENT_COMPLIANCE_WARN = 0.6;

/** Texto por tono, con su variante oscura (mismos tonos que StatusChip). */
export const TONE_TEXT: Record<Tone, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  crit: "text-rose-600 dark:text-rose-400"
};

export const FOOT_NOTE =
  "Forecast = recaudo a la fecha de corte + saldo de los acuerdos de pago pendientes que vencen antes del cierre del mes. Ritmo a hoy = lo que ya se debería llevar para cumplir la meta si el mes se comporta como uno típico. PNA = pago identificado que todavía no se aplica a facturas.";
