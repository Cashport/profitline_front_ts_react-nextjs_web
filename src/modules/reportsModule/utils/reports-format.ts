import { parseApiDate } from "@/modules/walletModule/utils/api-adapter";

const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
];

/** "3 jun 2026". */
export const fmtReportDate = (iso: string): string => {
  const d = parseApiDate(iso);
  return d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : "—";
};

/** "84 KB" o "1.4 MB". */
export const fmtFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** "5 informes", o "2 de 5 informes" cuando la búsqueda o los filtros recortan el listado. */
export const fmtReportsCount = (shown: number, total: number): string => {
  const noun = total === 1 ? "informe" : "informes";
  return shown === total ? `${total} ${noun}` : `${shown} de ${total} ${noun}`;
};

/** Nombre sugerido a partir del archivo: "cierre_julio.html" → "cierre julio". */
export const nameFromFile = (fileName: string): string =>
  fileName
    .replace(/\.html?$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
