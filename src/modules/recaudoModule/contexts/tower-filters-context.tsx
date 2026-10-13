"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

import { DEFAULT_BOARD } from "../constants";
import type { TowerFilters } from "../types";

/* Filtros de la página (port de estado.jsx del prototipo). Todos cruzan todo
   el tablero. Viven en la página y no en un store: al salir de /dashboard, o
   al cambiar de proyecto (la vista remonta el provider), arrancan de cero. Lo
   que es de una sola tarjeta (orden, agrupación, vista) se queda en ella. */

const INITIAL: TowerFilters = {
  board: DEFAULT_BOARD,
  period: null,
  management: null,
  coordinator: null,
  executive: null,
  channel: null,
  client: null,
  search: "",
  aging: null,
  segments: []
};

type Patch = Partial<TowerFilters> | ((f: TowerFilters) => Partial<TowerFilters>);

interface TowerFiltersContextValue {
  filters: TowerFilters;
  patch: (patch: Patch) => void;
  /** "Limpiar filtros": quita todo menos el tablero y el periodo. */
  clear: () => void;
  /** Clic en un cliente (por id): filtra por él o, si ya estaba, quita el filtro. */
  toggleClient: (clientId: string) => void;
  /** Clic en un tramo de "Recaudo por tramo". */
  toggleAging: (key: string) => void;
}

const TowerFiltersContext = createContext<TowerFiltersContextValue | null>(null);

export function TowerFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<TowerFilters>(INITIAL);

  const actions = useMemo(() => {
    const patch = (p: Patch) =>
      setFilters((f) => ({ ...f, ...(typeof p === "function" ? p(f) : p) }));
    return {
      patch,
      clear: () =>
        patch({
          management: null,
          coordinator: null,
          executive: null,
          channel: null,
          client: null,
          search: "",
          aging: null,
          segments: []
        }),
      toggleClient: (clientId: string) =>
        patch((f) => (f.client === clientId ? { client: null } : { client: clientId, search: "" })),
      toggleAging: (key: string) => patch((f) => ({ aging: f.aging === key ? null : key }))
    };
  }, []);

  const value = useMemo(() => ({ filters, ...actions }), [filters, actions]);

  return <TowerFiltersContext.Provider value={value}>{children}</TowerFiltersContext.Provider>;
}

export function useTowerFilters() {
  const ctx = useContext(TowerFiltersContext);
  if (!ctx) {
    throw new Error("useTowerFilters must be used inside <TowerFiltersProvider>");
  }
  return ctx;
}
