export type BulkSearchStep = "input" | "busy" | "results" | "action" | "done";

// Lo que está procesando la vista de progreso
export type BulkBusyKind = "search" | "action";

export type BulkResultKind = "found" | "missing" | "other" | "dup";

export type BulkActionKey = "estado" | "pago" | "novedad" | "radicar" | "estado_cta";

export type BulkPaymentOrder = "antiguedad" | "menor";

export interface IBulkSearchRow {
  /** Único por fila: los duplicados comparten id. */
  key: number;
  id: string;
  result: BulkResultKind;
  /** Sólo en las encontradas. */
  status?: string;
  statusColor?: string;
  amount?: number;
  /** > 0 vencida, < 0 días para vencer. */
  dueDays?: number;
  /** Sólo en las de otro cliente. */
  otherClient?: string;
}

export interface IBulkSearchFile {
  name: string;
  file: File;
  /** Sólo en .csv/.txt, para mostrar cuántos trae: el Excel lo lee el backend. */
  ids?: string[];
}

export interface IBulkActionConfig {
  /** Estados de factura incluidos en la acción. */
  scope: Record<string, boolean>;
  action: BulkActionKey;
  newStatus: string;
  paymentId: string;
  order: BulkPaymentOrder;
  noveltyType: string;
  comment: string;
}

export interface IBulkAction {
  key: BulkActionKey;
  label: string;
  description: string;
  /** Inicio del texto del botón: "Cambiar estado de 120 facturas". */
  verb: string;
}

export interface IBulkPayment {
  id: string;
  bank: string;
  date: string;
  amount: number;
}

export interface IBulkPaymentCoverage {
  /** Facturas que el pago cubre completas. */
  covered: number;
  /** Si queda una factura cubierta a medias. */
  partial: boolean;
  left: number;
  total: number;
  pending: number;
  payment: number;
}

export interface IBulkDoneSummary {
  ok: number;
  errors: number;
}
