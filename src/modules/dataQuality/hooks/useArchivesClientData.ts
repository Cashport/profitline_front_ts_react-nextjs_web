import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IClientDetailArchiveClient } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useArchivesClientData = (
  clientId: string,
  dateFrom?: string | null,
  dateTo?: string | null
) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);
  const queryString = params.toString();
  const pathKey = `/data/client-detail/${clientId}/archives${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<GenericResponse<IClientDetailArchiveClient[]>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    archives: data?.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
