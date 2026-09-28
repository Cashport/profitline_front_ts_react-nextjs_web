import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesBackorder } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "./salesFilterParams";

/**
 * Informe de backorder: una fila por producto con el detalle por cliente adentro.
 * Solo trae pedidos en estado backorder y, a diferencia de los otros widgets, el filtro
 * de fechas se aplica sobre la fecha de creación del pedido (esos pedidos no tienen
 * fecha de orden).
 */
export const useDashboardSalesBackorder = (
  filters: Record<string, FilterOption[]> = {},
  search = "",
  includeIva = false
) => {
  const params = new URLSearchParams();

  appendSalesFilterParams(params, filters, includeIva);
  if (search) params.append("search", search);

  const queryString = params.toString();
  const pathKey = `/dashboard/sales/backorder${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesBackorder>>(
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
