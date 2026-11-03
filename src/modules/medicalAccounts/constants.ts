// Códigos de tipo de servicio; la etiqueta se traduce en medicalAccounts.serviceTypes.<code>.
export const SERVICE_TYPE_CODES = ["ACC", "PRO", "RH", "SYS", "UPG"] as const;
export type ServiceTypeCode = (typeof SERVICE_TYPE_CODES)[number];
export const isServiceTypeCode = (code: string | null | undefined): code is ServiceTypeCode =>
  !!code && (SERVICE_TYPE_CODES as readonly string[]).includes(code);

// Códigos de tipo de documento; la etiqueta se traduce en medicalAccounts.documentTypes.<code>.
export const DOCUMENT_TYPE_CODES = ["CC", "TI", "CE", "RC", "PA", "PEP", "PPT", "NIT"] as const;
export type DocumentTypeCode = (typeof DOCUMENT_TYPE_CODES)[number];
export const isDocumentTypeCode = (code: string | null | undefined): code is DocumentTypeCode =>
  !!code && (DOCUMENT_TYPE_CODES as readonly string[]).includes(code);

// Códigos (`tipo`) de novedades; el título se traduce en medicalAccounts.noveltyTypes.<code>.
export const NOVELTY_TYPE_CODES = [
  "tipo_documento",
  "tipo_regimen",
  "no_coinciden_fechas",
  "nombre_servicio",
  "codigo_producto",
  "documento_diferente",
  "falta_factura",
  "falta_autorizacion",
  "falta_preautorizacion"
] as const;
export type NoveltyTypeCode = (typeof NOVELTY_TYPE_CODES)[number];
export const isNoveltyTypeCode = (code: string | null | undefined): code is NoveltyTypeCode =>
  !!code && (NOVELTY_TYPE_CODES as readonly string[]).includes(code);

// Status colors keyed by status_code (labels come dynamically from /statuses).
export const STATUS_COLORS: Record<string, string> = {
  CARGUE: "#64748B",
  NOVEDAD: "#B91C1C",
  PENDIENTE_AUDITORIA: "#B45309",
  AUDITADO: "#1D4ED8",
  FACTURADO: "#6D28D9",
  RADICADO: "#15803D"
};

export const STATUS_COLOR_FALLBACK = "#6B7280";
