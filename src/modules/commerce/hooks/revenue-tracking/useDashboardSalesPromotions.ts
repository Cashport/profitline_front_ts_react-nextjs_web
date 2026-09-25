import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesPromotions } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "./salesFilterParams";

/**
 * Informe de promociones: una fila por promoción + vendedor, con el detalle por cliente
 * adentro de cada fila. El back devuelve todo junto porque el volumen es chico, así que
 * acá no hay paginación ni una segunda llamada al desplegar.
 */
export const useDashboardSalesPromotions = (
  filters: Record<string, FilterOption[]> = {},
  search = "",
  includeIva = false
) => {
  const params = new URLSearchParams();

  appendSalesFilterParams(params, filters, includeIva);
  if (search) params.append("search", search);

  const queryString = params.toString();
  const pathKey = `/dashboard/sales/promociones${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesPromotions>>(
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
