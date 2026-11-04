/* API de Alertas de bloqueo (`/portfolio/blocking-alerts/*`): el backend clasifica,
   filtra, ordena y pagina; el front solo pinta. */

export type BlockingAlertStatus = "blocked" | "to_be_blocked" | "up_to_date";

/** Cartera por tramo. `pastDue` negativa es saldo a favor. */
export interface IBlockingAlertAging {
  portfolio: number;
  current: number;
  pastDue: number;
  pastDue1To60: number;
  pastDueOver60: number;
}

/** Puntos de venta de un cliente por estado. */
export interface IBlockingAlertPosCount {
  total: number;
  blocked: number;
  to_be_blocked: number;
}

/** Conteos por estado de una vista; `alerts` = bloqueados + por bloquear. */
export type IBlockingAlertsCounts = Record<BlockingAlertStatus | "all" | "alerts", number>;

export interface IBlockingAlertsSummary {
  cutoffAt: string;
  referenceDate: string;
  rules: { blockDays: number; warningDays: number };
  /** Solo al pedir el resumen de un cliente (`client_uuid`). */
  client: { clientUuid: string; name: string } | null;
  portfolio: IBlockingAlertAging;
  clients: IBlockingAlertsCounts;
  pointsOfSale: IBlockingAlertsCounts;
}

interface IBlockingAlertsState extends IBlockingAlertAging {
  status: BlockingAlertStatus;
  statusLabel: string;
  blockReason: "overdue" | "quota" | null;
  blockedDays: number | null;
  daysToBlock: number | null;
  oldestOverdueDays: number;
  /** Pago vencido en alerta; cartera si está al día. */
  amount: number;
}

export interface IBlockingAlertsClient extends IBlockingAlertsState {
  clientUuid: string | null;
  clientId: string;
  name: string;
  pointsOfSale: IBlockingAlertPosCount;
  /** Punto de venta que coincide con la búsqueda cuando el cliente no coincide por nombre. */
  matchedPointOfSale: { code: string | null; name: string } | null;
}

export interface IBlockingAlertsPointOfSale extends IBlockingAlertsState {
  /** null: documentos sin ship-to, el punto de venta es el mismo cliente. */
  code: string | null;
  name: string;
  clientUuid: string | null;
  clientId: string;
  clientName: string;
}

export interface IBlockingAlertsPage<T> {
  cutoffAt: string;
  rows: T[];
  pagination: { total: number; page: number; limit: number };
}

/** Filtros del listado: se envían tal cual al API. */
export interface IBlockingAlertsListQuery {
  /** Acota los puntos de venta a un cliente. */
  clientUuid?: string;
  status: BlockingAlertStatus | null;
  search: string;
  sortBy: "urgency" | "pastDue" | "oldestOverdueDays" | "name";
  sortDir?: "asc" | "desc";
  page: number;
  limit: number;
}

/* Detalle de un cliente o de un punto de venta. */

export type BlockingAlertsDocumentTab =
  | "all"
  | "past_due"
  | "credit_notes"
  | "available_payments"
  | "balances"
  | "paid_invoices";

/** Conteo y suma de todos los documentos de una pestaña (no solo de la página). */
export interface IBlockingAlertsTabSummary {
  count: number;
  total: number;
}

export interface IBlockingAlertsDetail extends IBlockingAlertsState {
  cutoffAt: string;
  referenceDate: string;
  client: { clientUuid: string; clientId: string; name: string };
  /** null en el detalle del cliente. */
  pointOfSale: { code: string | null; name: string } | null;
  /** Nombre del punto de venta o del cliente. */
  name: string;
  /** Sus puntos de venta y los más urgentes; null en el detalle de un punto de venta. */
  pointsOfSale: (IBlockingAlertPosCount & { top: IBlockingAlertsPointOfSale[] }) | null;
  tabs: Record<BlockingAlertsDocumentTab, IBlockingAlertsTabSummary>;
}

interface IBlockingAlertsDocumentBase {
  id: string;
  number: string | null;
  amount: number;
}

export interface IBlockingAlertsInvoice extends IBlockingAlertsDocumentBase {
  dueDate: string | null;
  /** Negativo: días que faltan para el vencimiento. */
  daysOverdue: number;
  /** Punto de venta de la factura en el detalle del cliente; null en el de un punto de venta. */
  pointOfSale: { code: string; name: string } | null;
}

export interface IBlockingAlertsCreditNote extends IBlockingAlertsDocumentBase {
  type: string | null;
  date: string | null;
}

export interface IBlockingAlertsPayment extends IBlockingAlertsDocumentBase {
  description: string | null;
  date: string | null;
}

export interface IBlockingAlertsBalance extends IBlockingAlertsDocumentBase {
  status: string | null;
  date: string | null;
}

/** Pagada en Cashport y pendiente de depurar en SAP: no suma a la cartera ni se cobra. */
export interface IBlockingAlertsPaidInvoice extends IBlockingAlertsDocumentBase {
  /** Fecha del pago aplicado; null si se marcó pagada a mano. */
  paidAt: string | null;
}

export type IBlockingAlertsDocument =
  | IBlockingAlertsInvoice
  | IBlockingAlertsCreditNote
  | IBlockingAlertsPayment
  | IBlockingAlertsBalance
  | IBlockingAlertsPaidInvoice;

export interface IBlockingAlertsDocuments {
  tab: BlockingAlertsDocumentTab;
  summary: IBlockingAlertsTabSummary;
  rows: IBlockingAlertsDocument[];
  pagination: { total: number; page: number; limit: number };
}
