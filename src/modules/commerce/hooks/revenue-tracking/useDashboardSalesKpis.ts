import useSWR from "swr";
import dayjs from "dayjs";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesKpis } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";

const fmt = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");

const dateRangeFromPreset = (preset: string): { start_date: string; end_date: string } | null => {
  const today = dayjs();

  switch (preset) {
    case "mes_actual":
      return { start_date: fmt(today.startOf("month")), end_date: fmt(today) };
    case "ultimo_mes": {
      const lastMonth = today.subtract(1, "month");
      return {
        start_date: fmt(lastMonth.startOf("month")),
        end_date: fmt(lastMonth.endOf("month"))
      };
    }
    case "ultimo_trimestre":
      return { start_date: fmt(today.subtract(3, "month")), end_date: fmt(today) };
    case "ytd":
      return { start_date: fmt(today.startOf("year")), end_date: fmt(today) };
    case "ultimos_12_meses":
      return { start_date: fmt(today.subtract(12, "month")), end_date: fmt(today) };
    default:
      return null;
  }
};

export const useDashboardSalesKpis = (filters: Record<string, FilterOption[]> = {}) => {
  const ids = (key: string) => (filters[key] ?? []).map((o) => o.id);

  const params = new URLSearchParams();

  const idParamByKey: Record<string, string> = {
    clientIds: "client_ids",
    sellerIds: "seller_ids",
    productIds: "product_ids",
    cityIds: "city_ids",
    lineIds: "line_ids",
    channelIds: "channel_ids"
  };

  Object.entries(idParamByKey).forEach(([filterKey, param]) => {
    const selected = ids(filterKey);
    if (selected.length > 0) params.append(param, selected.join(","));
  });

  const fechaPreset = filters.fecha?.[0]?.id;
  if (fechaPreset) {
    const range = dateRangeFromPreset(fechaPreset);
    if (range) {
      params.append("start_date", range.start_date);
      params.append("end_date", range.end_date);
    }
  }

  const queryString = params.toString();
  const pathKey = `/dashboard/sales/kpis${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSalesKpis>>(
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
