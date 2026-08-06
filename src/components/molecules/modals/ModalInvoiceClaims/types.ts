import { Dayjs } from "dayjs";

export type ClaimEstado =
  | "Lista para pago"
  | "En disputa"
  | "Con novedad"
  | "Contestada"
  | "Aceptada";

export interface IInvoiceClaimRow {
  id: string;
  concepto: string;
  codigo: string;
  monto: number;
  estado: ClaimEstado;
  fechaGlosa: Dayjs | null;
  fechaContestacion: Dayjs | null;
  observacion: string;
  /** Row created in this session and not yet confirmed — cancelling removes it */
  _new?: boolean;
}

export interface ClaimsForm {
  claims: IInvoiceClaimRow[];
}

/** Row as handed to the AntD Table: keeps the index of its entry in the field array */
export type ClaimTableRow = IInvoiceClaimRow & { fieldId: string; index: number; key: string };
