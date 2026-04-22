export interface IPaymentApplicationByStatus {
  status_id: number;
  name: string;
  color: string;
  total: number;
  applications: IPaymentApplication[];
}

export interface IPaymentApplication {
  id: number;
  pdf_url: string | null;
  excel_url: string | null;
  client_name: string;
  created_at: string;
  payment_ids: number[];
  userName: string;
  amount: number;
}
