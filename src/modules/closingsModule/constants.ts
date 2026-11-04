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

/** Colores de mercado/canal en orden fijo (DESIGN.md §1): mismo canal, mismo color. */
const CHANNEL_PALETTE = [
  "#1677ff",
  "#ff6a13",
  "#9bb514",
  "#2b4a5f",
  "#e0007a",
  "#0e9aa7",
  "#7b3fe4"
];

const CHANNEL_ORDER = [
  "TERRITORIAL",
  "INFORMAL",
  "ON PREMISE",
  "MODELOS ALTERNATIVOS DE VENTA",
  "Jurídico",
  "HOME MARKET",
  "DISTRIBUIDORES MAYORISTA"
];

export const channelColor = (channel: string) => {
  const idx = CHANNEL_ORDER.indexOf(channel);
  return idx >= 0 ? CHANNEL_PALETTE[idx % CHANNEL_PALETTE.length] : "#8a8a8a";
};

/** % vencido que se considera riesgo alto (chip magenta). */
export const HIGH_OVERDUE = 0.4;

/** Series de las gráficas. */
export const SERIES = {
  current: "#141414",
  overdue: "#ff6a13",
  pct: "#e0007a",
  collected: "#1677ff",
  previous: "#c4c4c4"
};
