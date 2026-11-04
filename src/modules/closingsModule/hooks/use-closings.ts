import { useCallback, useMemo, useState } from "react";

import type {
  FilterCategoryConfig,
  FilterSelection
} from "@/components/ui/filter-modal/FilterModal.types";
import type {
  IClosingComment,
  IClosingPaymentRow,
  IClosingPortfolioRow
} from "@/types/closings/IClosings";

import { CLOSINGS_MOCK } from "../mock/closings-mock";

/* Estado del tablero de cierres: cierre elegido, filtros, búsqueda y comentarios.
   Hoy lee el mock; cuando exista la carga, solo cambia de dónde sale CLOSINGS_MOCK. */

const FILTER_FIELDS: { key: keyof IClosingPortfolioRow; label: string }[] = [
  { key: "channel", label: "Canal" },
  { key: "manager", label: "Gerente comercial" },
  { key: "salesExecutive", label: "Ejecutivo comercial" },
  { key: "collectionExecutive", label: "Ejecutivo de cartera" },
  { key: "coordinator", label: "Coordinador" },
  { key: "holding", label: "Holding" },
  { key: "city", label: "Ciudad" },
  { key: "segment", label: "Tipo de cartera" }
];

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function useClosings() {
  const data = CLOSINGS_MOCK;
  const [period, setPeriod] = useState(data.closings[0].period);
  const [filters, setFilters] = useState<FilterSelection>({});
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<IClosingComment[]>(data.comments);

  const periods = useMemo(() => data.closings.map((c) => c.period), [data]);
  const closing = data.closings.find((c) => c.period === period) ?? data.closings[0];
  const prevPeriod = periods[periods.indexOf(period) + 1] ?? null;

  const filterCategories = useMemo<FilterCategoryConfig[]>(
    () =>
      FILTER_FIELDS.map(({ key, label }) => {
        const counts = new Map<string, Set<string>>();
        data.portfolio.forEach((r) => {
          if (r.period !== period) return;
          const value = String(r[key] || "Sin asignar");
          counts.set(value, (counts.get(value) ?? new Set()).add(r.nit));
        });
        return {
          key,
          label,
          options: Array.from(counts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, nits]) => ({ id: name, name, count: nits.size }))
        };
      }),
    [data, period]
  );

  // Los filtros se aplican por cliente: un NIT pasa si cumple todas las categorías activas.
  const allowedNits = useMemo(() => {
    const active = Object.entries(filters).filter(([, items]) => items?.length);
    const term = normalize(search.trim());
    if (!active.length && !term) return null;
    const nits = new Set<string>();
    data.portfolio.forEach((r) => {
      const matchesFilters = active.every(([key, items]) =>
        items.some((i) => i.id === String(r[key as keyof IClosingPortfolioRow] || "Sin asignar"))
      );
      const matchesSearch = !term || normalize(r.client).includes(term) || r.nit.includes(term);
      if (matchesFilters && matchesSearch) nits.add(r.nit);
    });
    return nits;
  }, [data, filters, search]);

  const byPeriod = useCallback(
    <T extends { period: string; nit: string }>(rows: T[], p: string | null) =>
      p ? rows.filter((r) => r.period === p && (!allowedNits || allowedNits.has(r.nit))) : [],
    [allowedNits]
  );

  const portfolio = useMemo(() => byPeriod(data.portfolio, period), [byPeriod, data, period]);
  const prevPortfolio = useMemo(
    () => byPeriod(data.portfolio, prevPeriod),
    [byPeriod, data, prevPeriod]
  );
  const payments = useMemo<IClosingPaymentRow[]>(
    () => byPeriod(data.payments, period),
    [byPeriod, data, period]
  );
  const prevPayments = useMemo<IClosingPaymentRow[]>(
    () => byPeriod(data.payments, prevPeriod),
    [byPeriod, data, prevPeriod]
  );

  /** Todos los cierres con los filtros aplicados, para las gráficas de evolución. */
  const history = useMemo(
    () =>
      [...periods].reverse().map((p) => ({
        period: p,
        portfolio: byPeriod(data.portfolio, p),
        payments: byPeriod(data.payments, p)
      })),
    [byPeriod, data, periods]
  );

  const visibleComments = useMemo(
    () => comments.filter((c) => !allowedNits || allowedNits.has(c.nit)),
    [comments, allowedNits]
  );

  const saveComment = useCallback(
    (nit: string, client: string, text: string) => {
      setComments((prev) => {
        const id = `${period}-${nit}`;
        const next: IClosingComment = {
          id,
          period,
          nit,
          client,
          text,
          author: "Miguel Martínez",
          createdAt: new Date().toISOString()
        };
        const exists = prev.some((c) => c.id === id);
        return exists ? prev.map((c) => (c.id === id ? next : c)) : [next, ...prev];
      });
    },
    [period]
  );

  return {
    closings: data.closings,
    closing,
    period,
    setPeriod,
    prevPeriod,
    filters,
    setFilters,
    filterCategories,
    search,
    setSearch,
    portfolio,
    prevPortfolio,
    payments,
    prevPayments,
    history,
    comments: visibleComments,
    saveComment
  };
}

export type ClosingsState = ReturnType<typeof useClosings>;
