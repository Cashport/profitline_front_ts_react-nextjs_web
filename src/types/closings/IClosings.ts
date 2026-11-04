/* Cierres de cartera: foto fija de la cartera y el recaudo al corte de cada mes. Sale de la
   plantilla que manda cada proyecto (hojas Cartera, Pagos y Comentarios), no de Cashport. */

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

/** Fila agregada de la hoja Cartera: un cliente en un cierre, por tipo de saldo y tramo. */
export interface IClosingPortfolioRow {
  /** Cierre "2026-10". */
  period: string;
  nit: string;
  client: string;
  /** Canal / gerencia (Home Market, Territorial…). */
  channel: string;
  holding: string;
  manager: string;
  salesExecutive: string;
  collectionExecutive: string;
  coordinator: string;
  city: string;
  /** "Crédito formal" o "Crédito informal o contado" (Descripcion de la factura). */
  segment: string;
  /** Causal: Segmento de la NC (Negociaciones, Devolución…) o Tipo saldo de los saldos
      abiertos (Menor/Mayor valor pagado, Por clasificar…). "Factura" en las facturas. */
  balanceType: string;
  /** Columna Tipo: facturas, notas crédito en cartera o saldos abiertos por cruzar. */
  kind: "Factura" | "NC" | "Saldos";
  bucket: AgingBucket;
  amount: number;
  documents: number;
}

/** Fila agregada de la hoja Pagos: recaudo de un cliente en el mes del cierre. */
export interface IClosingPaymentRow {
  period: string;
  nit: string;
  client: string;
  channel: string;
  /** Consignación, Wallet… */
  paymentType: string;
  /** "Compensado" = la compañía lo aplicó en su ERP antes del cierre. Lo demás es recaudo
      que Cashport ya tenía pero que no quedó aplicado al corte. */
  status: PaymentStatus;
  /** Estado 2: detalle de seguimiento ("Identificado Cashport", "No están en Cashport"…). */
  detail: string | null;
  amount: number;
}

export type PaymentStatus =
  | "Compensado"
  | "Pendiente compensación"
  | "Revisión doble abono"
  | "Enviado anulación";

/** Hoja Comentarios: una nota por cliente y cierre. */
export interface IClosingComment {
  id: string;
  period: string;
  nit: string;
  client: string;
  text: string;
  author: string;
  createdAt: string;
}

/** Encabezado de un cierre cargado. */
export interface IClosingInfo {
  period: string;
  /** Fecha de corte de la cartera (día del cierre). */
  cutoffDate: string;
  loadedAt: string;
  loadedBy: string;
  fileName: string;
  rows: number;
  status: "Publicado" | "Borrador";
}

export interface IClosingDataset {
  closings: IClosingInfo[];
  portfolio: IClosingPortfolioRow[];
  payments: IClosingPaymentRow[];
  comments: IClosingComment[];
}
