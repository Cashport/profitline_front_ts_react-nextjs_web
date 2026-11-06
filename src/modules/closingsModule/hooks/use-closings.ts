import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import type {
  FilterCategoryConfig,
  FilterSelection
} from "@/components/ui/filter-modal/FilterModal.types";
import { useAppStore } from "@/lib/store/store";
import * as closingsService from "@/services/closings/closings";
import {
  AGING_BUCKETS,
  type AgingBucket,
  type IClosingClientApi,
  type IClosingClientInfo,
  type IClosingHistoryRow,
  type IClosingPaymentRow,
  type IClosingPortfolioRow,
  type IClosingUnappliedPayment
} from "@/types/closings/IClosings";

import { PENDING_CLIENTS, assignMarketColors } from "../constants";
import { demoClosingsApi } from "../mock/closings-demo";

/* Estado del tablero de cierres: cierre elegido, filtros, búsqueda y comentarios. Los datos
   vienen de /portfolio-closings; los filtros salen de los atributos del cliente (tabla client). */

const FILTER_FIELDS: { key: keyof IClosingClientInfo; label: string }[] = [
  { key: "executive", label: "Ejecutivo" },
  { key: "market", label: "Mercado" },
  { key: "kamLeader", label: "KAM líder" },
  { key: "kam", label: "KAM" },
  { key: "coordinator", label: "Coordinador" },
  { key: "holding", label: "Holding" }
];

const UNASSIGNED = "Sin asignar";

/** Filtro "Comentario del cierre": no es un atributo del cliente, sale de la bitácora. */
export const COMMENT_FILTER_KEY = "comment";
const WITH_COMMENT = "Con comentario";
const WITHOUT_COMMENT = "Sin comentario";

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const toClientInfo = (c: IClosingClientApi): IClosingClientInfo => ({
  nit: c.nit,
  client: c.name,
  market: c.market || UNASSIGNED,
  kam: c.kam || UNASSIGNED,
  kamLeader: c.kam_lider || UNASSIGNED,
  executive: c.executive_name || c.executive_email || UNASSIGNED,
  coordinator: c.coordinator || UNASSIGNED,
  holding: c.holding || UNASSIGNED
});

/** NIT que no existe en Clientes (o NIT 0, sin identificar): todos sus atributos quedan en
    "Pendientes por crear" para que se vean juntos en cualquier gráfico y filtro. */
const pendingClient = (nit: string): IClosingClientInfo => ({
  nit,
  client: nit === "0" ? "Sin identificar (NIT 0)" : `NIT ${nit} · por crear`,
  market: PENDING_CLIENTS,
  kam: PENDING_CLIENTS,
  kamLeader: PENDING_CLIENTS,
  executive: PENDING_CLIENTS,
  coordinator: PENDING_CLIENTS,
  holding: PENDING_CLIENTS
});

export interface IPendingClient {
  nit: string;
  documents: number;
  amount: number;
  payments: number;
}

const isBucket = (value: string): value is AgingBucket =>
  (AGING_BUCKETS as string[]).includes(value);

/** "Compensado" es lo aplicado por la compañía al corte; todo lo demás quedó pendiente. */
export const isCompensated = (status: string) => normalize(status).startsWith("compensado");

