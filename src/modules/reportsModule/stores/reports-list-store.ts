import { create } from "zustand";

import type { SortState } from "@/modules/walletModule/types";
import { nextSort } from "@/modules/walletModule/utils/wallet-calc";

import { DEFAULT_REPORTS_SORT, EMPTY_REPORTS_FILTERS, REPORTS_TEXTUAL_COLS } from "../constants";
import type { IReportsFilters } from "../types";

/* Estado del listado de Informes. Vive en un store porque sobrevive al cambio
   de ruta: el detalle (/reports/:id) navega en el mismo orden que el listado y,
   al volver, la búsqueda, los filtros y el orden siguen ahí. */

interface ReportsListState {
  search: string;
  filters: IReportsFilters;
  sort: SortState;
  /** Último publicado: se resalta como "Nuevo". */
  newReportId: number | null;
  setSearch: (search: string) => void;
  setFilters: (filters: IReportsFilters) => void;
  /** Clic en un encabezado: invierte si ya ordenaba por esa columna. */
  sortByColumn: (col: string) => void;
  clearCriteria: () => void;
  /** Deja el publicado arriba y a la vista: sin búsqueda ni filtros, más reciente primero. */
  markPublished: (reportId: number) => void;
}

export const useReportsListStore = create<ReportsListState>((set) => ({
  search: "",
  filters: EMPTY_REPORTS_FILTERS,
  sort: DEFAULT_REPORTS_SORT,
  newReportId: null,
  setSearch: (search) => set({ search }),
  setFilters: (filters) => set({ filters }),
  sortByColumn: (col) => set((s) => ({ sort: nextSort(s.sort, col, REPORTS_TEXTUAL_COLS) })),
  clearCriteria: () => set({ search: "", filters: EMPTY_REPORTS_FILTERS }),
  markPublished: (reportId) =>
    set({
      search: "",
      filters: EMPTY_REPORTS_FILTERS,
      sort: DEFAULT_REPORTS_SORT,
      newReportId: reportId
    })
}));
