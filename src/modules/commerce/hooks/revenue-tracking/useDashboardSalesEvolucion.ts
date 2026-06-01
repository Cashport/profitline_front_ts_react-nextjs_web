import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesEvolucion } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";

export const useDashboardSalesEvolucion = (filters: Record<string, FilterOption[]> = {}) => {
  const params = new URLSearchParams();

  const frequency = filters.frecuencia?.[0]?.id;
  if (frequency) params.append("frequency", frequency);

  const period = filters.fecha?.[0]?.id;
  if (period) params.append("period", period);

  const queryString = params.toString();
  const pathKey = `/dashboard/sales/evolucion${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesEvolucion>>(
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
