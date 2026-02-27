import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IPOS } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const usePointsOfSale = (clientId: string, countryId: string) => {
  const pathKey = `/data/all-pos?id_client=${clientId}&id_country=${countryId}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IPOS[]>>(
    clientId && countryId ? pathKey : null,
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
