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
 * Datos de ejemplo (utils/tower-mock, misma forma que la respuesta real) en
 * vez del API: sólo para desarrollar sin backend (NEXT_PUBLIC_TOWER_MOCK=true).
 */
export const USE_TOWER_MOCK = process.env.NEXT_PUBLIC_TOWER_MOCK === "true";

/**
 * Tableros del encabezado ("cambiar tablero"). Los que no tienen vista se
 * pueden elegir y muestran "en diseño"; uno en otra ruta entra con `href`.
 * Para agregar uno: su vista en BOARD_VIEWS (recaudo-view) y `enabled: true`.
 */
export const BOARDS: Board[] = [
  { id: "torre", enabled: true },
  { id: "tramo", enabled: false },
  { id: "apl", enabled: false },
  { id: "nov", enabled: false }
];

export const DEFAULT_BOARD: BoardId = "torre";

/**
 * Agrupaciones de las tablas "frente a su meta". Textos (opción, singular y título de la
 * tabla) en `collections.groupings.<id>`.
 */
export const GROUPINGS: Grouping[] = ["client", "executive", "channel", "coordinator"];

/** Vistas del detalle de acuerdos; nombre en `collections.agreementViews.<id>`. */
export const AGREEMENT_VIEWS: AgreementView[] = ["all", "broken", "dueSoon", "fulfilled"];

/**
 * Filtro de los PNA por días pendientes: deja los que llevan más de `minDays`. Nombre en
 * `collections.pnaAges.<id>`.
 */
export const PNA_AGES: { id: PnaAge; minDays: number | null }[] = [
  { id: "all", minDays: null },
  { id: "over3", minDays: 3 },
  { id: "over7", minDays: 7 }
];

/** Referencias de "Recaudo por día"; nombre en `collections.curveReferences.<valor>`. */
export const CURVE_REFERENCES: CurveReference[] = ["median", "previous", "both"];

/*
 * Estados en plural (chips y resumen): `collections.statusPlural.<estado>`. No se arma
 * sumando "s" a la etiqueta del API.
 */

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
