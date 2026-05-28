import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesRanking } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "./salesFilterParams";

export const useDashboardSalesRanking = (
  dimension: string,
  filters: Record<string, FilterOption[]> = {},
  limit = 10
) => {
  const params = new URLSearchParams();

  if (dimension) params.append("dimension", dimension);
  appendSalesFilterParams(params, filters);
  params.append("limit", String(limit));

  const pathKey = `/dashboard/sales/ranking?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesRanking>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
