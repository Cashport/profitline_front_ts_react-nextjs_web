/* Contrato esperado del API de Alertas de bloqueo (aún no existe): el módulo lee
   datos simulados con esta misma forma (src/modules/blockingAlerts/mocked-data.ts).
   Montos en pesos y fechas ISO (yyyy-mm-dd), como en el resto de la cartera. */

/** blocked: facturas de +60 días o cupo superado · warning: alguna vencida desde 45 días. */
export type BlockingAlertStatus = "blocked" | "warning" | "ok";

/** Cartera por tramo. `past_due` negativa es saldo a favor (y los tramos vencidos van en 0). */
export interface IBlockingAlertAging {
  portfolio: number;
  current: number;
  past_due: number;
  past_due_1_60: number;
  past_due_60_plus: number;
}

/** Puntos de venta de un cliente por estado. */
export interface IBlockingAlertPosCount {
  total: number;
  blocked: number;
  warning: number;
}

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

export interface IBlockingAlertsTotals extends IBlockingAlertAging {
  count: number;
  /** Bloqueados más por bloquear. */
  alerts: number;
}

export interface IBlockingAlertsResponse {
  cutoff_at: string;
  totals: { clients: IBlockingAlertsTotals; points_of_sale: IBlockingAlertsTotals };
  clients: IBlockingAlertRow[];
  points_of_sale: IBlockingAlertRow[];
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
