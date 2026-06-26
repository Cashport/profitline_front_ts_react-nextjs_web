export type MedicalAccountStatus =
  | "Por Radicar"
  | "Pre Radicado"
  | "Radicado"
  | "Novedad"
  | "Anulado";

export type MedicalAccountRegimen = "Contributivo" | "Subsidiado";

export type MedicalAccountDocumentType = "invoice" | "receipt" | "authorization" | "medical";

export interface IMedicalAccountNovedad {
  id: string;
  tipo: string;
  descripcion: string;
  resuelta: boolean;
}

export interface IMedicalAccountDocument {
  id: string;
  type: MedicalAccountDocumentType;
  name: string;
  startPage: number;
  endPage: number;
  novedadesCount?: number; // 0/undefined → "Completo"; >0 → "Novedad" + count (estado is derived)
}

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

export interface IMedicalAccount {
  id: string; // e.g. "CM-001"
  idAutorizacion: string | null;
  nombrePaciente: string | null;
  documentoPaciente: string | null;
  fechaCarga: string; // ISO timestamp
  fechaServicio: string | null;
  regimen: MedicalAccountRegimen | null;
  tipoServicio: string | null; // e.g. "SYS", "RH", "ACC"
  estado: MedicalAccountStatus;
  // Detail-only fields (optional so the list/table keep working)
  tipoDocumento?: string | null; // e.g. "CC", "TI"
  nombreArchivo?: string;
  numeroPaginas?: number;
  novedades?: IMedicalAccountNovedad[];
  documents?: IMedicalAccountDocument[];
  pdfUrl?: string;
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
