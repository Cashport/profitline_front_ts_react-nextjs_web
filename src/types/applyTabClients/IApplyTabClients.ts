export interface IApplyTabRecord {
  id: number;
  id_erp: string;
  entity_type_id: number;
  project_id: number;
  client_id: string;
  financial_record_id: number | null;
  financial_discount_id: number | null;
  balance_id: number | null;
  payment_id: number;
  amount: number;
  status: string;
  is_advance_payment: number;
  created_at: string;
  updated_at: string;
  is_deleted: number;
  created_by: string;
  updated_by: string | null;
  entity_type_name: string;
  entity_description: string | null;
  initial_value: number;
  current_value: number;
  current_amount: number;
  created_by_name: string | null;
  applied_amount: number;
  total_adjustments: number | null;
  adjustments_detail: string | null;
  adjustments_breakdown: IAdjustmentBreakdown;
  erp_id: string | null;
  motive_description?: string;
  motive_id?: number;
  cp_id: string;
  adjustments?: IApplyTabAdjustment[];
  invoices?: IApplyTabNestedInvoice[];
}

export interface IApplyTabClients {
  payments: IApplyTabRecord[];
  invoices: IApplyTabRecord[];
  discounts: IApplyTabRecord[];
  balances: IApplyTabRecord[];
  summary: {
    total_invoices: number;
    total_payments: number;
    total_discounts: number;
    total_balance: number;
    url_log: string;
    url_attachment: string | null;
    attachment_name: string | null;
  };
}

interface IApplyTabAdjustment {
  adjustment_id: number;
  amount: number;
  description: string;
  is_global: number;
  motive_id: number | null;
  motive_type: string;
  timestamp: string;
  user_name: string;
  id_erp?: string;
}

interface IApplyTabNestedInvoice {
  invoice_id: number;
  financial_discount_id: number;
  CURRENT_VALUE: number;
  description: string;
  id_erp: string;
}

interface IAdjustmentBreakdown {
  specific: {
    credit_notes: number;
    discounts: number;
    debit_notes: number;
  };
}

export interface IApplicationBalance {
  id: number;
  project_id: number;
  client_id: string;
  client_uuid: string;
  client_name: string;
  financial_discount_motive_id: number;
  motive_name: string;
  balance_status_id: number;
  balance_status_code: string;
  balance_status_name: string;
  balance_status_color: string;
  initial_value: number;
  current_value: number;
  is_legalized: number;
  is_deleted: number;
  financial_record_id: number | null;
  created_at: string;
}

export interface IApplicationBalanceStatusGroup {
  status_id: string; // e.g. "2-not_legalized"
  balance_status_id: number;
  status_name: string;
  status_code: string;
  color: string;
  balances: IApplicationBalance[];
  total: number;
  count: number;
  legalized: boolean;
}
