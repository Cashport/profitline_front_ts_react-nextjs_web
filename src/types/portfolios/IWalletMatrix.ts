/**
 * Contrato de la Matriz de Control de cartera.
 *
 * La respuesta describe una FOTO generada por un worker, no el estado en
 * vivo de la cartera: por eso viaja siempre el bloque `snapshot` con la
 * fecha del corte, y por eso la pantalla debe mostrarla.
 */

export const AGING_BUCKETS = ["corriente", "1-30", "31-60", "61-90", "91-120", "+120"] as const;

export type AgingBucket = (typeof AGING_BUCKETS)[number];

/** Etiquetas de las columnas, tal como se ven en la tabla. */
export const AGING_LABELS: Record<AgingBucket, string> = {
  corriente: "Corriente",
  "1-30": "1–30",
  "31-60": "31–60",
  "61-90": "61–90",
  "91-120": "91–120",
  "+120": "+120"
};

/**
 * Colores de la barra apilada.
 *
 * Viven en el frontend a propósito: el backend devuelve estado y monto, y
 * la representación visual es decisión de esta capa (CA02).
 */
export const STATUS_COLORS: Record<string, string> = {
  CONCILIADO: "#0085FF",
  CON_NOVEDAD: "#FF6B00",
  SIN_CONCILIAR: "#969696",
  SALDO: "#3D3D3D",
  SALDO_FACTURA: "#3D3D3D",
  GLOSADO: "#00C2FF",
  DEVOLUCION: "#F4076A",
  VENCIDA: "#FF6B00",
  CORRIENTE: "#A9BA43",
  PAGADA: "#22C55E",
  DESCONOCIDO: "#C4C4C4"
};

export const STATUS_FALLBACK_COLOR = "#C4C4C4";

export interface IMatrixCellStatus {
  status: string;
  statusLabel: string;
  amount: number;
  count: number;
}

export interface IMatrixCell {
  total: number;
  count: number;
  statuses: IMatrixCellStatus[];
}

export interface IMatrixRow {
  clientId: string;
  clientName: string | null;
  clientUuid: string | null;
  responsibleName: string | null;
  responsibleEmail: string | null;
  cells: Record<AgingBucket, IMatrixCell>;
  total: number;
  invoices: number;
  overdueAmount: number;
  overduePercentage: number;
}

export interface ISnapshotMeta {
  runId: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  trigger: "CRON" | "MANUAL";
  startedAt: string;
  finishedAt: string | null;
  lastUpdatedAt: string | null;
  cutoffAt: string;
  factsCount: number;
  balancesAgedByProxy: number;
  totalAmount: number;
  durationMs: number | null;
}

export interface IMatrixCutoff {
  date: string;
  calculateEndMonth: boolean;
  projected?: boolean;
}

export interface IMatrixTotals {
  byAging: Record<AgingBucket, { total: number; count: number }>;
  total: number;
  invoices: number;
}

export interface IWalletMatrix {
  columns: AgingBucket[];
  rows: IMatrixRow[];
  totals: IMatrixTotals;
  pagination: { page: number; limit: number; totalClients: number };
  snapshot: ISnapshotMeta | null;
  cutoff: IMatrixCutoff;
}

export interface IWalletMatrixDetailRow {
  _id: string;
  source: "INVOICE" | "BALANCE";
  clientId: string;
  clientUuid: string | null;
  clientName: string | null;
  aging: AgingBucket;
  daysOverdue: number;
  agingDate: string | null;
  agingSource: string;
  statusKey: string;
  statusLabel: string;
  amount: number;
  documentId: string;
  erpId: string | null;
  documentDate: string | null;
  expirationDate: string | null;
  noveltyId: number | null;
  noveltyType: string | null;
  noveltyStatus: string | null;
  ticketId: string | null;
  responsibleName: string | null;
  responsibleEmail: string | null;
  kamName: string | null;
  noveltyAssignedTo: string | null;
  noveltyAssignedToName: string | null;
}

export interface IWalletMatrixDetail {
  rows: IWalletMatrixDetailRow[];
  totals: { amount: number; count: number };
  pagination: { page: number; limit: number; total: number };
  snapshot: ISnapshotMeta | null;
  cutoff: IMatrixCutoff;
}

export interface IWalletMatrixGroup {
  statusKey: string;
  statusLabel: string;
  noveltyId: number | null;
  noveltyType: string | null;
  noveltyStatus: string | null;
  clientId: string;
  clientName: string | null;
  responsibleName: string | null;
  ticketId: string | null;
  total: number;
  invoices: number;
  /** Reparto del grupo entre los seis tramos, en el orden de AGING_BUCKETS. */
  byAging: number[];
}

export interface IWalletMatrixGroups {
  groups: IWalletMatrixGroup[];
  /** Grupos que existen con los filtros actuales; `groups` viene acotado. */
  total: number;
  limit: number;
  snapshot: ISnapshotMeta | null;
}

export interface IWalletMatrixStatus {
  current: ISnapshotMeta | null;
  running: ISnapshotMeta | null;
  isRefreshing: boolean;
}

/** Columnas por las que ordena el servidor; los tramos usan su AgingBucket. */
export type WalletMatrixSortBy = "client_name" | AgingBucket | "total" | "overdue_percentage";

export type WalletMatrixSortDir = "asc" | "desc";

/**
 * Query de GET /portfolio/matrix. Las listas viajan separadas por coma.
 *
 * /portfolio/matrix/groups reutiliza el subconjunto `IWalletMatrixSharedFilters`
 * (los mismos siete filtros del modal más el buscador) y le suma runId,
 * clientId y aging.
 */
export interface IWalletMatrixFilters {
  /** NITs de cliente. */
  clients?: string[];
  /** statusKey de factura (CONCILIADO, CON_NOVEDAD, …). */
  status?: string[];
  /** Ids de invoice_incident_motive. */
  noveltyType?: number[];
  /** Correos del ejecutivo responsable. */
  executive?: string[];
  zones?: number[];
  lines?: number[];
  sublines?: number[];
  channels?: number[];
  holdings?: number[];
  clientGroup?: number[];
  /** Valores canónicos de GET /invoice/incident-list/filters, no texto libre. */
  coordinator?: string[];
  market?: string[];
  kam?: string[];
  kam_lider?: string[];
  /** Texto libre: cliente, NIT o responsable. */
  search?: string;
  /** Ordena el conjunto completo filtrado, no sólo la página cargada. */
  sort_by?: WalletMatrixSortBy;
  sort_dir?: WalletMatrixSortDir;
  /** Proyecta las edades al último día del mes en curso. */
  calculateEndMonth?: boolean;
}

/**
 * Filtros que /portfolio/matrix y /portfolio/matrix/groups aceptan por igual:
 * los del modal de la matriz más el buscador.
 *
 * Quedan fuera los que sólo entiende /portfolio/matrix (listas de cliente,
 * zona, línea… y el orden), para que paginar u ordenar la matriz no invalide
 * la caché de los grupos.
 */
export type IWalletMatrixSharedFilters = Pick<
  IWalletMatrixFilters,
  | "status"
  | "noveltyType"
  | "executive"
  | "coordinator"
  | "market"
  | "kam"
  | "kam_lider"
  | "search"
>;

/** Acotado de GET /portfolio/matrix/groups a una foto, cliente y tramo. */
export interface IWalletMatrixGroupsScope {
  runId?: string;
  clientId?: string;
  aging?: AgingBucket;
  calculateEndMonth?: boolean;
}

/** Celda seleccionada en la matriz. */
export interface ISelectedCell {
  clientId: string;
  clientName: string;
  aging: AgingBucket;
  total: number;
}
