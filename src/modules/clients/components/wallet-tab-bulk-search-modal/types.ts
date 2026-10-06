import type { Dayjs } from "dayjs";

export type BulkSearchStep = "input" | "busy" | "results" | "action" | "done";

// Lo que está procesando la vista de progreso
export type BulkBusyKind = "search" | "action";

export type BulkResultKind = "found" | "missing" | "other" | "dup";

export type BulkActionKey = "estado" | "pago" | "novedad" | "radicar" | "estado_cta";

// Cómo se entrega el estado de cuenta
export type BulkStatementMethod = "correo" | "whatsapp" | "descargar";

export interface IBulkSearchRow {
  /** Único por fila: los duplicados comparten id. */
  key: number;
  id: string;
  result: BulkResultKind;
  /** Sólo en las encontradas: id de la factura, el que reciben las acciones. */
  invoiceId?: number;
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
  /** Cambiar estado: en minúsculas, como lo espera el servicio. */
  newStatus?: string;
  /** Registrar novedad. El monto va como texto, igual que lo recibe el servicio. */
  motiveId?: number;
  noveltyAmount: string | null;
  /** Radicar facturas. */
  radicationDate: Dayjs | null;
  evidence: File[];
  /** Cambiar estado, registrar novedad y radicar. */
  comment: string;
  /** Enviar estado de cuenta. */
  statementMethod: BulkStatementMethod;
  /**
   * Contactos elegidos (su contact_id) o destinos escritos a mano. Correo y WhatsApp comparten la
   * lista, como en AccountStatementModal: al enviar se usa el correo o el teléfono de cada uno.
   */
  recipients: string[];
}

export interface IBulkAction {
  key: BulkActionKey;
  label: string;
  description: string;
  /** Inicio del texto del botón: "Cambiar estado de 120 facturas". */
  verb: string;
}
