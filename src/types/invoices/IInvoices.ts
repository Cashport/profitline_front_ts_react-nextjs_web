import { Pagination } from "../global/IGlobal";

export interface IInvoices {
  error: boolean;
  data: InvoicesData[];
}

export interface InvoicesData {
  status: string;
  color: string;
  status_id: number;
  invoices: IInvoice[] | IApplicationInvoice[];
  total: number;
  count: number;
  page: Pagination;
}

export interface IInvoice {
  id: number;
  shipto_id: number | null;
  line_id: number | null;
  sub_line_id: number | null;
  project_id: number;
  dependecy_sucursal: number;
  cufe: string;
  initial_value: number;
  current_value: number;
  expiration_date: string;
  financial_record_date: string;
  comments: string;
  invoice_url: string;
  files: any | null; // Ver cómo llega esto cuando está lleno
  radication_type: string;
  create_at: string;
  updated_at: string;
  delete_at: string | null;
  currency_id: number;
  status_id: number;
  document_type_id: number;
  client_id: string;
  earlypay_date: string;
  accept_date: string | null;
  ajust_value: number;
  id_erp: string;
  expiration_days: number;
  acceptance_info: {
    accept_date: null | string;
    radication_type: string;
  } | null;
  agreement_info: {
    id?: number;
    Fecha: string;
    Monto: number;
    Cumplido: string;
  } | null;
  novelty_info: { incidentAmount: number | null; incidentType: string | null } | null;
}

export interface IApplicationInvoice extends IInvoice {
  ajust_value: number;
}

// Búsqueda masiva: POST /invoice/bulk-search/client/:clientUUID

/** Lo que se busca: IDs pegados (se envían como JSON) o el archivo tal cual (multipart). */
export type InvoiceBulkSearchInput = { ids: string[] } | { file: File };

export interface IInvoiceBulkSearchSummary {
  total: number;
  unique: number;
  found: number;
  found_invoices: number;
  found_pending_amount: number;
  not_found: number;
  other_client: number;
  duplicated: number;
}

export interface IInvoiceBulkSearchFound {
  id: number;
  id_erp: string;
  status_id: number;
  status: string;
  status_color: string;
  current_value: number;
  expiration_date: string | null;
  /** > 0 vencida, < 0 días para vencer, null sin fecha de vencimiento. */
  expiration_days: number | null;
}

export interface IInvoiceBulkSearchOtherClient {
  id_erp: string;
  clients: { nit: string; client_name: string }[];
}

export interface IInvoiceBulkSearchDuplicated {
  id_erp: string;
  occurrences: number;
}

export interface IInvoiceBulkSearchData {
  summary: IInvoiceBulkSearchSummary;
  found: IInvoiceBulkSearchFound[];
  not_found: string[];
  other_client: IInvoiceBulkSearchOtherClient[];
  duplicated: IInvoiceBulkSearchDuplicated[];
}
