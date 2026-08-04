import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesClientDetail } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "./salesFilterParams";

export const useDashboardSalesClientDetail = (
  filters: Record<string, FilterOption[]> = {},
  page = 1,
  pageSize = 25,
  search = ""
) => {
  const params = new URLSearchParams();

  appendSalesFilterParams(params, filters);
  params.append("limit", String(pageSize));
  params.append("offset", String((page - 1) * pageSize));
  if (search) params.append("search", search);

  const pathKey = `/dashboard/sales/detalle-cliente?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesClientDetail>>(
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
