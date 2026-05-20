import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export interface IDataExplorationFilters {
  month?: string;
  data_type?: string;
  country?: string;
  region?: string;
  search?: string;
}

export const useDataExploration = (
  idCountry: number | string | undefined,
  filters: IDataExplorationFilters = {}
) => {
  const params = new URLSearchParams();
  if (filters.month) params.append("month", filters.month);
  if (filters.data_type) params.append("data_type", filters.data_type);
  if (filters.country) params.append("country", filters.country);
  if (filters.region) params.append("region", filters.region);
  if (filters.search) params.append("search", filters.search);

  const queryString = params.toString();
  const pathKey = idCountry
    ? `/data/master-data/monthly-summary/${idCountry}${queryString ? `?${queryString}` : ""}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<unknown>>(pathKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  });

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
