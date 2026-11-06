import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMonitoringSummary } from "../types/monitoring";

export const useMonitoringSummary = (countryId?: number, month?: string) => {
  const params = new URLSearchParams();
  if (countryId) params.set("id_country", String(countryId));
  if (month) params.set("month", month);

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMonitoringSummary>>(
    countryId ? `/data/monitoring/summary?${params.toString()}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false, dedupingInterval: 60000 }
  );

  return { data: data?.data, error, isLoading, mutate };
};
