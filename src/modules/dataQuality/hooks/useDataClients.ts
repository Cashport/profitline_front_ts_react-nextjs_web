import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IDataClient } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useDataClients = (countryId: number | null) => {
  const { data, error, mutate } = useSWR<GenericResponse<IDataClient[]>>(
    countryId != null ? `/data/clients?country_id=${countryId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    clients: data?.data,
    isLoading: countryId != null && !error && !data,
    error,
    mutate
  };
};
