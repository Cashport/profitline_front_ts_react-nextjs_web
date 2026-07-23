import dayjs from "dayjs";

import { type FilterOption } from "@/modules/commerce/contexts/revenue-tracking-context";

const fmt = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");

export const dateRangeFromPreset = (
  preset: string
): { start_date: string; end_date: string } | null => {
  const today = dayjs();

  if (preset.startsWith("custom:")) {
    const [, start_date, end_date] = preset.split(":");
    return start_date && end_date ? { start_date, end_date } : null;
  }

  switch (preset) {
    case "hoy":
      return { start_date: fmt(today), end_date: fmt(today) };
    case "esta_semana":
      // .day() is 0=Sun..6=Sat regardless of locale, so this always lands on Monday —
      // unlike startOf("week"), which follows whatever locale dayjs was last set to.
      return {
        start_date: fmt(today.subtract((today.day() + 6) % 7, "day")),
        end_date: fmt(today)
      };
    case "mes_actual":
      return { start_date: fmt(today.startOf("month")), end_date: fmt(today) };
    case "ultimo_mes": {
      const prev = today.subtract(1, "month");
      return { start_date: fmt(prev.startOf("month")), end_date: fmt(prev.endOf("month")) };
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

const ID_PARAM_BY_KEY: Record<string, string> = {
  clientIds: "client_ids",
  sellerIds: "seller_ids",
  productIds: "product_ids",
  cityIds: "city_ids",
  lineIds: "line_ids",
  channelIds: "channel_ids"
};

export const appendSalesFilterParams = (
  params: URLSearchParams,
  filters: Record<string, FilterOption[]>
) => {
  Object.entries(ID_PARAM_BY_KEY).forEach(([key, param]) => {
    const ids = (filters[key] ?? []).map((o) => o.id);
    if (ids.length > 0) params.append(param, ids.join(","));
  });

  const preset = filters.fecha?.[0]?.id;
  if (preset) {
    const range = dateRangeFromPreset(preset);
    if (range) {
      params.append("start_date", range.start_date);
      params.append("end_date", range.end_date);
    }
  }
};
