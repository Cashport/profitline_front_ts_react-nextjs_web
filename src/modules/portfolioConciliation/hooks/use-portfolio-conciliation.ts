import useSWR from "swr";

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

/** Cartera conciliada vigente del cliente: una página de la tabla más el resumen. */
export const usePortfolioConciliation = (clientUUID: string, query: IConciliationQuery) => {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(CONCILIATION_PAGE_SIZE),
    sort_by: query.sortBy,
    sort_dir: query.sortDir
  });
  if (query.status) params.set("status", query.status);
  if (query.documentType) params.set("document_type", query.documentType);
  if (query.search.trim()) params.set("search", query.search.trim());

  const key = clientUUID ? `${portfolioConciliationPath(clientUUID)}?${params}` : null;
  const { data, error, isLoading, isValidating, mutate } = useSWR<PortfolioResponse>(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false
  });

  return {
    portfolio: data?.data,
    pagination: data?.pagination,
    error: error as Error | undefined,
    isLoading,
    isValidating,
    mutate
  };
};