export function useClosings() {
  const searchParams = useSearchParams();
  const demo = process.env.NODE_ENV !== "production" && searchParams.get("demo") === "1";
  const api = demo ? demoClosingsApi : closingsService;
  const storeProjectId = useAppStore((state) => state.selectedProject?.ID);
  const projectId = demo ? -1 : storeProjectId;
  const [selectedPeriod, setPeriod] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterSelection>({});
  const [search, setSearch] = useState("");

  const closingsQuery = useSWR(projectId ? ["portfolio-closings", projectId] : null, () =>
    api.getClosings()
  );
  const closings = useMemo(() => closingsQuery.data ?? [], [closingsQuery.data]);
  const readyClosings = useMemo(() => closings.filter((c) => c.status === "READY"), [closings]);
  const period =
    selectedPeriod && readyClosings.some((c) => c.period === selectedPeriod)
      ? selectedPeriod
      : readyClosings[0]?.period ?? null;
  const closing = readyClosings.find((c) => c.period === period) ?? null;

  useEffect(() => {
    setFilters({});
    setSearch("");
    setPeriod(null);
  }, [projectId]);

  const dataQuery = useSWR(period ? ["portfolio-closings/data", projectId, period] : null, () =>
    api.getClosingData(period as string)
  );
  const historyQuery = useSWR(
    projectId && readyClosings.length
      ? ["portfolio-closings/history", projectId, readyClosings.map((c) => c.id).join(",")]
      : null,
    () => api.getClosingHistory()
  );
  const commentsQuery = useSWR(projectId ? ["portfolio-closings/comments", projectId] : null, () =>
    api.getClosingComments()
  );

  const knownClients = useMemo(() => {
    const map = new Map<string, IClosingClientInfo>();
    historyQuery.data?.clients.forEach((c) => map.set(c.nit, toClientInfo(c)));
    dataQuery.data?.clients.forEach((c) => map.set(c.nit, toClientInfo(c)));
    return map;
  }, [historyQuery.data, dataQuery.data]);
  const clientOf = useCallback(
    (nit: string) => knownClients.get(nit) ?? pendingClient(nit),
    [knownClients]
  );
  /** Todos los NIT de los cierres, incluidos los pendientes por crear (para filtros y búsqueda). */
  const clients = useMemo(() => {
    const map = new Map(knownClients);
    const add = (nit: string) => {
      if (!map.has(nit)) map.set(nit, pendingClient(nit));
    };
    dataQuery.data?.portfolio.forEach((r) => add(r[1]));
    dataQuery.data?.payments.forEach((r) => add(r[1]));
    historyQuery.data?.rows.forEach((r) => add(r[1]));
    historyQuery.data?.unapplied?.forEach((r) => add(r[1]));
    return map;
  }, [knownClients, dataQuery.data, historyQuery.data]);

  const prevPeriod = dataQuery.data?.previous_period ?? null;

  const allPortfolio = useMemo<IClosingPortfolioRow[]>(
    () =>
      (dataQuery.data?.portfolio ?? []).map(
        ([rowPeriod, nit, kind, cause, bucket, amount, documents]) => ({
          ...clientOf(nit),
          period: rowPeriod,
          kind,
          balanceType: cause,
          bucket: isBucket(bucket) ? bucket : "Corriente",
          amount,
          documents
        })
      ),
    [dataQuery.data, clientOf]
  );
  const allPayments = useMemo<IClosingPaymentRow[]>(
    () =>
      (dataQuery.data?.payments ?? []).map(([rowPeriod, nit, status, amount, payments]) => ({
        ...clientOf(nit),
        period: rowPeriod,
        status,
        amount,
        payments
      })),
    [dataQuery.data, clientOf]
  );

  /** NIT del cierre elegido que no existen en Clientes, sin filtros: es la lista para crearlos. */
  const pendingClients = useMemo<IPendingClient[]>(() => {
    const map = new Map<string, IPendingClient>();
    const entry = (nit: string) => {
      const current = map.get(nit) ?? { nit, documents: 0, amount: 0, payments: 0 };
      map.set(nit, current);
      return current;
    };
    dataQuery.data?.portfolio.forEach(([p, nit, , , , amount, documents]) => {
      if (p !== period || knownClients.has(nit)) return;
      const e = entry(nit);
      e.amount += amount;
      e.documents += documents;
    });
    dataQuery.data?.payments.forEach(([p, nit, , , payments]) => {
      if (p !== period || knownClients.has(nit)) return;
      entry(nit).payments += payments;
    });
    return Array.from(map.values()).sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  }, [dataQuery.data, knownClients, period]);

  const commentedNits = useMemo(
    () => new Set((commentsQuery.data ?? []).filter((c) => c.period === period).map((c) => c.nit)),
    [commentsQuery.data, period]
  );

  const filterCategories = useMemo<FilterCategoryConfig[]>(() => {
    const currentNits = new Set<string>();
    const categories: FilterCategoryConfig[] = FILTER_FIELDS.map(({ key, label }) => {
      const counts = new Map<string, Set<string>>();
      allPortfolio.forEach((r) => {
        if (r.period !== period) return;
        currentNits.add(r.nit);
        const value = String(r[key]);
        counts.set(value, (counts.get(value) ?? new Set()).add(r.nit));
      });
      return {
        key,
        label,
        options: Array.from(counts.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([name, nits]) => ({ id: name, name, count: nits.size }))
      };
    });
    const withComment = Array.from(currentNits).filter((n) => commentedNits.has(n)).length;
    categories.push({
      key: COMMENT_FILTER_KEY,
      label: "Comentario del cierre",
      options: [
        { id: WITH_COMMENT, name: WITH_COMMENT, count: withComment },
        { id: WITHOUT_COMMENT, name: WITHOUT_COMMENT, count: currentNits.size - withComment }
      ]
    });
    return categories;
  }, [allPortfolio, period, commentedNits]);

  /** Mercados del cierre con su cartera, para los chips de filtro (como en Clientes). */
  const markets = useMemo(() => {
    const totals = new Map<string, number>();
    allPortfolio.forEach((r) => {
      if (r.period === period) totals.set(r.market, (totals.get(r.market) ?? 0) + r.amount);
    });
    const sorted = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }));
    assignMarketColors(sorted.map((m) => m.name));
    return sorted;
  }, [allPortfolio, period]);
  const selectedMarkets = useMemo(() => (filters.market ?? []).map((m) => m.id), [filters.market]);
  const toggleMarket = useCallback(
    (market: string) =>
      setFilters((prev) => {
        const current = prev.market ?? [];
        const next = current.some((m) => m.id === market)
          ? current.filter((m) => m.id !== market)
          : [...current, { id: market, name: market }];
        return { ...prev, market: next };
      }),
    []
  );
  const clearMarkets = useCallback(() => setFilters((prev) => ({ ...prev, market: [] })), []);

  // Los filtros se aplican por cliente: un NIT pasa si cumple todas las categorías activas.
  const allowedNits = useMemo(() => {
    const active = Object.entries(filters).filter(
      ([key, items]) => key !== COMMENT_FILTER_KEY && items?.length
    );
    const commentFilter = (filters[COMMENT_FILTER_KEY] ?? []).map((i) => i.id);
    const byComment = commentFilter.length === 1 ? commentFilter[0] : null;
    const term = normalize(search.trim());
    if (!active.length && !term && !byComment) return null;
    const nits = new Set<string>();
    clients.forEach((c) => {
      const matchesFilters = active.every(([key, items]) =>
        items.some((i) => i.id === String(c[key as keyof IClosingClientInfo]))
      );
      const matchesComment =
        !byComment || (byComment === WITH_COMMENT) === commentedNits.has(c.nit);
      const matchesSearch = !term || normalize(c.client).includes(term) || c.nit.includes(term);
      if (matchesFilters && matchesSearch && matchesComment) nits.add(c.nit);
    });
    return nits;
  }, [clients, filters, search, commentedNits]);

  const visible = useCallback(
    <T extends { period: string; nit: string }>(rows: T[], p: string | null) =>
      p ? rows.filter((r) => r.period === p && (!allowedNits || allowedNits.has(r.nit))) : [],
    [allowedNits]
  );

  const portfolio = useMemo(() => visible(allPortfolio, period), [visible, allPortfolio, period]);
  const prevPortfolio = useMemo(
    () => visible(allPortfolio, prevPeriod),
    [visible, allPortfolio, prevPeriod]
  );
  const payments = useMemo(() => visible(allPayments, period), [visible, allPayments, period]);
  const prevPayments = useMemo(
    () => visible(allPayments, prevPeriod),
    [visible, allPayments, prevPeriod]
  );

  /** Cartera y recaudo por cliente y cierre, con los filtros aplicados. */
  const history = useMemo<IClosingHistoryRow[]>(
    () =>
      (historyQuery.data?.rows ?? [])
        .filter(([, nit]) => !allowedNits || allowedNits.has(nit))
        .map(([rowPeriod, nit, ...values]) => {
          const buckets = Object.fromEntries(AGING_BUCKETS.map((b, i) => [b, values[i]])) as Record<
            AgingBucket,
            number
          >;
          return {
            period: rowPeriod,
            nit,
            buckets,
            total: AGING_BUCKETS.reduce((acc, b) => acc + buckets[b], 0),
            collected: values[6]
          };
        }),
    [historyQuery.data, allowedNits]
  );

  const unapplied = useMemo<IClosingUnappliedPayment[]>(
    () =>
      (historyQuery.data?.unapplied ?? [])
        .filter(([, nit]) => !allowedNits || allowedNits.has(nit))
        .map(([rowPeriod, nit, status, amount, paymentDate, compensationDate, erpId]) => ({
          ...clientOf(nit),
          period: rowPeriod,
          status,
          amount,
          paymentDate,
          compensationDate,
          erpId
        })),
    [historyQuery.data, allowedNits, clientOf]
  );

  const comments = useMemo(
    () => (commentsQuery.data ?? []).filter((c) => !allowedNits || allowedNits.has(c.nit)),
    [commentsQuery.data, allowedNits]
  );

  const saveComment = useCallback(
    async (input: { id?: number; period: string; nit: string; comment: string }) => {
      if (input.id) await api.updateClosingComment(input.id, input.comment);
      else await api.createClosingComment(input);
      await commentsQuery.mutate();
    },
    [api, commentsQuery]
  );
  const removeComment = useCallback(
    async (id: number) => {
      await api.deleteClosingComment(id);
      await commentsQuery.mutate();
    },
    [api, commentsQuery]
  );

  const refreshClosings = useCallback(async () => {
    await closingsQuery.mutate();
  }, [closingsQuery]);

  return {
    demo,
    projectId,
    markets,
    selectedMarkets,
    toggleMarket,
    clearMarkets,
    unapplied,
    closings,
    readyClosings,
    closing,
    period,
    setPeriod,
    prevPeriod,
    filters,
    setFilters,
    filterCategories,
    search,
    setSearch,
    clientOf,
    pendingClients,
    portfolio,
    prevPortfolio,
    payments,
    prevPayments,
    history,
    comments,
    saveComment,
    removeComment,
    refreshClosings,
    isLoading:
      closingsQuery.isLoading || (Boolean(period) && dataQuery.isLoading && !dataQuery.data),
    error: (closingsQuery.error ?? dataQuery.error ?? null) as Error | null
  };
}

export type ClosingsState = ReturnType<typeof useClosings>;
