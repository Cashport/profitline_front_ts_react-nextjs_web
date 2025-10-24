// Define the type for the application payments
interface IApplicationPayments {
  applied_payments_ammount: number;
  unapplied_payments_ammount: number;
}

// Define the type for invoice info
interface IInvoiceInfo {
  total_balances: IGeneralInfo;
  total_invoice_unreconciled: IGeneralInfo;
  total_invoice_reconciled: IGeneralInfo;
}

// Define the type for the data wallet
interface IDataWallet {
  client_id: string;
  client_name: string;
  project_id: number;
  total_portfolio: number;
  past_due_ammount: number;
  budget_ammount: number | null;
  applied_payments_ammount: number;
  unapplied_payments_ammount: number;
  unidentified_payment_amount: number;
  quota: number;
  uuid: string;
}

// Define the type for the full data section of the response
export interface IDataSection {
  data_wallet: IDataWallet;
  total_wallet: number;
  total_budget:number;
  total_balances: number;
  grand_total_wallet: number;
  total_invoices: number;
  count_invoices: number;
  total_balances_new: number;
  count_balances_new: number;
  total_credit_notes: number;
  count_credit_notes: number;
  info_invioce: IInvoiceInfo;
  invoice_alerts: IInvoiceAlerts;
  dso: number;
  invoice_ages: IInvoiceAges[];
  quota: number;
  percentages: IPercentages;
  aplication_payments: IApplicationPayments;
  payments_vs_invoices: IPaymentsVsInvoices[];
  unradicated_invoices: IUnradicatedInvoices;
}

interface IPaymentsVsInvoices {
  id: number;
  project_id: number;
  client_id: string;
  month: string;
  sales: number;
  payments: number;
  budget: number;
  applied_payments: number;
  not_applied_payments: number;
  collections: string;
  residue: number;
  dso: number;
}

export interface IUnradicatedInvoices {
  total_value: number;
  count: number;
}

// Define the type for the full API response
export interface IPortfolioResponse {
  status: number;
  data: IDataSection;
}

interface IInvoiceAlerts {
  accounting_updates: IGeneralInfo;
  financial_discounts: {
    discount: IGeneralInfo;
    creditNote: IGeneralInfo;
  };
}

interface IGeneralInfo {
  count: number;
  total_value: number | null;
}

interface IInvoiceAges {
  days_range: string;
  invoice_count: number;
  percentage: number;
  total: number;
}

interface IPercentages {
  past_due_percentage: string;
  unapplied_payments_percentage: string;
  budget_percentage: string;
  quota_percentage: string;
  applied_payments_percentage: number;
}
