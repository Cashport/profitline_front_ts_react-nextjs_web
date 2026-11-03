import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IAuxiliaryFile } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

const ACTIVE_BATCH_STATUSES = ["uploading", "queued", "processing"];

export const useAuxiliaryFiles = () => {
  const { data, error, isValidating, mutate } = useSWR<GenericResponse<IAuxiliaryFile[]>>(
    "/data/auxiliary-files",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
      // Mientras un lote este en proceso se refresca el estado del listado.
      refreshInterval: (latest) =>
        latest?.data?.some(
          (file) =>
            !!file.last_batch &&
            ACTIVE_BATCH_STATUSES.includes(file.last_batch.status)
        )
          ? 5000
          : 0
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
