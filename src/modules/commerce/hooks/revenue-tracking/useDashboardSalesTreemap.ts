import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesTreemap } from "@/types/dashboardSales/IDashboardSales";

export const useDashboardSalesTreemap = (dim1: string, dim2: string) => {
  const params = new URLSearchParams();
  if (dim1) params.append("dim1", dim1);
  if (dim2) params.append("dim2", dim2);

  const queryString = params.toString();
  const pathKey = `/dashboard/sales/treemap${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesTreemap>>(
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
