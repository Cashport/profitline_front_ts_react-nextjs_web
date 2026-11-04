import { getTranslator } from "@/i18n/translator";
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

type StatusMeta = {
  label: string;
  plural: string;
  hint: string;
  bg: string;
  color: string;
  dot: string;
};

/** Rótulos de `reconciliation.status.<STATUS>` (se leen en el idioma activo). */
const statusMeta = (
  status: ConciliationStatus,
  colors: Pick<StatusMeta, "bg" | "color" | "dot">
): StatusMeta => ({
  ...colors,
  get label() {
    return getTranslator("reconciliation")(`status.${status}.label`);
  },
  get plural() {
    return getTranslator("reconciliation")(`status.${status}.plural`);
  },
  get hint() {
    return getTranslator("reconciliation")(`status.${status}.hint`);
  }
});

// Misma paleta que los resultados de la búsqueda masiva de facturas
export const STATUS_META: Record<ConciliationStatus, StatusMeta> = {
  CONCILIADA: statusMeta("CONCILIADA", { bg: "#eef7d6", color: "#4a6b00", dot: "#7cb518" }),
  NOVEDAD: statusMeta("NOVEDAD", { bg: "#fff4e0", color: "#ad6800", dot: "#f5a524" }),
  NO_EXISTE: statusMeta("NO_EXISTE", { bg: "#fdecec", color: "#c4321c", dot: "#e5484d" })
};

/** Tipos de documento (claves del backend); el rótulo es `reconciliation.documentType.<TIPO>`. */
export const DOCUMENT_TYPES: ConciliationDocumentType[] = [
  "FACTURA",
  "NOTA_CREDITO",
  "NOTA_DEBITO",
  "SALDO"
];
