/* Formatos de la torre, iguales al prototipo: miles con punto, decimales con
   coma, montos cortos en M / MM y fechas dd/mm/yyyy. Las fechas "YYYY-MM-DD"
   se leen por partes y no con new Date(iso), que las tomaría en UTC y en
   Colombia las correría al día anterior. */
import type { Tone } from "../types";

export function fmt(x: number, dec = 0): string {
  const neg = x < 0;
  const p = Math.abs(x).toFixed(dec).split(".");
  const i = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + i + (p[1] ? "," + p[1] : "");
}

/** Como fmt, sin ceros de sobra en los decimales. */
function fmtTrim(x: number, dec: number): string {
  let s = fmt(x, dec);
  if (s.indexOf(",") >= 0) s = s.replace(/0+$/, "").replace(/,$/, "");
  return s;
}

/** Dinero corto: "$1,65 MM" · "$12 M" · "$9,6 M" · "$850 mil". Con `sign`, "+" en los positivos. */
export function money(v: number, sign = false): string {
  const a = Math.abs(v);
  let t: string;
  if (a >= 1e9) t = fmtTrim(a / 1e9, 2) + " MM";
  else if (a >= 1e6) t = fmtTrim(a / 1e6, a < 1e7 ? 1 : 0) + " M";
  else if (a >= 1e3) t = fmt(a / 1e3) + " mil";
  else t = fmt(a);
  if (v < 0) return "$-" + t;
  return (sign && v > 0 ? "+" : "") + "$" + t;
}

/** "$54,29 MM" → ["$54,29", "MM"]: el valor grande con la unidad en pequeño. */
export const splitUnit = (text: string): [string, string] => {
  const unit = text.split(" ").pop() ?? "";
  return /^(M|MM|mil)$/.test(unit) ? [text.slice(0, -unit.length).trim(), unit] : [text, ""];
};

/** Dinero completo: "$1.650.000.000". */
export const full = (v: number) => (v < 0 ? "$-" : "$") + fmt(Math.abs(Math.round(v)));

/** Fracción a porcentaje: 0,767 → "76,7%". "—" si no hay dato. */
export const pct = (x: number | null | undefined, dec = 1) =>
  x !== null && x !== undefined && isFinite(x) ? fmt(x * 100, dec) + "%" : "—";

/** Diferencia en puntos porcentuales: -0,001 → "-0,1 pp". */
export const pp = (x: number) =>
  isFinite(x)
    ? (x > 0.0005 ? "+" : x < -0.0005 ? "-" : "") + fmt(Math.abs(x * 100), 1) + " pp"
    : "—";

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Semáforo de cumplimiento: ≥100% bien · ≥90% alerta · <90% crítico. */
export const sem = (x: number): Tone => (x >= 1 ? "ok" : x >= 0.9 ? "warn" : "crit");

/* ---------- fechas ---------- */

export const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const pad = (n: number) => String(n).padStart(2, "0");

const ymd = (iso: string) => iso.slice(0, 10).split("-").map(Number);

/** Día de la semana (0 = domingo) de "YYYY-MM-DD". */
export const weekdayOf = (iso: string) => {
  const [y, m, d] = ymd(iso);
  return new Date(y, m - 1, d).getDay();
};

export const isWeekend = (iso: string) => {
  const w = weekdayOf(iso);
  return w === 0 || w === 6;
};

/** "2026-09-28" → "28/09/2026". */
export const fecha = (iso: string) => {
  const [y, m, d] = ymd(iso);
  return `${pad(d)}/${pad(m)}/${y}`;
};

/** "2026-09-28" → "28/09". */
export const fechaCorta = (iso: string) => {
  const [, m, d] = ymd(iso);
  return `${pad(d)}/${pad(m)}`;
};

/** "2026-09-28" → "Lun 28/09" (títulos de los tooltips por día). */
export const diaLabel = (iso: string) => `${cap(WEEKDAYS[weekdayOf(iso)])} ${fechaCorta(iso)}`;

/** Corte de la foto: "28/09/2026, 05:00 p. m.". */
export const fmtCutoff = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

/** Fecha y hora de un pago: { date: "27/09/2026", weekday: "dom", time: "14:05" }. */
export const fmtPaidAt = (iso: string) => {
  const d = new Date(iso);
  return {
    date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    weekday: WEEKDAYS[d.getDay()],
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
};
