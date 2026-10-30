/* API de Alertas de bloqueo (`/portfolio/blocking-alerts/*`): el backend clasifica,
   filtra, ordena y pagina; el front solo pinta. El detalle (cliente y punto de venta)
   todavía lee datos simulados (src/modules/blockingAlerts/mocked-data.ts). */

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

/* Detalle (datos simulados hasta conectar las subtareas 03 y 04). */

/** Fila del listado: un cliente o uno de sus puntos de venta (ship-to). */
export interface IBlockingAlertRow extends IBlockingAlertAging {
  client_id: string;
  client_name: string;
  /** null en la fila de un cliente. */
  ship_to_code: string | null;
  name: string;
  status: BlockingAlertStatus;
  /** Días que lleva bloqueado; null si no lo está. */
  blocked_days: number | null;
  /** Días que faltan para el bloqueo; null si no está por bloquearse. */
  days_to_block: number | null;
  /** Mora de la factura vencida más antigua (0 sin vencidas). */
  oldest_overdue_days: number;
  /** Solo en la fila de un cliente. */
  points_of_sale_count: IBlockingAlertPosCount | null;
}

export interface IBlockingAlertInvoice {
  id: string;
  number: string;
  /** Punto de venta de la factura en el detalle de un cliente; null en el de un punto de venta. */
  ship_to_name: string | null;
  due_date: string;
  /** Negativo: días que faltan para el vencimiento. */
  days_overdue: number;
  amount: number;
}

export interface IBlockingAlertCreditNote {
  id: string;
  type: string;
  date: string;
  amount: number;
}

export interface IBlockingAlertPayment {
  id: string;
  date: string;
  amount: number;
}

export interface IBlockingAlertBalance {
  id: string;
  date: string;
  status: string;
  amount: number;
}

/** Pagada en el ERP y pendiente de depurar en SAP: no suma a la cartera ni se cobra. */
export interface IBlockingAlertPaidInvoice {
  id: string;
  number: string;
  paid_at: string;
  amount: number;
}

export interface IBlockingAlertDetail extends IBlockingAlertRow {
  /** Corte de la cartera (asunto del estado de cuenta). */
  cutoff_at: string;
  contact_name: string;
  /** Vencidas y por vencer. */
  invoices: IBlockingAlertInvoice[];
  credit_notes: IBlockingAlertCreditNote[];
  available_payments: IBlockingAlertPayment[];
  pending_balances: IBlockingAlertBalance[];
  paid_invoices: IBlockingAlertPaidInvoice[];
  /** Vacío en el detalle de un punto de venta. */
  points_of_sale: IBlockingAlertRow[];
}
