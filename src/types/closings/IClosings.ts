/* Cierres de cartera: foto fija de la cartera y el recaudo al corte de cada mes. Sale de la
   plantilla que carga cada proyecto (hojas Cartera y Pagos), no de la cartera viva de Cashport.
   Los atributos del cliente (ejecutivo, mercado, KAM…) se leen de la tabla client por NIT. */

/** Tramos de edad tal como vienen en la columna "Vencimiento" de la plantilla. */
export type AgingBucket = "Corriente" | "0-30" | "31-60" | "61-90" | "91-120" | "+120";

export const AGING_BUCKETS: AgingBucket[] = [
  "Corriente",
  "0-30",
  "31-60",
  "61-90",
  "91-120",
  "+120"
];

/** Atributos del cliente que filtran el tablero (tabla client). */
export interface IClosingClientInfo {
  nit: string;
  client: string;
  market: string;
  kam: string;
  kamLeader: string;
  executive: string;
  coordinator: string;
  holding: string;
}

/** Cartera de un cliente en un cierre, agregada por tipo, causal y tramo. */
export interface IClosingPortfolioRow extends IClosingClientInfo {
  /** Cierre "2026-10". */
  period: string;
  /** Columna Tipo de la plantilla: Factura, NC, Saldos, ND, Pago, Pendiente… */
  kind: string;
  /** Causal: "Factura" en facturas, Segmento en notas y Tipo saldo en saldos abiertos. */
  balanceType: string;
  bucket: AgingBucket;
  amount: number;
  documents: number;
}

/** Recaudo de un cliente en el mes del cierre, por estado al corte. */
export interface IClosingPaymentRow extends IClosingClientInfo {
  period: string;
  /** "Compensado" o el estado pendiente que reportó la compañía. */
  status: string;
  amount: number;
  payments: number;
}

/** Cartera y recaudo de un cliente en cada cierre (para la evolución y la ficha). */
export interface IClosingHistoryRow {
  period: string;
  nit: string;
  buckets: Record<AgingBucket, number>;
  total: number;
  collected: number;
}

export interface IClosingComment {
  id: number;
  period: string;
  nit: string;
  client_name: string | null;
  comment: string;
  created_by_email: string;
  created_by_name: string | null;
  created_at: string;
  updated_at: string | null;
}

export type ClosingStatus = "PROCESSING" | "READY" | "FAILED";

export interface IClosingRowError {
  sheet: string;
  row: number | null;
  column: string | null;
  message: string;
}

export interface IClosingErrorDetail {
  errors: IClosingRowError[];
  error_count: number;
  missing_clients: { nit: string; rows: number; amount: number }[];
  warnings: string[];
}

/** Cierre cargado (GET /portfolio-closings). */
export interface IClosingInfo {
  id: number;
  period: string;
  file_name: string | null;
  status: ClosingStatus;
  error_message: string | null;
  error_detail: IClosingErrorDetail | null;
  document_rows: number;
  payment_rows: number;
  portfolio_amount: number;
  payment_amount: number;
  created_by_email: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface IClosingClientApi {
  nit: string;
  name: string;
  executive_email: string | null;
  executive_name: string | null;
  market: string | null;
  kam: string | null;
  kam_lider: string | null;
  coordinator: string | null;
  holding: string | null;
}

/** GET /portfolio-closings/data?period=AAAA-MM */
export interface IClosingDataResponse {
  closing: IClosingInfo;
  previous_period: string | null;
  clients: IClosingClientApi[];
  /** [period, nit, kind, cause, bucket, amount, documents] */
  portfolio: [string, string, string, string, string, number, number][];
  /** [period, nit, status, amount, payments] */
  payments: [string, string, string, number, number][];
}

/** GET /portfolio-closings/history */
export interface IClosingHistoryResponse {
  /** [period, nit, Corriente, 0-30, 31-60, 61-90, 91-120, +120, collected] */
  rows: [string, string, number, number, number, number, number, number, number][];
  /** Pagos que no quedaron compensados al cierre:
      [period, nit, status, amount, payment_date, compensation_date, erp_id] */
  unapplied: [string, string, string, number, string | null, string | null, string | null][];
  clients: IClosingClientApi[];
}

/** Pago que quedó sin compensar al corte de un cierre. */
export interface IClosingUnappliedPayment extends IClosingClientInfo {
  period: string;
  status: string;
  amount: number;
  paymentDate: string | null;
  compensationDate: string | null;
  erpId: string | null;
}
