export type ClaimStatus =
  | "in_dispute"
  | "ready_for_payment"
  | "accepted"
  | "responded"
  | "with_observations";

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
