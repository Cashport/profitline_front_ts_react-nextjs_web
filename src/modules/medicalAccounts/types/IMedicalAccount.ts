export type MedicalAccountStatus =
  | "Por Radicar"
  | "Pre Radicado"
  | "Radicado"
  | "Novedad"
  | "Anulado";

// Retained for the (currently disabled) detail edit mode — see the TODO in
// MedicalAccountDetailView. The API response has no `regimen`, so it lives here.
export type MedicalAccountRegimen = "Contributivo" | "Subsidiado";

// Editable fields on the detail view (read/edit-mode form state).
export interface IMedicalAccountEditForm {
  idAutorizacion: string;
  tipoDocumento: string;
  documentoPaciente: string;
  nombrePaciente: string;
  regimen: MedicalAccountRegimen | "";
  tipoServicio: string;
  fechaServicio: string;
}

// Shape returned by GET /medical-accounts (backend list contract, consumed directly — no remap).
export interface IMedicalAccountListItem {
  id: number;
  project_id?: number;
  patient_name: string | null;
  document_number: string | null;
  service_type: string | null;
  original_pdf_url?: string | null;
  total_novelties?: number;
  status_code: string;
  status_name: string;
  created_at: string; // ISO timestamp
  // Optional placeholders — not in the current list response; render "-" until the backend adds them.
  authorization_id?: string | null;
  service_date?: string | null;
  regimen?: string | null;
}
