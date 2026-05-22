import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IDashboardSummary } from "@/types/dataQuality/IDataQuality";

export interface IDashboardSummaryFilters {
  month: string;
  id_country?: number | string;
  id_type_archive?: number[];
}

export const useDashboardSummary = (filters: IDashboardSummaryFilters) => {
  const { month, id_country, id_type_archive } = filters;

  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (id_country !== undefined && id_country !== "")
    params.append("id_country", String(id_country));
  if (id_type_archive && id_type_archive.length > 0)
    params.append("id_type_archive", id_type_archive.join(","));

  const queryString = params.toString();
  const pathKey = month
    ? `/data/dashboard-summary${queryString ? `?${queryString}` : ""}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IDashboardSummary>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
