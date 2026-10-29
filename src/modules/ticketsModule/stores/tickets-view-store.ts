import { create } from "zustand";

import type { TaskFieldKey } from "@/types/tickets/ITickets";
import type { TaskCreateDraft, TaskViewState } from "../types";

/* Vista del gestor de tareas. Vive en un store porque la usan piezas que no
   comparten árbol: las etiquetas, "Filtrar" y el buscador van en el
   encabezado (layout) y la barra de procesos, la lista y el tablero en la
   página. */

export const EMPTY_TASK_VIEW: TaskViewState = {
  filters: {},
  created: { from: null, to: null },
  groupBy: "status",
  sortBy: "priority",
  sortDir: "desc",
  layout: "list",
  showClosed: false,
  collapsed: {}
};

interface TicketsViewStore {
  /** `${userId}:${projectId}` de la vista cargada; null hasta hidratar. */
  viewKey: string | null;
  view: TaskViewState;
  search: string;
  /** Sube tras crear/editar: va en las llaves SWR y fuerza a recargar todo. */
  refreshToken: number;
  /** "Nueva tarea" abierta con estos valores; null = cerrada. */
  createDraft: TaskCreateDraft | null;
  /** Tarea abierta en el detalle. */
  detailId: number | null;
  hydrate: (viewKey: string, view: TaskViewState) => void;
  patchView: (patch: Partial<TaskViewState>) => void;
  setFilter: (key: TaskFieldKey, values: string[]) => void;
  setFilters: (filters: TaskViewState["filters"], created: TaskViewState["created"]) => void;
  clearFilters: () => void;
  toggleCollapsed: (groupBy: TaskFieldKey, value: string) => void;
  setSearch: (search: string) => void;
  refresh: () => void;
  openCreate: (draft?: TaskCreateDraft) => void;
  closeCreate: () => void;
  openDetail: (id: number) => void;
  closeDetail: () => void;
}

export const useTicketsView = create<TicketsViewStore>((set) => ({
  viewKey: null,
  view: EMPTY_TASK_VIEW,
  search: "",
  refreshToken: 0,
  createDraft: null,
  detailId: null,
  hydrate: (viewKey, view) => set({ viewKey, view, search: "", createDraft: null, detailId: null }),
  patchView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
  setFilter: (key, values) =>
    set((s) => {
      const filters = { ...s.view.filters };
      if (values.length) filters[key] = values;
      else delete filters[key];
      return { view: { ...s.view, filters } };
    }),
  setFilters: (filters, created) => set((s) => ({ view: { ...s.view, filters, created } })),
  clearFilters: () =>
    set((s) => ({ view: { ...s.view, filters: {}, created: { from: null, to: null } } })),
  toggleCollapsed: (groupBy, value) =>
    set((s) => {
      const current = s.view.collapsed[groupBy] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { view: { ...s.view, collapsed: { ...s.view.collapsed, [groupBy]: next } } };
    }),
  setSearch: (search) => set({ search }),
  refresh: () => set((s) => ({ refreshToken: s.refreshToken + 1 })),
  openCreate: (draft = {}) => set({ createDraft: draft }),
  closeCreate: () => set({ createDraft: null }),
  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null })
}));
