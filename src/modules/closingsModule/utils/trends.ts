import {
  AGING_BUCKETS,
  type AgingBucket,
  type IClosingClientInfo,
  type IClosingHistoryRow
} from "@/types/closings/IClosings";

import { emptyBuckets, type BucketTotals } from "./aggregate";

/* Indicadores de tendencia entre cierres. Todo sale del histórico por cliente y cierre
   (cartera por tramo y recaudo), ya filtrado; nada se lee de la cartera viva. */

/** Días representativos de cada tramo para la edad promedio del vencido (aproximada). */
const BUCKET_DAYS: Record<AgingBucket, number> = {
  Corriente: 0,
  "0-30": 15,
  "31-60": 45,
  "61-90": 75,
  "91-120": 105,
  "+120": 150
};

/** Transiciones de la escalera de mora: de un tramo al siguiente en el cierre siguiente.
    No incluye 91-120 → +120: +120 acumula todo lo más viejo y el cociente pasa de 100 %. */
export const ROLL_STEPS: { from: AgingBucket; to: AgingBucket; label: string }[] = [
  { from: "0-30", to: "31-60", label: "1-30 → 31-60" },
  { from: "31-60", to: "61-90", label: "31-60 → 61-90" },
  { from: "61-90", to: "91-120", label: "61-90 → 91-120" }
];

const TOP_N = 10;

export interface PeriodStats {
  period: string;
  total: number;
  overdue: number;
  overduePct: number;
  overdue30Pct: number;
  /** Edad promedio del vencido en días, ponderada por monto. */
  avgAge: number;
  collected: number;
  /** Recaudo del mes sobre la cartera del cierre anterior (null en el primer cierre). */
  collectionRate: number | null;
  /** Parte del vencido que tienen los 10 clientes con más vencido. */
  topShare: number;
  buckets: BucketTotals;
  /** Rodamiento de cada tramo frente al cierre anterior (null en el primer cierre). */
  roll: Record<string, number | null>;
}

const overdueOf = (b: BucketTotals) =>
  AGING_BUCKETS.slice(1).reduce((acc, k) => acc + Math.max(0, b[k]), 0);

export function periodStats(history: IClosingHistoryRow[], periods: string[]): PeriodStats[] {
  const stats: PeriodStats[] = [];
  periods.forEach((period, i) => {
    const rows = history.filter((h) => h.period === period);
    const buckets = emptyBuckets();
    let collected = 0;
    rows.forEach((r) => {
      AGING_BUCKETS.forEach((b) => (buckets[b] += r.buckets[b]));
      collected += r.collected;
    });
    const total = AGING_BUCKETS.reduce((acc, b) => acc + buckets[b], 0);
    const overdue = total - buckets.Corriente;
    const positiveOverdue = overdueOf(buckets);
    const avgAge = positiveOverdue
      ? AGING_BUCKETS.slice(1).reduce(
          (acc, b) => acc + Math.max(0, buckets[b]) * BUCKET_DAYS[b],
          0
        ) / positiveOverdue
      : 0;
    const clientOverdue = rows.map((r) => overdueOf(r.buckets)).sort((a, b) => b - a);
    const topShare = positiveOverdue
      ? clientOverdue.slice(0, TOP_N).reduce((acc, v) => acc + v, 0) / positiveOverdue
      : 0;
    const prev = stats[i - 1];
    stats.push({
      period,
      total,
      overdue,
      overduePct: total ? overdue / total : 0,
      overdue30Pct: total ? (overdue - buckets["0-30"]) / total : 0,
      avgAge,
      collected,
      collectionRate: prev && prev.total ? collected / prev.total : null,
      topShare,
      buckets,
      roll: Object.fromEntries(
        ROLL_STEPS.map((s) => [
          s.label,
          prev && prev.buckets[s.from] > 0
            ? Math.max(0, buckets[s.to]) / prev.buckets[s.from]
            : null
        ])
      )
    });
  });
  return stats;
}

export interface HeatRow {
  name: string;
  values: (number | null)[];
  /** Cartera del último cierre, para ordenar. */
  weight: number;
}

