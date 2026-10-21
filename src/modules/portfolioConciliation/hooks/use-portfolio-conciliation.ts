import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";

import { fetcher } from "@/utils/api/api";
import { portfolioConciliationPath } from "@/services/portfolioConciliation/portfolioConciliation";
import {
  IConciliationPagination,
  IConciliationPortfolio,
  IConciliationQuery
} from "@/types/portfolioConciliation/IPortfolioConciliation";
import { CONCILIATION_PAGE_SIZE } from "../constants";

interface PortfolioResponse {
  data: IConciliationPortfolio;
  pagination: IConciliationPagination;
}

/** Llave SWR (y URL) de una página de la cartera conciliada con sus filtros. */
export const portfolioConciliationKey = (clientUUID: string, query: IConciliationQuery) => {
  if (!clientUUID) return null;
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(CONCILIATION_PAGE_SIZE),
    sort_by: query.sortBy,
    sort_dir: query.sortDir
  });
  if (query.status) params.set("status", query.status);
  if (query.documentType) params.set("document_type", query.documentType);
  if (query.search.trim()) params.set("search", query.search.trim());
  return `${portfolioConciliationPath(clientUUID)}?${params}`;
};

/** Cartera conciliada vigente del cliente: una página de la tabla más el resumen. */
export const usePortfolioConciliation = (clientUUID: string, query: IConciliationQuery) => {
  const key = portfolioConciliationKey(clientUUID, query);
  const { cache, mutate: mutateGlobal } = useSWRConfig();
  const { data, error, isLoading, isValidating } = useSWR<PortfolioResponse>(key, fetcher, {
    // Mientras llega la consulta nueva se sigue viendo la anterior (sin bloquear la tabla)
    keepPreviousData: true,
    revalidateOnFocus: false,
    // La cartera solo cambia con una carga nueva (y entonces `refreshAll` limpia
    // todo): ir y volver entre filtros no necesita repetir la consulta.
    dedupingInterval: 30000
  });

  /**
   * Trae otra consulta a la caché sin mostrarla, para que el siguiente clic
   * (otra tarjeta, la página siguiente) se vea al instante.
   */
  const prefetch = useCallback(
    (next: IConciliationQuery) => {
      const nextKey = portfolioConciliationKey(clientUUID, next);
      if (!nextKey || nextKey === key || cache.get(nextKey)?.data) return;
      mutateGlobal(nextKey, fetcher(nextKey), { revalidate: false }).catch(() => undefined);
    },
    [clientUUID, key, cache, mutateGlobal]
  );

  /** Tras una carga nueva: descarta todas las páginas y filtros guardados del cliente. */
  const refreshAll = useCallback(() => {
    if (!clientUUID) return Promise.resolve();
    const prefix = `${portfolioConciliationPath(clientUUID)}?`;
    return mutateGlobal(
      (cachedKey) => typeof cachedKey === "string" && cachedKey.startsWith(prefix),
      undefined,
      { revalidate: true }
    );
  }, [clientUUID, mutateGlobal]);

  return {
    portfolio: data?.data,
    pagination: data?.pagination,
    error: error as Error | undefined,
    /** Lo que se ve es de la consulta anterior: la nueva todavía no llega. */
    isStale: isLoading && Boolean(data),
    /** Primera carga, sin nada que mostrar todavía. */
    isFirstLoad: isLoading && !data,
    isValidating,
    prefetch,
    refreshAll
  };
};
