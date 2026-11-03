import { create } from "zustand";

import type { SortState } from "@/modules/walletModule/types";
import { nextSort } from "@/modules/walletModule/utils/wallet-calc";
import type { IVisitFormsFilters } from "@/types/surveys/ISurveys";

import {
  DEFAULT_SURVEYS_SORT,
  EMPTY_VISIT_FORMS_FILTERS,
  SURVEYS_TEXTUAL_COLS
} from "../constants";

/* Estado del listado de Encuestas. Vive en un store para que, al volver del
   detalle o de las respuestas, la búsqueda, los filtros y el orden sigan ahí. */

interface SurveysListState {
  search: string;
  filters: IVisitFormsFilters;
  sort: SortState;
  setSearch: (search: string) => void;
  setFilters: (filters: IVisitFormsFilters) => void;
  /** Clic en un encabezado: invierte si ya ordenaba por esa columna. */
  sortByColumn: (col: string) => void;
  clearCriteria: () => void;
}

export const useSurveysListStore = create<SurveysListState>((set) => ({
  search: "",
  filters: EMPTY_VISIT_FORMS_FILTERS,
  sort: DEFAULT_SURVEYS_SORT,
  setSearch: (search) => set({ search }),
  setFilters: (filters) => set({ filters }),
  sortByColumn: (col) => set((s) => ({ sort: nextSort(s.sort, col, SURVEYS_TEXTUAL_COLS) })),
  clearCriteria: () => set({ search: "", filters: EMPTY_VISIT_FORMS_FILTERS })
}));
