export type MedicalAccountStatusCode =
  | "PENDIENTE_AUDITORIA"
  | "AUDITADO"
  | "FACTURADO"
  | "RADICADO"
  | "NOVEDAD";

export type MedicalAccountDocumentStatusCode =
  | "COMPLETE"
  | "NOVELTY"
  | "ILLEGIBLE"
  | "PENDING_REVIEW"
  | "ERROR";

export type MedicalAccountSeverity = "CRITICA" | "ALTA" | "MEDIA" | "BAJA";
export type MedicalAccountValidationResult = "OK" | "NO_OK";
export type MedicalAccountDocumentEstado = "COMPLETO" | "INCOMPLETO";

export interface IMedicalAccountDocumentApi {
  id: number;
  medical_account_id: number;
  document_type: string;
  sequence: number;
  page_start: number;
  page_end: number;
  total_pages: number;
  confidence: number;
  status_id: number;
  status_code: MedicalAccountDocumentStatusCode;
  status_name: string;
  generated_file_url: string | null;
  patient_name: string | null;
  document_type_patient: string | null;
  document_number: string | null;
  invoice_number: string | null;
  authorization_number: string | null;
  preauthorization_number: string | null;
  service_code: string | null;
  service_description: string | null;
  service_date: string | null;
  document_date: string | null;
  billed_amount: number | null;
  /** Stringified JSON — parse to `IMedicalAccountDocumentAiData`. */
  ai_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface IMedicalAccountValidationApi {
  id: number;
  medical_account_id: number;
  validation_type: string;
  result: MedicalAccountValidationResult;
  description: string;
  created_at: string;
}

export interface IMedicalAccountNoveltyApi {
  id: number;
  medical_account_id: number;
  medical_account_document_id: number | null;
  novelty_type: string;
  severity: MedicalAccountSeverity;
  description: string;
  created_at: string;
}

export interface IMedicalAccountFacturaApi {
  id: number;
  medical_account_id: number;
  invoice_number: string;
  pdf_url: string;
  xml_url: string;
  created_at: string;
}

export interface IMedicalAccountUploadData {
  id: number;
  project_id: number;
  patient_name: string | null;
  document_type: string | null;
  document_number: string | null;
  authorization_number: string | null;
  service_type: string | null;
  service_date: string | null;
  original_file_name: string;
  original_pdf_url: string;
  total_pages: number;
  total_novelties: number;
  processing_started_at: string;
  processing_finished_at: string;
  status_id: number;
  status_code: MedicalAccountStatusCode;
  status_name: string;
  /** Stringified JSON — parse to `IMedicalAccountAiResponse`. */
  ai_response: string | null;
  created_at: string;
  updated_at: string;
  documentos: IMedicalAccountDocumentApi[];
  validaciones: IMedicalAccountValidationApi[];
  novedades: IMedicalAccountNoveltyApi[];
  facturas: IMedicalAccountFacturaApi[];
}

// ---------------------------------------------------------------------------
// Parsed shapes of the stringified-JSON fields above.
// `IMedicalAccountDocumentApi.ai_json`  -> IMedicalAccountDocumentAiData
// `IMedicalAccountUploadData.ai_response` -> IMedicalAccountAiResponse
// ---------------------------------------------------------------------------

export interface IMedicalAccountDocumentAiData {
  paciente: string | null;
  fecha_servicio: string | null;
  numero_factura: string | null;
  tipo_documento: string | null;
  codigo_servicio: string | null;
  fecha_documento: string | null;
  valor_facturado: number | null;
  numero_documento: string | null;
  numero_autorizacion: string | null;
  descripcion_servicio: string | null;
  numero_preautorizacion: string | null;
}

export interface IMedicalAccountAiNovedad {
  tipo: string;
  severidad: MedicalAccountSeverity;
  descripcion: string;
}

export interface IMedicalAccountAiValidacion {
  tipo: string;
  resultado: MedicalAccountValidationResult;
  descripcion: string;
}

export interface IMedicalAccountAiDocumento {
  data: IMedicalAccountDocumentAiData;
  estado: MedicalAccountDocumentEstado;
  page_start: number;
  page_end: number;
  sequence: number;
  confidence: number;
  status_code: MedicalAccountDocumentStatusCode;
  total_pages: number;
  document_type: string;
}

export interface IMedicalAccountAiSplitDocument {
  page_start: number;
  page_end: number;
  sequence: number;
  document_type: string;
}

export interface IMedicalAccountAiCuentaMedica {
  paciente: string | null;
  documento: string | null;
  autorizacion: string | null;
  tipo_servicio: string | null;
  fecha_servicio: string | null;
  tipo_documento: string | null;
}

export interface IMedicalAccountAiResultadoGeneral {
  estado: MedicalAccountDocumentEstado;
  status_code: MedicalAccountStatusCode;
  cantidad_novedades: number;
}

export interface IMedicalAccountAiResult {
  novedades: IMedicalAccountAiNovedad[];
  documentos: IMedicalAccountAiDocumento[];
  validaciones: IMedicalAccountAiValidacion[];
  cuenta_medica: IMedicalAccountAiCuentaMedica;
  has_novelties: boolean;
  split_documents: IMedicalAccountAiSplitDocument[];
  total_documents: number;
  resultado_general: IMedicalAccountAiResultadoGeneral;
}

export interface IMedicalAccountAiMetadata {
  model: string;
  response_id: string;
  total_tokens: number;
  prompt_tokens: number;
  thoughts_tokens: number;
  completion_tokens: number;
}

export interface IMedicalAccountAiResponse {
  result: IMedicalAccountAiResult;
  metadata: IMedicalAccountAiMetadata;
}
