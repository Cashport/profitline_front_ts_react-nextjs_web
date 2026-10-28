import { useState } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { useShallow } from "zustand/react/shallow";

import type { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import type {
  ITaskConfig,
  ITaskFacets,
  ITaskFieldConfig,
  ITaskGroups,
  ITicket
} from "@/types/tickets/ITickets";
import { TASKS_MAX_ITEM_GROUPS, TASKS_PAGE_SIZE, TASKS_PER_GROUP } from "../constants";
import { useTicketsView } from "../stores/tickets-view-store";
import type { TaskViewState } from "../types";
import { buildTaskParams } from "../utils/tasks-params";
import { taskFetcher, useTaskKey, type TaskKey } from "./useTaskKey";

/** Filtros, orden y búsqueda vigentes de la vista, como query string base. */
function useViewParams(config: ITaskConfig | undefined) {
  const { view, search } = useTicketsView(useShallow((s) => ({ view: s.view, search: s.search })));
  if (!config) return null;
  return buildTaskParams({
    config,
    filters: view.filters,
    created: view.created,
    showClosed: view.showClosed,
    search,
    sortBy: view.sortBy,
    sortDir: view.sortDir
  });
}

/**
 * GET /tickets/groups: lista agrupada (y tablero con `groupBy = status`).
 * Las filas de "Ver más" las trae `useMoreTasks` con el mismo orden.
 */
export const useTaskGroups = (config: ITaskConfig | undefined, groupBy: string | null) => {
  const key = useTaskKey();
  const params = useViewParams(config);
  if (params && groupBy) {
    params.set("group_by", groupBy);
    params.set("per_group", String(TASKS_PER_GROUP));
    params.set("max_item_groups", String(TASKS_MAX_ITEM_GROUPS));
  }
  const { data, error, isLoading } = useSWR<GenericResponse<ITaskGroups>>(
    key(params && groupBy ? `/tickets/groups?${params.toString()}` : null),
    taskFetcher,
    { keepPreviousData: true }
  );
  return { groups: data?.data, error, isLoading };
};

/** GET /tickets paginado ("Sin agrupar"), con "Cargar más". */
export const useTaskList = (config: ITaskConfig | undefined, enabled: boolean) => {
  const key = useTaskKey();
  const params = useViewParams(config);
  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<
    GenericResponsePage<ITicket[]>
  >(
    (index, previous: GenericResponsePage<ITicket[]> | null) => {
      if (!enabled || !params) return null;
      if (previous && previous.data.length < TASKS_PAGE_SIZE) return null;
      const page = new URLSearchParams(params);
      page.set("page", String(index + 1));
      page.set("limit", String(TASKS_PAGE_SIZE));
      return key(`/tickets?${page.toString()}`);
    },
    (k: TaskKey) => taskFetcher(k),
    { keepPreviousData: true, revalidateFirstPage: false }
  );
  const items = (data ?? []).flatMap((p) => p.data);
  const total = data?.[0]?.pagination?.totalRows ?? 0;
  return {
    items,
    total,
    error,
    isLoading,
    isLoadingMore: isValidating && size > (data?.length ?? 0),
    hasMore: items.length < total,
    loadMore: () => setSize(size + 1)
  };
};

/**
 * "Ver más" dentro de un grupo o carril: GET /tickets filtrando por el valor
 * del grupo, con el mismo orden que /groups. `startPage` = 2 cuando el grupo
 * ya trae su primera página; 1 cuando llegó sin filas.
 */
export const useMoreTasks = (
  config: ITaskConfig | undefined,
  field: ITaskFieldConfig | undefined,
  value: string | null,
  startPage: number
) => {
  const key = useTaskKey();
  const params = useViewParams(config);
  const [enabled, setEnabled] = useState(false);
  const { data, isValidating, size, setSize } = useSWRInfinite<GenericResponsePage<ITicket[]>>(
    (index) => {
      if (!enabled || !params || !field?.filter_param) return null;
      const page = new URLSearchParams(params);
      page.set(field.filter_param, value ?? "none");
      page.set("page", String(startPage + index));
      page.set("limit", String(TASKS_PER_GROUP));
      return key(`/tickets?${page.toString()}`);
    },
    (k: TaskKey) => taskFetcher(k),
    { revalidateFirstPage: false }
  );
  return {
    items: (data ?? []).flatMap((p) => p.data),
    isLoading: enabled && isValidating,
    loadMore: () => (enabled ? setSize(size + 1) : setEnabled(true))
  };
};

interface FacetsInput {
  config: ITaskConfig | undefined;
  filters: TaskViewState["filters"];
  created: TaskViewState["created"];
  showClosed: boolean;
  search?: string;
  /** Llaves de campo; vacío = todas las filtrables del proyecto. */
  facets?: string[];
  enabled?: boolean;
}

/**
 * GET /tickets/facets: conteos por valor. Cada faceta ignora su propio
 * filtro, así con "País: Colombia" cambian los conteos de proceso pero se
 * siguen viendo todos los países.
 */
export const useTaskFacets = ({
  config,
  filters,
  created,
  showClosed,
  search,
  facets = [],
  enabled = true
}: FacetsInput) => {
  const key = useTaskKey();
  let path: string | null = null;
  if (config && enabled) {
    const params = buildTaskParams({ config, filters, created, showClosed, search });
    if (facets.length) params.set("facets", facets.join(","));
    path = `/tickets/facets?${params.toString()}`;
  }
  const { data, error, isLoading } = useSWR<GenericResponse<ITaskFacets>>(key(path), taskFetcher, {
    keepPreviousData: true
  });
  return { facets: data?.data, error, isLoading };
};
