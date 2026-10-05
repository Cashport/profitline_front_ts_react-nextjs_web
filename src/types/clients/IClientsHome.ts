/* Home de Clientes (/clientes/all). Respuestas de
   GET /portfolio/clients-home/project/:id/{summary,clients,client/:uuid/agreements}. */

export type ClientsHomeAgingBucket =
  | "corriente"
  | "1-30"
  | "31-60"
  | "61-90"
  | "91-120"
  | "+120"
  | "+360";

export type ClientsHomeAgingAmounts = Record<ClientsHomeAgingBucket, number>;

export type ClientsHomeSortColumn =
  | "name"
  | "portfolio"
  | "pastDue"
  | "pastDuePct"
  | "creditNotes"
  | "unappliedPayments"
  | "collected"
  | "collectedPct"
  | "forecastPct"
  | `aging:${ClientsHomeAgingBucket}`;

/** Semáforo del forecast: cumple (≥100%), cerca (≥80%), en riesgo. */
export type ClientsHomeForecastStatus = "ok" | "near" | "risk";

export interface IClientsHomeAmountCount {
  amount: number;
  count: number;
}

export interface IClientsHomeCollection {
  collected: number;
  /** Meta = presupuesto; null si el cliente no tiene. */
  goal: number | null;
  collectedPct: number | null;
  /** Acuerdos vigentes del mes: suman al forecast. */
  agreementsActive: number;
  /** Acuerdos incumplidos del mes: se muestran pero no suman. */
  agreementsBroken: number;
  forecast: number;
  forecastPct: number | null;
}

export interface IClientsHomeRunInfo {
  runId: string;
  /** Fecha y hora de la foto. */
  cutoffAt: string;
  /** Fecha contra la que se calculan edades: el corte o el fin de mes. */
  referenceDate: string;
  projectedToMonthEnd: boolean;
  dueFrom: string | null;
  dueTo: string | null;
}

export interface IClientsHomeTotals {
  clients: number;
  portfolio: number;
  pastDue: number;
  pastDuePct: number | null;
  aging: ClientsHomeAgingAmounts;
  creditNotes: IClientsHomeAmountCount;
  unappliedPayments: IClientsHomeAmountCount;
  novelties: IClientsHomeAmountCount;
  collection: IClientsHomeCollection;
}

export interface IClientsHomeCatalogItem {
  /** Valor a enviar en el filtro; "__none__" = sin dato. */
  key: string;
  name: string | null;
  clients: number;
}

export interface IClientsHomeSummary extends IClientsHomeRunInfo {
  totals: IClientsHomeTotals;
  markets: IClientsHomeCatalogItem[];
  executives: IClientsHomeCatalogItem[];
}

export interface IClientsHomeRow {
  clientId: string;
  clientUuid: string | null;
  clientName: string;
  projectId: number;
  executive: { email: string | null; name: string | null };
  market: { key: string | null; name: string | null };
  portfolio: number;
  pastDue: number;
  pastDuePct: number | null;
  /** Facturas en cartera por tramo. */
  aging: ClientsHomeAgingAmounts;
  /** Tooltip de cartera: saldos con su signo, notas en negativo; total = suma. */
  breakdown: {
    invoices: ClientsHomeAgingAmounts;
    balances: ClientsHomeAgingAmounts;
    creditNotes: ClientsHomeAgingAmounts;
    total: ClientsHomeAgingAmounts;
  };
  creditNotes: IClientsHomeAmountCount;
  unappliedPayments: IClientsHomeAmountCount;
  novelties: IClientsHomeAmountCount;
  collection: IClientsHomeCollection & { compliancePct: number | null };
}

export interface IClientsHomeClients extends IClientsHomeRunInfo {
  agingFocus: ClientsHomeAgingBucket | null;
  /** Clientes por semáforo, antes de aplicar el filtro rápido de Forecast. */
  forecastStatusCounts: Record<ClientsHomeForecastStatus, number>;
  rows: IClientsHomeRow[];
  totals: IClientsHomeTotals & { focusPortfolio: number | null };
  pagination: { total: number; page: number; limit: number };
}

/** 202: la foto de la versión actual todavía se está generando. */
export interface IClientsHomePending {
  snapshotPending: true;
}

export type ClientAgreementStatus =
  | "EXPIRED"
  | "DUE_SOON"
  | "ACTIVE"
  | "FULFILLED"
  | "PARTIALLY_FULFILLED";

export interface IClientAgreement {
  id: number;
  paymentDate: string | null;
  amount: number;
  status: ClientAgreementStatus;
  /** Días de mora (vencido) o días que faltan (vigente / próximo a vencer). */
  days: number | null;
}

export interface IClientAgreements {
  clientUuid: string;
  clientName: string;
  referenceDate: string;
  agreements: IClientAgreement[];
  compliance: { fulfilled: number; partial: number; broken: number; pct: number | null };
}

/** Filtros que viajan al backend. */
export interface IClientsHomeQuery {
  projectToMonthEnd: boolean;
  markets: string[];
  executives: string[];
  dueFrom: string | null;
  dueTo: string | null;
}

export interface IClientsHomeListQuery extends IClientsHomeQuery {
  search: string;
  aging: ClientsHomeAgingBucket | null;
  forecastStatuses: ClientsHomeForecastStatus[];
  sortBy: ClientsHomeSortColumn;
  sortDir: "asc" | "desc";
  page: number;
  limit: number;
}
