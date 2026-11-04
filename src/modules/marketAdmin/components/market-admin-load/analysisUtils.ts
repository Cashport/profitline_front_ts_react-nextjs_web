import { getActiveLocale, getTranslator } from "@/i18n/translator";
import { ILoadAnalysisMeasure } from "@/types/marketAdmin/IMarketAdmin";

export const COLORS = {
  ink: "#011822",
  ink2: "#334455",
  muted: "#6E848D",
  faint: "#8FA0A8",
  line: "#E4E9EB",
  soft: "#F1F4F5",
  bg: "#FAFBFB",
  orange: "#FF5500",
  orangeInk: "#C43F00",
  orangeSoft: "#FFEFE7",
  orangeLine: "#FFB08A",
  red: "#B3291A",
  lime: "#CBE71E",
  limeSoft: "#EEF6C2"
};

// Nombres de día y mes según el idioma activo ("lun" / "Mon", "2 sept" / "Sep 2").
const formatUtc = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(getActiveLocale(), { ...options, timeZone: "UTC" }).format(date);

const intFormat = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

export const formatMeasure = (unit: ILoadAnalysisMeasure["unit"], value: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (unit !== "currency") return intFormat.format(value);
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1).replace(".", ",")} MM`;
  }
  return `${sign}$${intFormat.format(abs)}`;
};

export const formatSigma = (z: number | null) =>
  z === null ? "—" : `${z >= 0 ? "+" : "−"}${Math.abs(z).toFixed(2).replace(".", ",")}σ`;

export const formatDelta = (delta: number | null) =>
  delta === null
    ? ""
    : getTranslator("marketAdmin")("load.validation.chart.deltaVsMean", {
        delta: `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1).replace(".", ",")}%`
      });

const parseDay = (day: string) => {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const formatDayLong = (day: string) => {
  const d = parseDay(day);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${formatUtc(d, { weekday: "short" })} ${dd}/${mm}/${d.getUTCFullYear()}`;
};

export const formatDayShort = (day: string) =>
  formatUtc(parseDay(day), { day: "numeric", month: "short" });

// Primer día del mes de `day` ("1 sept" / "Sep 1"): marca de inicio de mes en el eje.
export const formatMonthStartShort = (day: string) => {
  const d = parseDay(day);
  return formatUtc(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)), {
    day: "numeric",
    month: "short"
  });
};

export const isMonthStart = (day: string, previous?: string) =>
  !!previous && day.slice(0, 7) !== previous.slice(0, 7);

export const todayString = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mm}-${dd}`;
};

export const sigmaColor = (z: number | null) => {
  const a = Math.abs(z ?? 0);
  if (a >= 3) return COLORS.red;
  if (a >= 2) return COLORS.orange;
  if (a >= 1) return COLORS.ink2;
  return COLORS.lime;
};
