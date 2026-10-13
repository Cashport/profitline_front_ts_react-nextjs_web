import dayjs from "dayjs";

import { API_DATE_FORMAT } from "./constants";

import { IInvoiceClaimRow } from "./types";
import {
  ClaimStatus,
  IClaim,
  ICreateClaimPayload,
  IUpdateClaimPayload
} from "@/types/claims/IClaims";

export const mapClaimToRow = (claim: IClaim, fallbackStatus: ClaimStatus): IInvoiceClaimRow => ({
  claimId: claim.id,
  claimNumber: claim.claim_number ?? "",
  concepto: claim.concept ?? "",
  monto: Number(claim.amount) || 0,
  estado: claim.status ?? fallbackStatus,
  fechaGlosa: claim.claim_date ? dayjs(claim.claim_date) : null,
  fechaContestacion: claim.response_date ? dayjs(claim.response_date) : null,
  observacion: claim.observation ?? ""
});

export const rowToPayload = (row: IInvoiceClaimRow): IUpdateClaimPayload => ({
  concept: row.concepto.trim(),
  amount: row.monto ?? 0,
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
  amount: row.monto ?? 0
});

export const createEmptyRow = (defaultStatus: ClaimStatus): IInvoiceClaimRow => ({
  claimId: null,
  claimNumber: "",
  concepto: "",
  monto: null,
  estado: defaultStatus,
  fechaGlosa: dayjs(),
  fechaContestacion: null,
  observacion: "",
  _new: true
});
