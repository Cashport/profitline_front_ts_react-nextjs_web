export interface IPaymentApplicationByStatus {
  status_id: number;
  name: string;
  color: string;
  total: number;
  applications: IPaymentApplication[];
}

export interface IPaymentApplication {
  id: number;
  client_name: string;
  created_at: string;
  payment_ids: number[];
  userName: string;
  amount: number;
}
