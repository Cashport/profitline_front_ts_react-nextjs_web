import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

export const useBotsStatus = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IBotStatusItem[]>>(
    "/data/bots/status",
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
