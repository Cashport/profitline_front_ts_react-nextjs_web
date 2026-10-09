import type {
  ClientsHomeAgingBucket,
  ClientsHomeForecastStatus
} from "@/types/clients/IClientsHome";

/* Home de Clientes: tramos, colores y umbrales del diseño "Clientes Home". */

/** Ruta del Home (el layout de /clientes también envuelve el detalle). */
export const CLIENTS_HOME_PATH = "/clientes/all";

export const AGING_BUCKETS: {
  key: ClientsHomeAgingBucket;
  label: string;
  /** Rótulo corto de la leyenda del KPI. */
  short: string;
  color: string;
}[] = [
  { key: "corriente", label: "Corriente", short: "Corr.", color: "#cbe71e" },
  { key: "1-30", label: "1–30", short: "1–30", color: "#f5c542" },
  { key: "31-60", label: "31–60", short: "31–60", color: "#ff9a3c" },
  { key: "61-90", label: "61–90", short: "61–90", color: "#ff6a13" },
  { key: "91-120", label: "91–120", short: "91–120", color: "#e5195e" },
  { key: "+120", label: "+120", short: "+120", color: "#b0124a" },
  { key: "+360", label: "+360", short: "+360", color: "#5c0a2e" }
];

export const AGING_BY_KEY = Object.fromEntries(AGING_BUCKETS.map((b) => [b.key, b])) as Record<
  ClientsHomeAgingBucket,
  (typeof AGING_BUCKETS)[number]
>;

/** Barra de recaudo vs meta. */
export const COLLECTION_COLORS = {
  collected: "#cbe71e",
  agreementsActive: "#2b4a5f",
  agreementsBroken: "#e5262b"
};

/** La meta se dibuja al 80% de la barra: deja ver cuánto se pasa el forecast. */
export const GOAL_SCALE = 1.25;

/** Colores de la leyenda de mercados, en el orden en que llegan (más clientes primero). */
export const MARKET_PALETTE = [
  "#1677ff",
  "#ff6a13",
  "#9bb514",
  "#2b4a5f",
  "#e0007a",
  "#0fa3b1",
  "#7c3aed",
  "#a16207"
];
export const EMPTY_MARKET_COLOR = "#b5b5b5";

/** Valor del filtro para los clientes sin mercado / sin ejecutivo (lo define el backend). */
export const EMPTY_FILTER_KEY = "__none__";

export interface PillStyle {
  bg: string;
  color: string;
}

/** % vencido: desde el 30% va en rojo. En la fila de totales el neutro es más oscuro. */
export const pastDuePill = (pct: number | null, total = false): PillStyle =>
  pct !== null && pct >= 30
    ? { bg: "#fde8ef", color: "#b0124a" }
    : { bg: total ? "#e9e9e9" : "#f2f2f2", color: "#4a4a4a" };

export const FORECAST_STATUS: Record<
  ClientsHomeForecastStatus,
  { label: string; dot: string; bg: string; color: string }
> = {
  ok: { label: "Cumple", dot: "#9bb514", bg: "#e3f19a", color: "#141414" },
  near: { label: "Cerca", dot: "#b5b5b5", bg: "#f2f2f2", color: "#4a4a4a" },
  risk: { label: "En riesgo", dot: "#ff6a13", bg: "#fff1e6", color: "#c24a00" }
};

export const FORECAST_STATUS_ORDER: ClientsHomeForecastStatus[] = ["ok", "near", "risk"];

/** Mismo corte que el backend (`forecastStatusOf`). */
export const forecastStatusOf = (pct: number | null): ClientsHomeForecastStatus | null => {
  if (pct === null) return null;
  if (pct >= 100) return "ok";
  if (pct >= 80) return "near";
  return "risk";
};

/** Pill y punto del forecast; sin meta queda en gris. */
export const forecastStyle = (pct: number | null, total = false) => {
  const status = forecastStatusOf(pct);
  if (!status) return { dot: "#d6d6d6", bg: total ? "#e9e9e9" : "#f2f2f2", color: "#8a8a8a" };
  const s = FORECAST_STATUS[status];
  return status === "near" && total ? { ...s, bg: "#e9e9e9" } : s;
};

/** Periodos predefinidos del filtro de fecha (vencimiento de facturas). */
export const DUE_PERIODS = [
  "Hoy",
  "Esta semana",
  "Mes actual",
  "Último mes",
  "Último trimestre",
  "YTD",
  "Últimos 12 meses"
] as const;

export type DuePeriod = (typeof DUE_PERIODS)[number];

export const CLIENTS_HOME_PAGE_SIZE = 25;

/** Prefijo de las llaves de react-query del Home (para invalidar todo junto). */
export const CLIENTS_HOME_QUERY_KEY = "clients-home";
