export interface IPaymentsByStatus {
  payments_status: string;
  payments_status_id: number;
  color: string;
  payments: ISingleBank[];
  total_account: number | null;
  payments_count: number;
}

export interface ISingleBank {
  id: number;
  description: string;
  id_account: number;
  project_id: number;
  id_client: string;
  payment_date: string;
  created_at: string;
  currency: string;
  initial_value: number;
  current_value: number | null;
  multiclient: number;
  id_status: number;
  is_delete: number;
  updated_at: string;
  updated_by: string | null;
  CLIENT_NAME: string;
  status_description: string;
  id_bank: number;
  account_description: string;
  bank_description: string;
  color: string;
  client_status_id: number;
  evidence_url: string | null;
  key: number;
  rule_id: number | null;
  sequence: number;
  ammount_applied: number;
  USER_NAME: string | null;
  evidence: string | null;
  account_number: string;
}

export interface IPaymentDetail extends ISingleBank {
  events: IEvent[];
}

export interface IEvent {
  id: number;
  files: any | null;
  user_id: number | null;
  comments: string;
  USER_NAME: string | null;
  created_at: string;
  event_date: string;
  id_payment: number;
  id_payment_rule: number | null;
  previous_id_client: string | null;
  id_aplication_payment: number | null;
  payments_events_types: number;
  payments_events_types_name: string;
  client_name: string;
  id_client: string;
  ids_split_payment: number[] | null;
  previous_name_client: string;
  ammount_applied: number;
  id_payment_parent: number;
  url_aplication_payment: string | null;
}

export interface IClientsByProject {
  [key: string]: number;
}

export interface IAllRules {
  data: IRules[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IRules {
  id: number;
  project_id: number;
  description: string;
  id_client: string;
  is_exactly: number;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string | null;
  is_delete: any | null;
  client_name: string;
}

export interface IPostRule {
  project_id: number;
  description: string;
  id_client: string;
  is_exactly: boolean;
}

export interface IPaymentStatus {
  id: number;
  status_description: string;
  color: string;
  order_status: number;
}
