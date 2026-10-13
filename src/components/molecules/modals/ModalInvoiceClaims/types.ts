import { Dayjs } from "dayjs";

import { ClaimStatus } from "@/types/claims/IClaims";

export interface IInvoiceClaimRow {
  /** null while the row has never been sent to the server */
  claimId: number | null;
  /** Server generated claim_number, empty on rows that are not created yet */
  claimNumber: string;
  concepto: string;
  /** null on a row that has not been given an amount yet, so `required` can catch it */
  monto: number | null;
  estado: ClaimStatus;
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
