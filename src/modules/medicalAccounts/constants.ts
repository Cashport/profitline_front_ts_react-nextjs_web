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

export const STATUS_CODE_OPTIONS = [
  { value: "PENDIENTE_AUDITORIA", label: "Pendiente auditoría" },
  { value: "AUDITADO", label: "Auditado" },
  { value: "FACTURADO", label: "Facturado" },
  { value: "RADICADO", label: "Radicado" },
  { value: "NOVEDAD", label: "Novedad" }
];
