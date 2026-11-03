// Conciliación masiva Cashport (carga de cartera), HU 86e3915mm.
// Espejo del contrato de /massive-action/portfolio-conciliation del backend.

export type ConciliationStatus = "CONCILIADA" | "NOVEDAD" | "NO_EXISTE";

export type ConciliationDocumentType = "FACTURA" | "NOTA_CREDITO" | "NOTA_DEBITO" | "SALDO";

export type ConciliationUploadStatus = "PROCESSING" | "DONE" | "FAILED";

export type ConciliationSortField =
  | "file_row"
  | "document_id"
  | "document_type"
  | "client_amount"
  | "current_amount_cashport"
  | "difference"
  | "status_cashport";

export interface IConciliationTotals {
  count: number;
  client_amount: number;
  cashport_amount: number;
}

export interface IConciliationSummary {
  total: IConciliationTotals;
  by_status: Record<ConciliationStatus, IConciliationTotals>;
}

export interface IConciliationRowError {
  /** Fila del Excel; null si el error es del archivo completo. */
  row: number | null;
  column: string | null;
  message: string;
}

export interface IConciliationUpload {
  uuid: string;
  status: ConciliationUploadStatus;
  file_name: string;
  file_size: number | null;
  sheet_name: string | null;
  total_rows: number | null;
  summary: IConciliationSummary | null;
  error_message: string | null;
  /** Total de errores; `errors` trae sólo los primeros 500. */
  error_count: number;
  errors: IConciliationRowError[];
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  /** Sólo las cargas exitosas guardan el Excel original en S3. */
  has_file: boolean;
}

export interface IConciliationRow {
  id: number;
  file_row: number;
  document_id: string;
  document_type: ConciliationDocumentType;
  /** Notas crédito en negativo. */
  client_amount: number;
  /** Null si el documento no existe en Cashport. */
  current_amount_cashport: number | null;
  /** Valor Cashport − monto cliente. */
  difference: number | null;
  status_cashport: ConciliationStatus;
}

export interface IConciliationPortfolio {
  client: { nit: string; name: string | null };
  /** La carga DONE que generó la cartera vigente. */
  current_upload: IConciliationUpload | null;
  /** La carga más reciente, en cualquier estado. */
  latest_upload: IConciliationUpload | null;
  /** Totales por estado con los filtros de tipo y búsqueda, sin el de estado. */
  summary: IConciliationSummary;
  rows: IConciliationRow[];
}

export interface IConciliationPagination {
  actualPage: number;
  rowsperpage: number;
  totalPages: number;
  totalRows: number;
}

export interface IConciliationQuery {
  page: number;
  status: ConciliationStatus | null;
  documentType: ConciliationDocumentType | null;
  search: string;
  sortBy: ConciliationSortField;
  sortDir: "asc" | "desc";
}
