"use client";

import { useInfiniteQuery, useQuery } from "react-query";
import { useShallow } from "zustand/react/shallow";

import { useAppStore } from "@/lib/store/store";
import { useDebounce } from "@/hooks/useDeabouce";
import {
  getClientAgreements,
  getClientsHomeClients,
  getClientsHomeSummary,
  isClientsHomePending
} from "@/services/clientsHome/clientsHome";
import type { IClientsHomeClients, IClientsHomeSummary } from "@/types/clients/IClientsHome";
import { CLIENTS_HOME_PAGE_SIZE, CLIENTS_HOME_QUERY_KEY } from "../../constants/clients-home";
import { selectClientsHomeQuery, useClientsHomeFilters } from "../../stores/clients-home-filters";

/** Mientras el backend genera la foto (202) se reintenta cada pocos segundos. */
const PENDING_POLL_MS = 5000;

const QUERY_OPTIONS = {
  refetchOnWindowFocus: false,
  keepPreviousData: true,
  retry: 1
};

/** KPIs, leyenda de mercados y catálogo de ejecutivos. */
export const useClientsHomeSummary = () => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const query = useClientsHomeFilters(useShallow(selectClientsHomeQuery));

  const result = useQuery(
    [CLIENTS_HOME_QUERY_KEY, "summary", projectId, query],
    () => getClientsHomeSummary(projectId, query),
    {
      ...QUERY_OPTIONS,
      enabled: Boolean(projectId),
      refetchInterval: (res) => (isClientsHomePending(res?.data) ? PENDING_POLL_MS : false)
    }
  );

  const data = result.data?.data;
  const pending = isClientsHomePending(data);
  return {
    summary: pending ? null : (data as IClientsHomeSummary | undefined) ?? null,
    pending,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: result.error as Error | null,
    refetch: result.refetch
  };
};

/** Tabla por cliente con scroll infinito; búsqueda, orden y filtros en el servidor. */
export const useClientsHomeClients = () => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const filters = useClientsHomeFilters(
    useShallow((s) => ({
      ...selectClientsHomeQuery(s),
      search: s.search,
      aging: s.aging,
      forecastStatuses: s.forecastStatuses,
      sortBy: s.sortBy,
      sortDir: s.sortDir
    }))
  );
  const search = useDebounce(filters.search, 300);
  const listQuery = { ...filters, search, limit: CLIENTS_HOME_PAGE_SIZE };

  const result = useInfiniteQuery(
    [CLIENTS_HOME_QUERY_KEY, "clients", projectId, listQuery],
    ({ pageParam = 1 }) => getClientsHomeClients(projectId, { ...listQuery, page: pageParam }),
    {
      ...QUERY_OPTIONS,
      enabled: Boolean(projectId),
      getNextPageParam: (last) => {
        if (isClientsHomePending(last.data)) return undefined;
        const { page, limit, total } = last.data.pagination;
        return page * limit < total ? page + 1 : undefined;
      },
      refetchInterval: (res) =>
        isClientsHomePending(res?.pages?.[0]?.data) ? PENDING_POLL_MS : false
    }
  );

  const pages = (result.data?.pages ?? [])
    .map((p) => p.data)
    .filter((d): d is IClientsHomeClients => Boolean(d) && !isClientsHomePending(d));
  const pending = isClientsHomePending(result.data?.pages?.[0]?.data);

  return {
    rows: pages.flatMap((p) => p.rows),
    /** Totales, paginación y tramo enfocado: iguales en todas las páginas. */
    meta: pages[0] ?? null,
    pending,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isFetchingNextPage: result.isFetchingNextPage,
    hasNextPage: Boolean(result.hasNextPage),
    fetchNextPage: result.fetchNextPage,
    error: result.error as Error | null
  };
};

/** Acuerdos de pago de un cliente: solo se piden al abrir el tooltip de recaudo. */
export const useClientAgreements = (clientUuid: string | null, enabled: boolean) => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const result = useQuery(
    [CLIENTS_HOME_QUERY_KEY, "agreements", projectId, clientUuid],
    () => getClientAgreements(projectId, clientUuid as string),
    {
      enabled: enabled && Boolean(projectId && clientUuid),
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      retry: 1
    }
  );
  return {
    agreements: result.data?.data ?? null,
    isLoading: result.isLoading,
    error: result.error as Error | null
  };
};
