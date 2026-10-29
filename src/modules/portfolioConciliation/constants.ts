import {
  ConciliationDocumentType,
  ConciliationStatus
} from "@/types/portfolioConciliation/IPortfolioConciliation";

export const CONCILIATION_PAGE_SIZE = 50;

/** Cada cuánto se pregunta por una carga en proceso (45k filas tardan segundos). */
export const UPLOAD_POLL_INTERVAL_MS = 3000;

/** Límite del multer del backend. */
export const UPLOAD_MAX_BYTES = 30 * 1024 * 1024;

export const TEMPLATE_URL = "/templates/plantilla_conciliacion_cartera.xlsx";

export const CONCILIATION_STATUSES: ConciliationStatus[] = ["CONCILIADA", "NOVEDAD", "NO_EXISTE"];

// Misma paleta que los resultados de la búsqueda masiva de facturas
export const STATUS_META: Record<
  ConciliationStatus,
  { label: string; plural: string; hint: string; bg: string; color: string; dot: string }
> = {
  CONCILIADA: {
    label: "Conciliada",
    plural: "Conciliadas",
    hint: "Diferencia menor a $1.000",
    bg: "#eef7d6",
    color: "#4a6b00",
    dot: "#7cb518"
  },
  NOVEDAD: {
    label: "Novedad",
    plural: "Novedades",
    hint: "El monto no cuadra con Cashport",
    bg: "#fff4e0",
    color: "#ad6800",
    dot: "#f5a524"
  },
  NO_EXISTE: {
    label: "No existe",
    plural: "No existen",
    hint: "No están en la cartera activa",
    bg: "#fdecec",
    color: "#c4321c",
    dot: "#e5484d"
  }
};

export const DOCUMENT_TYPE_LABEL: Record<ConciliationDocumentType, string> = {
  FACTURA: "Factura",
  NOTA_CREDITO: "Nota crédito",
  NOTA_DEBITO: "Nota débito",
  SALDO: "Saldo"
};
