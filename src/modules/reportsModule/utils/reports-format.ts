import dayjs from "dayjs";

import { parseApiDate } from "@/modules/walletModule/utils/api-adapter";

/** "3 jun 2026" / "3 Jun 2026": el mes sale del idioma activo de dayjs. */
export const fmtReportDate = (iso: string): string => {
  const d = parseApiDate(iso);
  return d ? dayjs(d).format("D MMM YYYY") : "—";
};

/** "84 KB" o "1.4 MB". */
export const fmtFileSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Nombre sugerido a partir del archivo: "cierre_julio.html" → "cierre julio". */
export const nameFromFile = (fileName: string): string =>
  fileName
    .replace(/\.html?$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
