import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesNegotiations } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";
import { appendSalesFilterParams } from "./salesFilterParams";

export const buildNegotiationsParams = (
  filters: Record<string, FilterOption[]>,
  includeIva: boolean,
  search: string,
  includeExpired: boolean
) => {
  const params = new URLSearchParams();
  appendSalesFilterParams(params, filters, includeIva);
  if (search) params.append("search", search);
  if (includeExpired) params.append("include_expired", "true");
  return params;
};

/**
 * Negociaciones: clientes con descuento Plan Anual asignado por ID cliente.
 * El promedio y el último mes son siempre sobre meses cerrados, así que el filtro de
 * fechas del dashboard no los mueve; sí aplican el cliente y el toggle de IVA.
 */
export const useDashboardSalesNegotiations = (
  filters: Record<string, FilterOption[]> = {},
  search = "",
  includeIva = false,
  includeExpired = false,
  page = 1,
  limit = 25
) => {
  const params = buildNegotiationsParams(filters, includeIva, search, includeExpired);
  params.append("page", String(page));
  params.append("limit", String(limit));

  const pathKey = `/dashboard/sales/negociaciones?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesNegotiations>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
