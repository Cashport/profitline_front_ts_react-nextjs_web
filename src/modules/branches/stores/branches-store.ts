import { create } from "zustand";

import type { FilterSelection } from "@/components/ui/filter-modal";

import { DEFAULT_SORT, type BranchesSortKey, type SortDir } from "../constants";

/* Estado del listado. Vive en un store porque lo comparten el header (buscador,
   Filtrar y chips) y la tabla, y porque sobrevive al ir al detalle y volver.
   Al salir del módulo se reinicia (ver BranchesLayout): se vuelve a la página 1.
   Buscar, filtrar u ordenar vuelve a la página 1: los resultados cambiaron. */

interface BranchesState {
  search: string;
  filters: FilterSelection;
  sort: { key: BranchesSortKey; dir: SortDir };
  page: number;
  setSearch: (search: string) => void;
  setFilters: (filters: FilterSelection) => void;
  /** Misma columna: invierte el sentido; otra columna: empieza A–Z / menor a mayor. */
  toggleSort: (key: BranchesSortKey) => void;
  setPage: (page: number) => void;
  clearAll: () => void;
  /** Todo como al entrar por primera vez: sin búsqueda ni filtros, orden por defecto y página 1. */
  reset: () => void;
}

const INITIAL = {
  search: "",
  filters: {} as FilterSelection,
  sort: DEFAULT_SORT,
  page: 1
};

export const useBranchesStore = create<BranchesState>((set) => ({
  ...INITIAL,
  setSearch: (search) => set({ search, page: 1 }),
  setFilters: (filters) => set({ filters, page: 1 }),
  toggleSort: (key) =>
    set((s) => ({
      sort: s.sort.key === key ? { key, dir: (s.sort.dir * -1) as SortDir } : { key, dir: 1 },
      page: 1
    })),
  setPage: (page) => set({ page }),
  clearAll: () => set({ search: "", filters: {}, page: 1 }),
  reset: () => set(INITIAL)
}));
