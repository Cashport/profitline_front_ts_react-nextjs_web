import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IAuxiliaryFile } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useAuxiliaryFiles = () => {
  const { data, error, isValidating, mutate } = useSWR<GenericResponse<IAuxiliaryFile[]>>(
    "/data/auxiliary-files",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true
    }
  );

  return {
    auxiliaryFiles: data?.data,
    isLoading: !error && !data,
    isValidating,
    error,
    mutate
  };
};