/** % vencido por mercado y cierre (mapa de calor), con la fila Total al final. */
export function marketHeatmap(
  history: IClosingHistoryRow[],
  periods: string[],
  clientOf: (nit: string) => IClosingClientInfo
): HeatRow[] {
  const acc = new Map<string, Map<string, { total: number; current: number }>>();
  history.forEach((h) => {
    const market = clientOf(h.nit).market;
    const byPeriod = acc.get(market) ?? new Map();
    const e = byPeriod.get(h.period) ?? { total: 0, current: 0 };
    e.total += h.total;
    e.current += h.buckets.Corriente;
    byPeriod.set(h.period, e);
    acc.set(market, byPeriod);
  });
  const last = periods[periods.length - 1];
  const rows: HeatRow[] = Array.from(acc.entries()).map(([name, byPeriod]) => ({
    name,
    weight: byPeriod.get(last)?.total ?? 0,
    values: periods.map((p) => {
      const e = byPeriod.get(p);
      return e && e.total > 0 ? (e.total - e.current) / e.total : null;
    })
  }));
  rows.sort((a, b) => b.weight - a.weight);
  return rows;
}

export interface ClientTrend {
  nit: string;
  client: string;
  market: string;
  executive: string;
  /** % vencido por cierre (null si el cliente no estaba). */
  series: (number | null)[];
  overdue: number;
  overduePct: number;
  /** Cambio en puntos del % vencido entre el primer y el último cierre de la racha. */
  change: number;
  /** Cierres seguidos al cierre más reciente con +120 > 0 (mora crónica). */
  chronicMonths: number;
  over120: number;
}

export interface ClientSignals {
  worsening: ClientTrend[];
  improving: ClientTrend[];
  chronic: ClientTrend[];
}

/** Cierres seguidos (los más recientes) que se miran para decir que un cliente "empeora". */
export const STREAK = 3;
/** Vencido mínimo para entrar a las señales: evita ruido de clientes muy pequeños. */
const MIN_OVERDUE = 5_000_000;

/**
 * Señales por cliente: empeora o mejora el % vencido en cada uno de los últimos cierres
 * (STREAK), y mora crónica (+120 en todos los cierres recientes).
 */
export function clientSignals(
  history: IClosingHistoryRow[],
  periods: string[],
  clientOf: (nit: string) => IClosingClientInfo
): ClientSignals {
  const byNit = new Map<string, Map<string, IClosingHistoryRow>>();
  history.forEach((h) => {
    const m = byNit.get(h.nit) ?? new Map();
    m.set(h.period, h);
    byNit.set(h.nit, m);
  });
  const recent = periods.slice(-STREAK);
  const last = periods[periods.length - 1];
  const trends: ClientTrend[] = [];

  byNit.forEach((rows, nit) => {
    const lastRow = rows.get(last);
    if (!lastRow || lastRow.total <= 0) return;
    const series = periods.map((p) => {
      const r = rows.get(p);
      return r && r.total > 0 ? (r.total - r.buckets.Corriente) / r.total : null;
    });
    const recentSeries = series.slice(-STREAK);
    let chronicMonths = 0;
    for (let i = periods.length - 1; i >= 0; i -= 1) {
      if ((rows.get(periods[i])?.buckets["+120"] ?? 0) > 0) chronicMonths += 1;
      else break;
    }
    const info = clientOf(nit);
    const first = recentSeries[0];
    const current = recentSeries[recentSeries.length - 1] ?? 0;
    trends.push({
      nit,
      client: info.client,
      market: info.market,
      executive: info.executive,
      series,
      overdue: lastRow.total - lastRow.buckets.Corriente,
      overduePct: current,
      change: first === null ? 0 : current - first,
      chronicMonths,
      over120: lastRow.buckets["+120"]
    });
  });

  const monotonic = (t: ClientTrend, dir: 1 | -1) => {
    const s = t.series.slice(-STREAK);
    if (s.length < STREAK || s.some((v) => v === null)) return false;
    for (let i = 1; i < s.length; i += 1) {
      if (((s[i] as number) - (s[i - 1] as number)) * dir <= 0.002) return false;
    }
    return true;
  };

  return {
    worsening: trends
      .filter((t) => t.overdue >= MIN_OVERDUE && monotonic(t, 1))
      .sort((a, b) => b.overdue - a.overdue),
    improving: trends
      .filter((t) => monotonic(t, -1) && recent.length === STREAK)
      .sort((a, b) => a.change - b.change),
    chronic: trends
      .filter((t) => t.chronicMonths >= Math.min(STREAK, periods.length) && t.over120 > 0)
      .sort((a, b) => b.over120 - a.over120)
  };
}

