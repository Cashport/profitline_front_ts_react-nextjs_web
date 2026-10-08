/* Torre de control de recaudo (/dashboard).

   PROPUESTA DE CONTRATO, pendiente de confirmar con backend:
   - GET /collection/tower/project/:projectId?{filtros}             → ICollectionTower
   - GET /collection/tower/project/:projectId/export?table=…&{filtros} → .xlsx (blob)

   El backend calcula todo (estados de acuerdos, forecast, mediana, PNA); el
   front sólo agrupa, ordena y pinta. La definición exacta de cada cifra está
   en modules/recaudoModule/utils/tower-mock.ts, que arma esta misma respuesta
   con los datos de ejemplo mientras el endpoint no exista.

   Fechas: "YYYY-MM-DD" para días y ISO con hora para corte y pagos. Montos en
   pesos. Ninguna fecha sale del reloj del navegador: todo se mide contra el
   corte que manda el API. */

/** Estado de un acuerdo de pago a la fecha de corte. Los parciales vencidos cuentan como BROKEN. */
export type AgreementStatus = "FULFILLED" | "BROKEN" | "PENDING";

/**
 * Serie o estado de un gráfico. Nombre y color los define el backend; el color
 * es uno solo para los dos temas, así que tiene que leerse sobre fondo claro y
 * sobre fondo oscuro.
 */
export interface ITowerSeries {
  key: string;
  label: string;
  /** Hex, p. ej. "#FF5500". */
  color: string;
}

export interface ITowerCatalogItem {
  id: string;
  name: string;
}

export interface ITowerCoordinator extends ITowerCatalogItem {
  managementId: string;
}

export interface ITowerExecutive extends ITowerCatalogItem {
  coordinatorId: string;
}

export interface ITowerClient extends ITowerCatalogItem {
  nit: string;
  executiveId: string;
  channelId: string;
}

/** Estructura comercial del proyecto: opciones de los filtros y nombres de las tablas. */
export interface ITowerCatalogs {
  /** Gerencias. */
  managements: ITowerCatalogItem[];
  coordinators: ITowerCoordinator[];
  executives: ITowerExecutive[];
  /** Canales (KAM). */
  channels: ITowerCatalogItem[];
  /** Todos los clientes del proyecto, no sólo los filtrados: alimentan el buscador. */
  clients: ITowerClient[];
}

export interface ITowerPeriod {
  /** "2026-09" */
  key: string;
  /** "Septiembre 2026" */
  label: string;
  /** Días del mes. */
  days: number;
  /** Último día con datos: el del corte en el mes en curso, `days` en un mes cerrado. */
  cutoffDay: number;
  /** Mes en curso: hay proyección y forecast por delante. */
  open: boolean;
}

/** Recaudo frente a la meta (tarjeta principal). */
export interface ITowerSummary {
  /** Recaudo a la fecha de corte. */
  collected: number;
  goal: number;
  /**
   * Recaudo + saldo de los acuerdos pendientes que vencen antes del cierre; en
   * un mes cerrado, igual al recaudo. Es la suma del forecast de cada cliente.
   */
  forecast: number;
  /** Cumplimiento promedio (0–1) de los 3 meses anteriores al mismo día del mes; null sin historia. */
  complianceAvg3: number | null;
  /** Saldo de los acuerdos pendientes que vencen antes del cierre. */
  pendingAgreements: number;
  /** Saldo de los acuerdos incumplidos. */
  brokenAgreements: number;
  series: {
    collected: ITowerSeries;
    pendingAgreements: ITowerSeries;
    brokenAgreements: ITowerSeries;
  };
}

/** Aplicación del recaudo. Los montos aplicado / sin aplicar salen de `daily`. */
export interface ITowerApplication {
  /** Días promedio (ponderado por valor) entre la entrada del pago y su aplicación. */
  leadTimeDays: number | null;
  previousLeadTimeDays: number | null;
  /** Fracción (0–1) del valor aplicado en 2 días o menos. */
  appliedWithin2Days: number | null;
  series: {
    applied: ITowerSeries;
    /** Identificado sin aplicar (PNA). */
    unapplied: ITowerSeries;
  };
}

/** Recaudo del mes que corresponde a un tramo de mora. No aplica el filtro `aging`. */
export interface ITowerAgingBucket extends ITowerSeries {
  amount: number;
}

/** Un día del mes en "Recaudo por día". */
export interface ITowerDailyPoint {
  day: number;
  /** "YYYY-MM-DD" */
  date: string;
  /** Recaudo del día ya aplicado; null después del corte. */
  applied: number | null;
  /** Recaudo del día identificado sin aplicar (PNA); null después del corte. */
  unapplied: number | null;
  /** Recaudo acumulado; null después del corte. */
  cumulative: number | null;
  /** Acumulado proyectado, del día de corte al cierre; null antes del corte y en mes cerrado. */
  projected: number | null;
  /** Mediana del acumulado de los 6 meses anteriores a ese día; null sin historia. */
  median6m: number | null;
  /** Acumulado del mes anterior a ese día; null sin historia. */
  previousMonth: number | null;
}

