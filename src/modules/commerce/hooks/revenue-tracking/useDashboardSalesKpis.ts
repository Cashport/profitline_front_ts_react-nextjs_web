import useSWR from "swr";
import dayjs from "dayjs";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSalesKpis } from "@/types/dashboardSales/IDashboardSales";
import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";

const fmt = (date: dayjs.Dayjs) => date.format("YYYY-MM-DD");

const dateRangeFromPreset = (preset: string): { start_date: string; end_date: string } | null => {
  const today = dayjs();
  const year = today.year();

  switch (preset) {
    case "Hoy":
      return { start_date: fmt(today), end_date: fmt(today) };
    case "Ayer": {
      const yesterday = today.subtract(1, "day");
      return { start_date: fmt(yesterday), end_date: fmt(yesterday) };
    }
    case "Últimos 7 días":
      return { start_date: fmt(today.subtract(6, "day")), end_date: fmt(today) };
    case "Mes actual":
      return { start_date: fmt(today.startOf("month")), end_date: fmt(today.endOf("month")) };
    case "Mes anterior": {
      const lastMonth = today.subtract(1, "month");
      return {
        start_date: fmt(lastMonth.startOf("month")),
        end_date: fmt(lastMonth.endOf("month"))
      };
    }
    case "YTD":
      return { start_date: fmt(today.startOf("year")), end_date: fmt(today) };
    case "Q1":
      return { start_date: `${year}-01-01`, end_date: `${year}-03-31` };
    case "Q2":
      return { start_date: `${year}-04-01`, end_date: `${year}-06-30` };
    case "Q3":
      return { start_date: `${year}-07-01`, end_date: `${year}-09-30` };
    case "Q4":
      return { start_date: `${year}-10-01`, end_date: `${year}-12-31` };
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