/* ---------- Racha del cliente (como los resultados de un equipo) ---------- */

export type FormResult = "win" | "draw" | "loss";

export interface FormDot {
  period: string;
  /** null: el cliente no estaba en ese cierre o no hay cierre anterior con qué comparar. */
  result: FormResult | null;
  overduePct: number | null;
  /** Cambio en puntos frente al cierre anterior. */
  change: number | null;
}

/** Subida del % vencido (en puntos) hasta la que el cierre queda en gris; más es malo. */
export const FORM_LOSS = 0.005;
/** Variación que se considera "se mantuvo" (redondeo de una centésima de punto). */
const FORM_SAME = 0.0005;
/** % vencido con el que un cliente se considera sano aunque no haya bajado. */
export const FORM_HEALTHY = 0.05;
export const FORM_LENGTH = 6;

/**
 * Racha de los últimos cierres por cliente. Cada cierre se compara con el anterior:
 * bueno si el % vencido bajó o se mantuvo (o está sano, ≤ 5 %); gris si subió hasta medio
 * punto; malo si subió más de medio punto.
 */
export function clientForm(
  history: IClosingHistoryRow[],
  periods: string[],
  length = FORM_LENGTH
): Map<string, FormDot[]> {
  const pct = new Map<string, Map<string, number>>();
  history.forEach((h) => {
    if (h.total <= 0) return;
    const m = pct.get(h.nit) ?? new Map<string, number>();
    m.set(h.period, (h.total - h.buckets.Corriente) / h.total);
    pct.set(h.nit, m);
  });
  const window = periods.slice(-length);
  const result = new Map<string, FormDot[]>();
  pct.forEach((byPeriod, nit) => {
    result.set(
      nit,
      window.map((period) => {
        const current = byPeriod.get(period) ?? null;
        const prevPeriod = periods[periods.indexOf(period) - 1];
        const previous = prevPeriod ? byPeriod.get(prevPeriod) ?? null : null;
        if (current === null) return { period, result: null, overduePct: null, change: null };
        const change = previous === null ? null : current - previous;
        let res: FormResult | null = null;
        if (current <= FORM_HEALTHY) res = "win";
        else if (change !== null) {
          res = change > FORM_LOSS ? "loss" : change > FORM_SAME ? "draw" : "win";
        }
        return { period, result: res, overduePct: current, change };
      })
    );
  });
  return result;
}

/** Puntos de la racha (3 por cierre ganado, 1 por empatado), para ordenar la tabla. */
export const formScore = (dots: FormDot[] | undefined) =>
  (dots ?? []).reduce((acc, d) => acc + (d.result === "win" ? 3 : d.result === "draw" ? 1 : 0), 0);

/* ---------- Eje con zoom (barras de totales parecidos mes a mes) ---------- */

const niceStep = (raw: number) => {
  if (raw <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
};

/**
 * Rango del eje Y que hace zoom sobre la parte de arriba de las barras, para que se note si
 * un mes subió o bajó. Es relativo: el piso queda por debajo del menor total a 1,2 veces la
 * diferencia entre el mayor y el menor (sin bajar de 0 ni subir del 90 % del menor), y el techo
 * un poco por encima del mayor. Sirve igual para recaudos de 130 mil M que de 5 mil M.
 */
export function zoomedDomain(
  totals: number[],
  /** Menor valor del tramo de abajo de la pila: el piso nunca pasa del 60 % para que se vea. */
  baseMin?: number
): { min: number; max: number; zoomed: boolean } {
  const values = totals.filter((v) => v > 0);
  if (!values.length) return { min: 0, max: 1, zoomed: false };
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = high - low || high * 0.1;
  const floor = Math.max(
    0,
    Math.min(low - range * 1.2, low * 0.9, baseMin !== undefined ? baseMin * 0.6 : Infinity)
  );
  const step = niceStep((high + range * 0.15 - floor) / 6);
  const min = Math.floor(floor / step) * step;
  const max = Math.ceil((high + range * 0.15) / step) * step;
  return { min, max, zoomed: min > 0 };
}
