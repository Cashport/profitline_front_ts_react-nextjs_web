export interface InvoiceDetail {
  data: {
    results: IData[];
    totals: {
      total_general: number;
      total_discount: number;
      total_creditNotes: number;
      total_debitNotes: number;
      total_initial: number;
    };
  };
}

export interface IData {
  ammount: number | null;
  client_id: string;
  comments: string;
  comments_conciliation: string | null;
  comments_incident: any[];
  create_at: string;
  current_status_id: number | null;
  description: string;
  email_id: number | null;
  event_date: string;
  event_type_name: string;
  files: string[];
  financial_discount_id: number | null;
  id: number;
  id_erp: string;
  id_invoice: number;
  incident_id: number;
  invoice_event_type_id: number;
  is_deleted: number;
  is_legalized: number;
  is_rejected: number | null;
  payment_id: number | null;
  payment_agreement_id: number;
  previous_status: string | null;
  previous_status_id: number | null;
  project_id: number;
  radication_type_id: number | null;
  sequence: number | null;
  single_payment_agreement_id: number;
  status: number;
  status_name: string;
  status_name_payment_agreement: string | null;
  status_payment_agreement: number;
  type_incident: string | null;
  user_id: number | null;
  user_name: string | null;
}
