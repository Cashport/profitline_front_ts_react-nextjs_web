import { create } from "zustand";

import type {
  ClientsHomeAgingBucket,
  ClientsHomeForecastStatus,
  ClientsHomeSortColumn,
  IClientsHomeQuery
} from "@/types/clients/IClientsHome";
import type { DuePeriod } from "../constants/clients-home";

/* Filtros del Home de Clientes. Viven en un store porque los usan piezas
   que no comparten árbol: el encabezado de la vista (corte, proyección,
   "Filtrar") va en el layout y los KPIs y la tabla en la página. */

interface ClientsHomeFiltersState extends IClientsHomeQuery {
  /** Proyecto al que pertenecen los filtros (mercados y ejecutivos son por proyecto). */
  projectId: number | null;
  /** Periodo predefinido elegido en "Fecha" (para el chip); null = rango personalizado. */
  duePeriod: DuePeriod | null;
  /** Clic en un tramo del KPI de cartera: la tabla muestra solo ese tramo. */
  aging: ClientsHomeAgingBucket | null;
  /** Filtro rápido de la columna Forecast. */
  forecastStatuses: ClientsHomeForecastStatus[];
  search: string;
  sortBy: ClientsHomeSortColumn;
  sortDir: "asc" | "desc";
  setProjectToMonthEnd: (value: boolean) => void;
  setMarkets: (markets: string[]) => void;
  toggleMarket: (market: string) => void;
  setExecutives: (executives: string[]) => void;
  toggleExecutive: (executive: string) => void;
  setDue: (from: string | null, to: string | null, period: DuePeriod | null) => void;
  setAging: (aging: ClientsHomeAgingBucket | null) => void;
  setForecastStatuses: (statuses: ClientsHomeForecastStatus[]) => void;
  toggleForecastStatus: (status: ClientsHomeForecastStatus) => void;
  setSearch: (search: string) => void;
  /** Clic en un encabezado: si ya ordenaba por esa columna invierte, si no desc. */
  sortByColumn: (column: ClientsHomeSortColumn) => void;
  /** Reinicia los filtros si cambió el proyecto seleccionado. */
  syncProject: (projectId: number | null) => void;
}

const initialState = {
  projectToMonthEnd: false,
  markets: [] as string[],
  executives: [] as string[],
  dueFrom: null as string | null,
  dueTo: null as string | null,
  duePeriod: null as DuePeriod | null,
  aging: null as ClientsHomeAgingBucket | null,
  forecastStatuses: [] as ClientsHomeForecastStatus[],
  search: "",
  sortBy: "portfolio" as ClientsHomeSortColumn,
  sortDir: "desc" as "asc" | "desc"
};

const toggle = <T>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

export const useClientsHomeFilters = create<ClientsHomeFiltersState>((set) => ({
  projectId: null,
  ...initialState,
  setProjectToMonthEnd: (projectToMonthEnd) => set({ projectToMonthEnd }),
  setMarkets: (markets) => set({ markets }),
  toggleMarket: (market) => set((s) => ({ markets: toggle(s.markets, market) })),
  setExecutives: (executives) => set({ executives }),
  toggleExecutive: (executive) => set((s) => ({ executives: toggle(s.executives, executive) })),
  setDue: (dueFrom, dueTo, duePeriod) => set({ dueFrom, dueTo, duePeriod }),
  // Al filtrar por edad la tabla se ordena por ese tramo, como en el diseño.
  setAging: (aging) => set(aging ? { aging, sortBy: "portfolio", sortDir: "desc" } : { aging }),
  setForecastStatuses: (forecastStatuses) => set({ forecastStatuses }),
  toggleForecastStatus: (status) =>
    set((s) => ({ forecastStatuses: toggle(s.forecastStatuses, status) })),
  setSearch: (search) => set({ search }),
  sortByColumn: (column) =>
    set((s) => ({
      sortBy: column,
      sortDir: s.sortBy === column ? (s.sortDir === "desc" ? "asc" : "desc") : "desc"
    })),
  syncProject: (projectId) =>
    set((s) => (s.projectId === projectId ? {} : { ...initialState, projectId }))
}));

/** Lo que viaja al backend en el resumen (KPIs). */
export const selectClientsHomeQuery = (s: ClientsHomeFiltersState): IClientsHomeQuery => ({
  projectToMonthEnd: s.projectToMonthEnd,
  markets: s.markets,
  executives: s.executives,
  dueFrom: s.dueFrom,
  dueTo: s.dueTo
});
