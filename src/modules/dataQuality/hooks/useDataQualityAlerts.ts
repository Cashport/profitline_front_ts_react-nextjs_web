import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IGetAlerts } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useDataQualityAlerts = (
  page?: number,
  limit: number = 10,
  search?: string,
  id_country?: number,
  id_client?: number,
  types?: string[]
) => {
  const queryParams = [];
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (id_country) queryParams.push(`id_country=${id_country}`);
  if (id_client) queryParams.push(`id_client=${id_client}`);
  if (types?.length) queryParams.push(`type=${encodeURIComponent(types.join(","))}`);

  const pathKey = `/data/alerts${queryParams.length ? `?${queryParams.join("&")}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetAlerts>>(
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
