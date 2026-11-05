import {
  AGING_BUCKETS,
  type AgingBucket,
  type IClosingHistoryRow,
  type IClosingPaymentRow,
  type IClosingPortfolioRow
} from "@/types/closings/IClosings";

/* Cálculos del tablero. Todo sale de las filas del cierre ya filtradas: nada se lee de
   Cashport, para que las cifras sean las mismas que reportó el cliente desde su ERP. */

export type BucketTotals = Record<AgingBucket, number>;

export const emptyBuckets = (): BucketTotals =>
  Object.fromEntries(AGING_BUCKETS.map((b) => [b, 0])) as BucketTotals;

export interface PortfolioTotals {
  total: number;
  current: number;
  overdue: number;
  overduePct: number;
  /** Vencido a más de 30 días: el que se mira en comité. */
  overdue30: number;
  invoices: number;
  openBalances: number;
  notes: number;
  buckets: BucketTotals;
  clients: number;
  documents: number;
}

export const portfolioTotals = (rows: IClosingPortfolioRow[]): PortfolioTotals => {
  const buckets = emptyBuckets();
  const nits = new Set<string>();
  let invoices = 0;
  let openBalances = 0;
  let notes = 0;
  let documents = 0;
  rows.forEach((r) => {
    buckets[r.bucket] += r.amount;
    nits.add(r.nit);
    documents += r.documents;
    if (r.kind === "Factura") invoices += r.amount;
    else if (r.kind === "Saldos") openBalances += r.amount;
    else if (r.kind === "NC") notes += r.amount;
  });
  const total = AGING_BUCKETS.reduce((acc, b) => acc + buckets[b], 0);
  const current = buckets.Corriente;
  const overdue = total - current;
  return {
    total,
    current,
    overdue,
    overduePct: total ? overdue / total : 0,
    overdue30: overdue - buckets["0-30"],
    invoices,
    openBalances,
    notes,
    buckets,
    clients: nits.size,
    documents
  };
};

export type PortfolioDimension =
  | "market"
  | "kam"
  | "executive"
  | "kamLeader"
  | "coordinator"
  | "holding"
  | "balanceType";

export interface DimensionRow {
  name: string;
  total: number;
  current: number;
  overdue: number;
  overduePct: number;
  buckets: BucketTotals;
  clients: number;
}

export const groupPortfolio = (
  rows: IClosingPortfolioRow[],
  dim: PortfolioDimension
): DimensionRow[] => {
  const map = new Map<string, { buckets: BucketTotals; nits: Set<string> }>();
  rows.forEach((r) => {
    const key = r[dim] || "Sin asignar";
    const entry = map.get(key) ?? { buckets: emptyBuckets(), nits: new Set<string>() };
    entry.buckets[r.bucket] += r.amount;
    entry.nits.add(r.nit);
    map.set(key, entry);
  });
  return Array.from(map.entries())
    .map(([name, { buckets, nits }]) => {
      const total = AGING_BUCKETS.reduce((acc, b) => acc + buckets[b], 0);
      const overdue = total - buckets.Corriente;
      return {
        name,
        total,
        current: buckets.Corriente,
        overdue,
        overduePct: total ? overdue / total : 0,
        buckets,
        clients: nits.size
      };
    })
    .sort((a, b) => b.total - a.total);
};

/** Grupos del tooltip de cartera (como en Clientes): Facturas, Saldos, Notas y lo demás. */
export const KIND_GROUPS = ["Facturas", "Saldos", "Notas", "Otros"] as const;
export type KindGroup = (typeof KIND_GROUPS)[number];

export const kindGroupOf = (kind: string): KindGroup =>
  kind === "Factura"
    ? "Facturas"
    : kind === "Saldos"
      ? "Saldos"
      : kind === "NC"
        ? "Notas"
        : "Otros";

export interface ClientRow {
  nit: string;
  client: string;
  market: string;
  kam: string;
  executive: string;
  total: number;
  current: number;
  overdue: number;
  overduePct: number;
  buckets: BucketTotals;
  openBalances: number;
  notes: number;
  collected: number;
  /** Recaudo del cierre anterior (null si no hay cierre anterior). */
  prevCollected: number | null;
  /** % vencido del cierre anterior (null si el cliente no estaba). */
  prevOverduePct: number | null;
  /** Cartera por tipo y tramo, para el tooltip de la celda Cartera. */
  byKind: Record<KindGroup, BucketTotals>;
}

