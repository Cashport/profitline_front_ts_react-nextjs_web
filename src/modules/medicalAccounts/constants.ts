import { MedicalAccountDocumentType } from "./types/IMedicalAccount";

export const SERVICE_TYPES = [
  { code: "ACC", label: "Accesorios" },
  { code: "PRO", label: "Monitoreos o Programación" },
  { code: "RH", label: "Rehabilitación" },
  { code: "SYS", label: "Cirugía" },
  { code: "UPG", label: "Actualización" }
];

export const SERVICE_TYPE_LABELS: Record<string, string> = SERVICE_TYPES.reduce(
  (acc, { code, label }) => ({ ...acc, [code]: label }),
  {} as Record<string, string>
);

export const DOCUMENT_TYPE_LABELS: Record<MedicalAccountDocumentType, string> = {
  invoice: "Factura",
  receipt: "Confirmaciones",
  authorization: "Autorizaciones",
  medical: "Soportes Médicos"
};

// Ordered groups for the classified-documents table: drives row order + accent bar color.
export const DOC_GROUPS: { type: MedicalAccountDocumentType; label: string; accent: string }[] = [
  { type: "invoice", label: "Factura", accent: "bg-blue-500" },
  { type: "receipt", label: "Confirmaciones", accent: "bg-emerald-500" },
  { type: "authorization", label: "Autorizaciones", accent: "bg-violet-500" },
  { type: "medical", label: "Soportes Médicos", accent: "bg-orange-400" }
];

export const TIPO_DOCUMENTO_LABELS: Record<string, string> = {
  CC: "Cédula de Ciudadanía",
  TI: "Tarjeta de Identidad",
  CE: "Cédula de Extranjería",
  RC: "Registro Civil",
  PA: "Pasaporte",
  PEP: "Permiso Especial de Permanencia",
  PPT: "Permiso por Protección Temporal",
  NIT: "NIT"
};

// Derived options for the edit-mode document-type <select>.
export const TIPO_DOCUMENTO_OPTIONS: { value: string; label: string }[] = Object.entries(
  TIPO_DOCUMENTO_LABELS
).map(([value, label]) => ({ value, label: `${value} — ${label}` }));

// Human-readable titles for novedades, keyed by their `tipo` code.
export const NOVEDAD_TYPE_LABELS: Record<string, string> = {
  tipo_documento: "Tipo de documento",
  tipo_regimen: "Tipo de régimen",
  no_coinciden_fechas: "No coinciden fechas",
  nombre_servicio: "Nombre de servicio",
  codigo_producto: "Código producto",
  documento_diferente: "Documento diferente",
  falta_factura: "Falta factura",
  falta_autorizacion: "Falta autorización",
  falta_preautorizacion: "Falta preautorización"
};
