import dayjs from "dayjs";

import { API_DATE_FORMAT, DEFAULT_CLAIM_STATUS } from "./constants";

import { IInvoiceClaimRow } from "./types";
import { IClaim, ICreateClaimPayload, IUpdateClaimPayload } from "@/types/claims/IClaims";

export const mapClaimToRow = (claim: IClaim): IInvoiceClaimRow => ({
  claimId: claim.id,
  claimNumber: claim.claim_number ?? "",
  concepto: claim.concept ?? "",
  monto: Number(claim.amount) || 0,
  estado: claim.status ?? DEFAULT_CLAIM_STATUS,
  fechaGlosa: claim.claim_date ? dayjs(claim.claim_date) : null,
  fechaContestacion: claim.response_date ? dayjs(claim.response_date) : null,
  observacion: claim.observation ?? ""
});

export const rowToPayload = (row: IInvoiceClaimRow): IUpdateClaimPayload => ({
  concept: row.concepto.trim(),
  amount: row.monto,
  status: row.estado,
  claim_date: row.fechaGlosa ? row.fechaGlosa.format(API_DATE_FORMAT) : undefined,
  response_date: row.fechaContestacion ? row.fechaContestacion.format(API_DATE_FORMAT) : null,
  observation: row.observacion.trim()
});

export const rowToCreatePayload = (
  row: IInvoiceClaimRow,
  invoiceId: number
): ICreateClaimPayload => ({
  ...rowToPayload(row),
  invoice_id: invoiceId,
  concept: row.concepto.trim(),
  amount: row.monto
});

export const createEmptyRow = (): IInvoiceClaimRow => ({
  claimId: null,
  claimNumber: "",
  concepto: "",
  monto: 0,
  estado: DEFAULT_CLAIM_STATUS,
  fechaGlosa: dayjs(),
  fechaContestacion: null,
  observacion: "",
  _new: true
});
