import { create } from "zustand";

import type { BlockingAlertStatus } from "@/types/blockingAlerts/IBlockingAlerts";

import type { AlertsSort } from "../constants";

/* Estado del listado. Vive en un store porque sobrevive al cambio de ruta: al
   volver del detalle siguen la vista, la búsqueda, la pestaña, el orden y la
   página. `scope` es el cliente cuyos puntos de venta se listan (null en el
   listado general); al cambiar de listado se limpian búsqueda, pestaña y página. */

export type AlertsView = "clients" | "points_of_sale";
export type AlertsStatusFilter = BlockingAlertStatus | "all";

interface BlockingAlertsState {
  scope: string | null;
  view: AlertsView;
  status: AlertsStatusFilter;
  search: string;
  sort: AlertsSort;
  page: number;
  setScope: (scope: string | null) => void;
  setView: (view: AlertsView) => void;
  setStatus: (status: AlertsStatusFilter) => void;
  setSearch: (search: string) => void;
  setSort: (sort: AlertsSort) => void;
  setPage: (page: number) => void;
}

export const useBlockingAlertsStore = create<BlockingAlertsState>((set) => ({
  scope: null,
  view: "clients",
  status: "all",
  search: "",
  sort: "urgency",
  page: 1,
  setScope: (scope) =>
    set((s) => (s.scope === scope ? s : { scope, status: "all", search: "", page: 1 })),
  setView: (view) => set({ view, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page })
}));
