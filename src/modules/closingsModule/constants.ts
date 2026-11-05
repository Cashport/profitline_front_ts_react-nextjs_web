import type { AgingBucket } from "@/types/closings/IClosings";

/** Escala de mora de docs/DESIGN.md §1 ("+120" toma el color de 91-120 en adelante). */
export const AGING_COLORS: Record<AgingBucket, string> = {
  Corriente: "#cbe71e",
  "0-30": "#f5b700",
  "31-60": "#ff6a13",
  "61-90": "#e5262b",
  "91-120": "#e0007a",
  "+120": "#a3004f"
};

export const AGING_LABELS: Record<AgingBucket, string> = {
  Corriente: "Corriente",
  "0-30": "1-30",
  "31-60": "31-60",
  "61-90": "61-90",
  "91-120": "91-120",
  "+120": "+120"
};

/** Paleta Profitline para mercados, en orden de tamaño: el azul oscuro de la marca para el
    mercado más grande, el naranja para el segundo y luego tonos de la misma familia. */
export const PROFITLINE_NAVY = "#011722";
const MARKET_PALETTE = [
  PROFITLINE_NAVY,
  "#ff5500",
  "#2c5a74",
  "#ff9a66",
  "#6f8ea3",
  "#c9d3da",
  "#b8541c",
  "#f3c9ae",
  "#3f7d8c",
  "#8a8a8a"
];

/** Color de cada mercado según su puesto en el cierre (lo fija useClosings con assignMarketColors). */
const assigned = new Map<string, string>();

const keyOf = (market: string) =>
  market
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

/** Reparte la paleta por tamaño: recibe los mercados del cierre de mayor a menor cartera. */
/** NIT del cierre que aún no existen en Clientes: se agrupan aparte con un color de aviso. */
export const PENDING_CLIENTS = "Pendientes por crear";
export const PENDING_COLOR = "#f5b700";
const PENDING_KEY = keyOf(PENDING_CLIENTS);

export const assignMarketColors = (marketsBySize: string[]) => {
  assigned.clear();
  marketsBySize
    .filter((m) => keyOf(m) && keyOf(m) !== "SIN ASIGNAR" && keyOf(m) !== PENDING_KEY)
    .forEach((m, i) => assigned.set(keyOf(m), MARKET_PALETTE[i % MARKET_PALETTE.length]));
};

export const marketColor = (market: string) => {
  const key = keyOf(market);
  if (key === PENDING_KEY) return PENDING_COLOR;
  if (!key || key === "SIN ASIGNAR") return "#c4c4c4";
  const known = assigned.get(key);
  if (known) return known;
  const color = MARKET_PALETTE[assigned.size % MARKET_PALETTE.length];
  assigned.set(key, color);
  return color;
};

/** Texto legible sobre un color de mercado: oscuro sobre los claros, blanco sobre los oscuros. */
export const textOn = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.62 ? "#141414" : "#ffffff";
};

/** % vencido que se considera riesgo alto (chip magenta). */
export const HIGH_OVERDUE = 0.4;

/** Series de las gráficas. */
export const SERIES = {
  current: "#141414",
  overdue: "#ff6a13",
  pct: "#d11a2a",
  collected: "#1677ff",
  previous: "#c4c4c4"
};
