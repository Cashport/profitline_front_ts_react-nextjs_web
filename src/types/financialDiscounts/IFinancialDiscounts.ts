import { Pagination } from "../global/IGlobal";

export interface FinancialDiscount {
  id: number;
  sucursal_id: number | null;
  line_id: number | null;
  sub_line_id: number | null;
  project_id: number;
  dependecy_sucursal: number;
  initial_value: number;
  current_value: number;
  expiration_date: string;
  comments: string | null;
  files: any | null;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  status_id: number;
  document_type_id: number;
  client_id: string;
  percentage: number | null;
  is_discount: number | null;
  date_of_issue: string;
  erp_id: number | null;
  motive_id: number | null;
  validity_range: string | null;
  earlypay_date: string | null;
  is_legalized: number;
  is_deleted: number;
  status_name: string;
  project_name: string;
  document_type_name: string;
  motive_name: string | null;
  financial_status_id: number;
  legalized?: boolean;
  cp_id: string;
}

export interface StatusFinancialDiscounts {
  status_id: number;
  status_name: string;
  color: string;
  financial_discounts: FinancialDiscount[];
  total: number;
  legalized: boolean;
  count: number;
  page: Pagination;
}

export interface IFinancialDiscountsResponse {
  count: number;
  rows: StatusFinancialDiscounts[];
}

export interface IBalance {
  id: number;
  project_id: number;
  client_id: string;
  client_name: string;
  kam_id: number;
  kam_name: string;
  motive_name: string;
  status_id: number;
  status_name: string;
  status_code: string;
  status_color: string;
  initial_amount: number;
  pending_amount: number;
  balance_date: string;
  created_at: string;
}

// One balance row as returned by getBalancesByProject (keys are the SQL aliases)
export interface IBalanceRow {
  id: number;
  project_id: number;
  client_id: string;
  client_name: string;
  kam_id: number | null; // LEFT JOIN user → can be null
  kam_name: string | null;
  initial_amount: number; // b.INITIAL_VALUE (decimal — may arrive as string)
  pending_amount: number; // b.CURRENT_VALUE (decimal — may arrive as string)
  status_id: number;
  status_code: string;
  status_name: string;
  status_color: string;
  motive_name: string;
  created_at: string;
  financial_record_date: string;
  audit_file_url: string | null;
  audit_file_name: string | null;
  client_documents: IClientDocument[] | null;\
  COMMENTS: string | null;
}

export interface IClientDocument {
  id: number;
  balance_id: number;
  document: string;
  created_by: number;
  created_at: string;
}

// One state group
export interface IGetBalances {
  balance_status_id: number; // = status_id
  balance_status: string; // = status_name
  color: string; // = status_color
  balances_count: number; // balances.length
  pending_total: number; // Σ pending_amount within the state
  balances: IBalanceRow[];
}

export interface IBalancesFilterUser {
  id: number;
  name: string;
}
export interface IBalancesFilterClient {
  id: string;
  name: string;
}
export interface IBalancesFilters {
  users: IBalancesFilterUser[];
  clients: IBalancesFilterClient[];
}

// Selections collected in the UI and handed to useBalances
export interface IBalancesFilter {
  users: number[]; // selected kam_ids
  clients: string[]; // selected client_ids
  from_date: string | null;
  to_date: string | null;
  client_uuid?: string;
  motive_ids?: number[]; // selected motive ids
}
