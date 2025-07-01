export interface IViewClientsTable {
  status: number;
  message: string;
  data: IData;
  pagination: IPagination;
}

export interface IData {
  clientsPortfolio: IClientsPortfolio[];
  grandTotal: IGrandTotal;
}
export interface IClientsPortfolio {
  total_balances: any;
  id: number;
  client_id: string;
  client_uuid: string;
  client_name: string;
  project_id: number;
  past_due_ammount: number;
  budget_ammount: number;
  applied_payments_ammount: number;
  unapplied_payments_ammount: number;
  holding_id: number;
  holding_name: string;
  total_portfolio: number;
  executed_percentage: number;
}
export interface IGrandTotal {
  total_wallet: number;
  total_past_due: number;
  total_budget: number;
  applied_payments_ammount: number;
  unapplied_payments_ammount: number;
  unidentified_payment_ammount: number;
  dso: number;
}
export interface IPagination {
  actualPage: number;
  totalPages: number;
  rowsperpage: number;
  totalRows: number;
}
