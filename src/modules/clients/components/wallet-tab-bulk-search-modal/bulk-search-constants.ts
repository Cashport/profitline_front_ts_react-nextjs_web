import { BulkResultKind, IBulkAction } from "./types";

/** Estado que la acción deja fuera por defecto. */
export const PAID_STATUS = "Pagada";

// Etiquetas en clients.bulkSearch.results.<kind> (label y plural)
export const RESULT_META: Record<BulkResultKind, { bg: string; color: string; dot: string }> = {
  found: { bg: "#eef7d6", color: "#4a6b00", dot: "#7cb518" },
  missing: { bg: "#fdecec", color: "#c4321c", dot: "#e5484d" },
  other: { bg: "#fff4e0", color: "#ad6800", dot: "#f5a524" },
  dup: { bg: "#f0f0f0", color: "#6b6b6b", dot: "#b0b0b0" }
};

export const BULK_ACTIONS: IBulkAction[] = [
  { key: "estado", i18nKey: "changeStatus" },
  { key: "pago", i18nKey: "applyPayment" },
  { key: "novedad", i18nKey: "registerDispute" },
  { key: "radicar", i18nKey: "submitInvoices" },
  { key: "estado_cta", i18nKey: "sendStatement" }
];
