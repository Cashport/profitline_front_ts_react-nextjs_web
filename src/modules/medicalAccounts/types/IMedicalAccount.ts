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
