/** Catalog code from GET /claims/statuses (`description`), e.g. "in_dispute" */
export type ClaimStatus = string;

/** One entry of the backend owned status catalog */
export interface IClaimStatus {
  id: number;
  /** Wire value sent as `status` on create/update */
  description: ClaimStatus;
  /** Spanish label for the UI */
  status_name: string;
  /** 6 digit hex, e.g. "#F44336" */
  color: string;
}

export interface IClaim {
  id: number;
  invoice_id: number;
  invoice_number: string;
  customer: string;
  /** Server generated, formatted as `${ID_ERP}-GO-${sequence}` */
  claim_number: string;
  concept: string;
  amount: number;
  status: ClaimStatus;
  claim_date: string | null;
  response_date: string | null;
  observation: string | null;
  created_at: string;
}

export interface ICreateClaimPayload {
  invoice_id: number;
  concept: string;
  amount: number;
  status?: ClaimStatus;
  claim_date?: string;
  response_date?: string | null;
  observation?: string;
}

/** PUT /claims/:id is a partial update, every field is optional */
export type IUpdateClaimPayload = Partial<Omit<ICreateClaimPayload, "invoice_id">>;
