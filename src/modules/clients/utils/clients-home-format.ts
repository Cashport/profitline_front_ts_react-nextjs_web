import dayjs from "dayjs";

import type { DuePeriod } from "../constants/clients-home";

/* Formatos del Home de Clientes, iguales al diseño: montos en millones con
   un decimal ("$ 4.892,1") y "—" para los ceros de columnas opcionales. */

const oneDecimal = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const upToOneDecimal = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const noDecimals = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });

/** "$ 4.892,1" (millones, 1 decimal). */
export const fmt = (value: number | null | undefined): string => {
  const v = Number(value ?? 0);
  return `${v < 0 ? "-" : ""}$ ${oneDecimal.format(Math.abs(v) / 1e6)}`;
};

/** Como `fmt`, pero el cero es "—". */
export const money = (value: number | null | undefined): string => (!value ? "—" : fmt(value));

/** Leyenda de tramos del KPI: "78,5k" desde 10.000 millones, si no "4.210". */
export const fmtHeroShort = (value: number): string => {
  const m = value / 1e6;
  return Math.abs(m) >= 10000 ? `${upToOneDecimal.format(m / 1000)}k` : noDecimals.format(m);
};

/** "98%" */
export const pctInt = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${noDecimals.format(Math.round(value))}%`;

/** "44,1%" */
export const pct1 = (value: number | null | undefined): string =>
  value === null || value === undefined ? "—" : `${oneDecimal.format(value)}%`;

/** "30/09/2026, 09:06 a. m." */
export const fmtCutoff = (iso: string): string =>
  new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

/** "2026-09-28" → "28/09/2026" sin pasar por la zona horaria del navegador. */
export const fmtIsoDate = (iso: string | null): string => {
  if (!iso) return "…";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export const clientsLabel = (n: number) => `${n} ${n === 1 ? "cliente" : "clientes"}`;

/** Rango de vencimientos de un periodo predefinido. */
export const duePeriodRange = (period: DuePeriod): { from: string; to: string } => {
  const today = dayjs();
  const f = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");
  switch (period) {
    case "Hoy":
      return { from: f(today), to: f(today) };
    case "Esta semana": {
      // Semana de lunes a domingo.
      const monday = today.subtract((today.day() + 6) % 7, "day");
      return { from: f(monday), to: f(monday.add(6, "day")) };
    }
    case "Mes actual":
      return { from: f(today.startOf("month")), to: f(today.endOf("month")) };
    case "Último mes": {
      const prev = today.subtract(1, "month");
      return { from: f(prev.startOf("month")), to: f(prev.endOf("month")) };
    }
    case "Último trimestre":
      return { from: f(today.subtract(3, "month")), to: f(today) };
    case "YTD":
      return { from: f(today.startOf("year")), to: f(today) };
    case "Últimos 12 meses":
      return { from: f(today.subtract(12, "month")), to: f(today) };
    default:
      return { from: f(today), to: f(today) };
  }
};
