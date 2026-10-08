import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IGetDataExploration } from "@/types/dataQuality/IDataQuality";

export interface IDataExplorationFilters {
  id_country?: number | string;
  month?: string;
  id_type_archive?: number | string;
  data_type?: string;
  country?: string;
  region?: string;
  search?: string;
}

export const useDataExploration = (filters: IDataExplorationFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.id_country !== undefined && filters.id_country !== "")
    params.append("id_country", String(filters.id_country));
  if (filters.month) params.append("month", filters.month);
  if (filters.id_type_archive !== undefined && filters.id_type_archive !== "")
    params.append("id_type_archive", String(filters.id_type_archive));
  if (filters.data_type) params.append("data_type", filters.data_type);
  if (filters.country) params.append("country", filters.country);
  if (filters.region) params.append("region", filters.region);
  if (filters.search) params.append("search", filters.search);

  const queryString = params.toString();
  const pathKey = `/data/master-data/monthly-summary${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetDataExploration>>(
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
