import dayjs from "dayjs";

export interface IClientPayment {
  id: number;
  description: string;
  id_account: number;
  project_id: number;
  id_client: string;
  payment_date: string; // ISO Date string
  created_at: string; // ISO Date string
  currency: string;
  initial_value: number;
  current_value: number;
  multiclient: number;
  id_status: number;
  is_delete: number;
  updated_at: string; // ISO Date string
  updated_by: string | null;
  evidence_url: string | null;
  id_payment: string | null;
  sequence: string | null;
  rule_id: number;
  CLIENT_NAME: string;
  sequence_payment: string | null;
  status_description: string;
  color: string; // Hex color code
  id_bank: number;
  account_description: string;
  bank_description: string;
  account_number: string;
  type_account: string;
}

export interface IClientPaymentStatus {
  payments_status: string;
  payments_status_id: number;
  color: string; // Hex color code
  payments: IClientPayment[];
}

export interface IIdentifiedPayment {
  id: number;
  description: string;
  id_account: number;
  project_id: number;
  id_client: string | null;
  payment_date: string;
  created_at: string;
  currency: string;
  initial_value: number;
  current_value: number;
  multiclient: number;
  id_status: number;
  is_delete: number;
  updated_at: string;
  updated_by: string | null;
  evidence_url: string | null;
  id_payment: number | null;
  sequence: string | null;
  rule_id: number | null;
  payment_type_id: number | null;
  CLIENT_NAME: string | null;
  account_number: string;
  bank_name: string;
}

interface ISelect {
  value: string | number;
  label: string;
}

export interface IFormIdentifyPaymentModal {
  account: ISelect | undefined;
  date: dayjs.Dayjs;
  amount: number;
  reference: string;
  payment_type: ISelect | undefined;
  is_advance_payment: boolean;
  evidence?: File;
}
