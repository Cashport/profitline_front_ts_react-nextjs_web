import type {
  IClosingClientApi,
  IClosingComment,
  IClosingDataResponse,
  IClosingHistoryResponse,
  IClosingInfo
} from "@/types/closings/IClosings";

import { DEMO_DATASET } from "./closings-demo-source";

/* Modo demo (/cierres?demo=1, solo fuera de producción): las mismas funciones del servicio
   de cierres pero sobre datos inventados, para revisar el diseño sin cargar un cierre real. */

const { portfolio, payments, comments: seedComments, closings: seedClosings } = DEMO_DATASET;

const clients: IClosingClientApi[] = Array.from(
  new Map(
    portfolio.map((r) => [
      r.nit,
      {
        nit: r.nit,
        name: r.client,
        executive_email: null,
        executive_name: r.collectionExecutive,
        market: r.channel,
        kam: r.salesExecutive,
        kam_lider: r.manager,
        coordinator: r.coordinator,
        holding: r.holding
      }
    ])
  ).values()
);

const closings: IClosingInfo[] = seedClosings.map((c, i) => ({
  id: i + 1,
  period: c.period,
  file_name: c.fileName,
  status: "READY",
  error_message: null,
  error_detail: null,
  document_rows: c.rows,
  payment_rows: payments.filter((p) => p.period === c.period).length,
  portfolio_amount: portfolio
    .filter((r) => r.period === c.period)
    .reduce((acc, r) => acc + r.amount, 0),
  payment_amount: payments
    .filter((p) => p.period === c.period)
    .reduce((acc, p) => acc + p.amount, 0),
  created_by_email: "demo@cashport.co",
  created_at: c.loadedAt,
  finished_at: c.loadedAt
}));

let comments: IClosingComment[] = seedComments.map((c, i) => ({
  id: i + 1,
  period: c.period,
  nit: c.nit,
  client_name: c.client,
  comment: c.text,
  created_by_email: "demo@cashport.co",
  created_by_name: c.author,
  created_at: c.createdAt,
  updated_at: null
}));

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

const portfolioTuples = (periods: string[]) => {
  const map = new Map<string, IClosingDataResponse["portfolio"][number]>();
  portfolio
    .filter((r) => periods.includes(r.period))
    .forEach((r) => {
      const cause = r.kind === "Factura" ? "Factura" : r.balanceType;
      const key = [r.period, r.nit, r.kind, cause, r.bucket].join("|");
      const e = map.get(key) ?? [r.period, r.nit, r.kind, cause, r.bucket, 0, 0];
      e[5] += r.amount;
      e[6] += r.documents;
      map.set(key, e);
    });
  return Array.from(map.values());
};

const paymentTuples = (periods: string[]) => {
  const map = new Map<string, IClosingDataResponse["payments"][number]>();
  payments
    .filter((p) => periods.includes(p.period))
    .forEach((p) => {
      const key = [p.period, p.nit, p.status].join("|");
      const e = map.get(key) ?? [p.period, p.nit, p.status, 0, 0];
      e[3] += p.amount;
      e[4] += 1;
      map.set(key, e);
    });
  return Array.from(map.values());
};

const BUCKET_INDEX: Record<string, number> = {
  Corriente: 2,
  "0-30": 3,
  "31-60": 4,
  "61-90": 5,
  "91-120": 6,
  "+120": 7
};

export const demoClosingsApi = {
  getClosings: () => delay(closings),
  getClosingData: (period: string): Promise<IClosingDataResponse> => {
    const index = closings.findIndex((c) => c.period === period);
    const previous = closings[index + 1]?.period ?? null;
    const periods = previous ? [period, previous] : [period];
    return delay({
      closing: closings[index],
      previous_period: previous,
      clients,
      portfolio: portfolioTuples(periods),
      payments: paymentTuples(periods)
    });
  },
  getClosingHistory: (): Promise<IClosingHistoryResponse> => {
    const map = new Map<string, IClosingHistoryResponse["rows"][number]>();
    const row = (period: string, nit: string) => {
      const key = `${period}|${nit}`;
      const e = map.get(key) ?? [period, nit, 0, 0, 0, 0, 0, 0, 0];
      map.set(key, e);
      return e;
    };
    portfolio.forEach((r) => {
      const e = row(r.period, r.nit);
      const i = BUCKET_INDEX[r.bucket] as 2 | 3 | 4 | 5 | 6 | 7;
      e[i] += r.amount;
    });
    payments.forEach((p) => {
      row(p.period, p.nit)[8] += p.amount;
    });
    const unapplied = payments
      .filter((p) => !p.status.toLowerCase().startsWith("compensado"))
      .map((p, i): IClosingHistoryResponse["unapplied"][number] => [
        p.period,
        p.nit,
        p.status,
        p.amount,
        `${p.period}-${String(20 + (i % 10)).padStart(2, "0")}`,
        null,
        String(700100000 + i * 37)
      ]);
    return delay({ rows: Array.from(map.values()), unapplied, clients });
  },
  getClosingComments: () => delay(comments),
  createClosingComment: (input: { period: string; nit: string; comment: string }) => {
    const created: IClosingComment = {
      id: Date.now(),
      period: input.period,
      nit: input.nit,
      client_name: clients.find((c) => c.nit === input.nit)?.name ?? null,
      comment: input.comment,
      created_by_email: "demo@cashport.co",
      created_by_name: "Miguel Martínez",
      created_at: new Date().toISOString(),
      updated_at: null
    };
    comments = [created, ...comments];
    return delay(created);
  },
  updateClosingComment: (id: number, comment: string) => {
    comments = comments.map((c) =>
      c.id === id ? { ...c, comment, updated_at: new Date().toISOString() } : c
    );
    return delay(comments.find((c) => c.id === id) as IClosingComment);
  },
  deleteClosingComment: (id: number) => {
    comments = comments.filter((c) => c.id !== id);
    return delay(undefined);
  }
};
