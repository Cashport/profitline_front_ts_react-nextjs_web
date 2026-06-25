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
