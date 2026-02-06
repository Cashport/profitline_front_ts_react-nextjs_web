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
  id_alert_status?: number[]
) => {
  const queryParams = [];
  if (page) queryParams.push(`page=${page}`);
  if (limit) queryParams.push(`limit=${limit}`);
  if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
  if (id_country) queryParams.push(`id_country=${id_country}`);
  if (id_client) queryParams.push(`id_client=${id_client}`);
  if (id_alert_status) queryParams.push(`id_alert_status=${id_alert_status}`);

  const pathKey = `/data/alerts${queryParams.length ? `?${queryParams.join("&")}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetAlerts[]>>(
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
