import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IClientDetailArchivesByType } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useArchivesClientDataByType = (
  clientId: string,
  dateFrom?: string | null,
  dateTo?: string | null,
  showProcessed?: number[],
  showFuture?: number[]
) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);
  if (showProcessed?.length) params.append("showProcessed", showProcessed.join(","));
  if (showFuture?.length) params.append("showFuture", showFuture.join(","));
  const queryString = params.toString();
  const pathKey = `/data/client-detail/${clientId}/archives/by-type${queryString ? `?${queryString}` : ""}`;

  const { data, error, isValidating, mutate } = useSWR<
    GenericResponse<IClientDetailArchivesByType[]>
  >(pathKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: true
  });

  return {
    archivesByType: data?.data,
    isLoading: !error && !data,
    isValidating,
    error,
    mutate
  };
};