/** Acuerdos con compromiso en un día del mes. No aplica el filtro `segments`. */
export interface ITowerAgreementsDay {
  /** "YYYY-MM-DD" */
  date: string;
  /** Monto acordado y número de acuerdos por estado; sin llave si no hay. */
  values: Partial<Record<AgreementStatus, { amount: number; count: number }>>;
}

export interface ITowerAgreement {
  id: string;
  clientId: string;
  /** Fecha comprometida, "YYYY-MM-DD". */
  dueDate: string;
  /** Fecha en que se cargó el acuerdo. */
  loadedAt: string;
  /** Número de reprogramaciones. */
  reschedules: number;
  status: AgreementStatus;
  agreed: number;
  /** Pagado a la fecha de corte. */
  paid: number;
  balance: number;
  /** Días de atraso: sólo los incumplidos; 0 en los demás. */
  lateDays: number;
  /** Días del corte a la fecha comprometida (negativo si ya pasó). */
  daysToDue: number;
}

/** Un cliente frente a su meta. El front agrupa por ejecutivo, canal o coordinador sumando. */
export interface ITowerClientRow {
  clientId: string;
  collected: number;
  goal: number;
  forecast: number;
  /** Fracción de la meta que un mes típico ya llevaría al día de corte; 1 en un mes cerrado. */
  pace: number;
  /** Saldo de acuerdos pendientes que vencen antes del cierre. */
  pendingAgreements: number;
  /** Saldo de acuerdos incumplidos. */
  brokenAgreements: number;
  /** Acordado de los acuerdos ya vencidos (cumplidos + incumplidos). */
  overdueAgreed: number;
  /** Pagado de esos mismos acuerdos: overduePaid / overdueAgreed = % de cumplimiento. */
  overduePaid: number;
  overdueCount: number;
}

/** Pago identificado que todavía no se aplica a facturas. Incluye los del mes anterior que siguen abiertos. */
export interface ITowerUnappliedPayment {
  id: string;
  clientId: string;
  /** Fecha y hora del pago (ISO). */
  paidAt: string;
  amount: number;
  /** Horas desde el pago hasta el corte. */
  pendingHours: number;
  /** Detalle del pago en Cashport; null mientras la ruta no esté definida. */
  url: string | null;
}

export interface ICollectionTower {
  /** Fecha y hora del corte (ISO). En un mes cerrado, el último día a las 23:59. */
  cutoffAt: string;
  period: ITowerPeriod;
  /** Periodos elegibles en el selector (los últimos 6). */
  periods: { key: string; label: string }[];
  catalogs: ITowerCatalogs;
  summary: ITowerSummary;
  application: ITowerApplication;
  agingBuckets: ITowerAgingBucket[];
  /** Todos los días del mes, del 1 al último. */
  daily: ITowerDailyPoint[];
  /** Estados de acuerdo en el orden en que se apilan las barras (de abajo hacia arriba). */
  agreementStatuses: (ITowerSeries & { key: AgreementStatus })[];
  agreementsByDay: ITowerAgreementsDay[];
  agreements: ITowerAgreement[];
  clients: ITowerClientRow[];
  unappliedPayments: ITowerUnappliedPayment[];
}

/** Segmento elegido en "Acuerdos de pago por día": un día entero (status null) o un estado de ese día. */
export interface ITowerAgreementSegment {
  date: string;
  status: AgreementStatus | null;
}

/** Filtros del tablero. Todos cruzan todo el tablero. */
export interface ICollectionTowerQuery {
  /** "YYYY-MM"; null = mes en curso. */
  period: string | null;
  management: string | null;
  coordinator: string | null;
  executive: string | null;
  channel: string | null;
  /** Cliente por nombre o NIT. */
  search: string;
  /** Key del tramo de mora elegido en "Recaudo por tramo". */
  aging: string | null;
  segments: ITowerAgreementSegment[];
}

export type TowerExportTable = "goals" | "agreements" | "executives" | "unapplied";

/**
 * Estado de la tabla que se descarga: el Excel trae lo que se ve (mismos
 * filtros, agrupación, vista y orden), con $ / % / dd/mm/yyyy como formatos
 * nativos, encabezado fijo, autofiltro y fila de total en negrita.
 */
export interface ITowerExportState {
  groupBy?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  view?: string;
  pnaAge?: string;
  coordinators?: string[];
}