export const clientRows = (
  rows: IClosingPortfolioRow[],
  payments: IClosingPaymentRow[],
  prevRows: IClosingPortfolioRow[],
  prevPayments: IClosingPaymentRow[] | null
): ClientRow[] => {
  const collected = new Map<string, number>();
  payments.forEach((p) => collected.set(p.nit, (collected.get(p.nit) ?? 0) + p.amount));
  const prevCollected = new Map<string, number>();
  prevPayments?.forEach((p) =>
    prevCollected.set(p.nit, (prevCollected.get(p.nit) ?? 0) + p.amount)
  );

  const prev = new Map<string, { total: number; current: number }>();
  prevRows.forEach((r) => {
    const e = prev.get(r.nit) ?? { total: 0, current: 0 };
    e.total += r.amount;
    if (r.bucket === "Corriente") e.current += r.amount;
    prev.set(r.nit, e);
  });

  const map = new Map<string, ClientRow>();
  rows.forEach((r) => {
    const e =
      map.get(r.nit) ??
      ({
        nit: r.nit,
        client: r.client,
        market: r.market,
        kam: r.kam,
        executive: r.executive,
        total: 0,
        current: 0,
        overdue: 0,
        overduePct: 0,
        buckets: emptyBuckets(),
        openBalances: 0,
        notes: 0,
        collected: collected.get(r.nit) ?? 0,
        prevCollected: prevPayments ? prevCollected.get(r.nit) ?? 0 : null,
        prevOverduePct: null,
        byKind: Object.fromEntries(KIND_GROUPS.map((g) => [g, emptyBuckets()])) as Record<
          KindGroup,
          BucketTotals
        >
      } as ClientRow);
    e.buckets[r.bucket] += r.amount;
    e.byKind[kindGroupOf(r.kind)][r.bucket] += r.amount;
    e.total += r.amount;
    if (r.kind === "Saldos") e.openBalances += r.amount;
    if (r.kind === "NC") e.notes += r.amount;
    map.set(r.nit, e);
  });

  return Array.from(map.values()).map((e) => {
    const p = prev.get(e.nit);
    const current = e.buckets.Corriente;
    return {
      ...e,
      current,
      overdue: e.total - current,
      overduePct: e.total ? (e.total - current) / e.total : 0,
      prevOverduePct: p && p.total ? (p.total - p.current) / p.total : null
    };
  });
};

export interface CollectionDelta {
  nit: string;
  client: string;
  market: string;
  previous: number;
  current: number;
  delta: number;
  pct: number | null;
}

/** Recaudo por cliente frente al cierre anterior, para "mejoraron / empeoraron". */
export const collectionDeltas = (
  payments: IClosingPaymentRow[],
  prevPayments: IClosingPaymentRow[]
): CollectionDelta[] => {
  const map = new Map<string, CollectionDelta>();
  const touch = (p: IClosingPaymentRow) =>
    map.get(p.nit) ??
    ({
      nit: p.nit,
      client: p.client,
      market: p.market,
      previous: 0,
      current: 0,
      delta: 0,
      pct: null
    } as CollectionDelta);
  prevPayments.forEach((p) => {
    const e = touch(p);
    e.previous += p.amount;
    map.set(p.nit, e);
  });
  payments.forEach((p) => {
    const e = touch(p);
    e.current += p.amount;
    map.set(p.nit, e);
  });
  return Array.from(map.values()).map((e) => ({
    ...e,
    delta: e.current - e.previous,
    pct: e.previous ? (e.current - e.previous) / e.previous : null
  }));
};

export const sumBy = <T>(items: T[], pick: (item: T) => number) =>
  items.reduce((acc, item) => acc + pick(item), 0);

export interface PeriodTotals {
  period: string;
  total: number;
  current: number;
  overdue: number;
  overduePct: number;
  collected: number;
  buckets: BucketTotals;
}

/** Totales por cierre a partir del histórico por cliente (evolución de los cierres). */
export const periodTotals = (rows: IClosingHistoryRow[], periods: string[]): PeriodTotals[] =>
  periods.map((period) => {
    const buckets = emptyBuckets();
    let collected = 0;
    rows.forEach((r) => {
      if (r.period !== period) return;
      AGING_BUCKETS.forEach((b) => (buckets[b] += r.buckets[b]));
      collected += r.collected;
    });
    const total = AGING_BUCKETS.reduce((acc, b) => acc + buckets[b], 0);
    const overdue = total - buckets.Corriente;
    return {
      period,
      total,
      current: buckets.Corriente,
      overdue,
      overduePct: total ? overdue / total : 0,
      collected,
      buckets
    };
  });
