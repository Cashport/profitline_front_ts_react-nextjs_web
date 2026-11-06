import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMonitoringSubscriptionsData } from "../types/monitoring";

export const useMonitoringSubscriptions = (enabled: boolean) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMonitoringSubscriptionsData>>(
    enabled ? "/data/monitoring/subscriptions" : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { data: data?.data, error, isLoading, mutate };
};
