import dayjs from "dayjs";
import "dayjs/locale/es";

const intFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

/** Monto completo: "249.183.424.147". */
export const formatAmount = (value: number) => intFormatter.format(Math.round(value));

/** Monto en millones para KPIs y gráficas: "249.183" (unidad "M" aparte). */
export const formatMillions = (value: number) => intFormatter.format(Math.round(value / 1e6));

/** Monto corto para ejes y etiquetas: "249 mil M", "1,2 mil M", "850 M". */
export const formatShort = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${oneDecimal.format(value / 1e12)} B`;
  if (abs >= 1e9) return `${intFormatter.format(value / 1e9)} mil M`;
  if (abs >= 1e6) return `${intFormatter.format(value / 1e6)} M`;
  return intFormatter.format(value);
};

/** "20,1 %". */
export const formatPct = (value: number) =>
  Number.isFinite(value) ? `${oneDecimal.format(value * 100)} %` : "—";

/** Diferencia en puntos porcentuales con signo: "+1,3 pp". */
export const formatPp = (value: number) =>
  `${value > 0 ? "+" : ""}${oneDecimal.format(value * 100)} pp`;

/** "2026-10" → "Octubre 2026". */
export const periodLabel = (period: string) => {
  const label = dayjs(`${period}-01`).locale("es").format("MMMM YYYY");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** "2026-10" → "Oct 26". */
export const periodShort = (period: string) => {
  const label = dayjs(`${period}-01`).locale("es").format("MMM YY").replace(".", "");
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY");
