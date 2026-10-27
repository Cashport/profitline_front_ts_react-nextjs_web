import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  AuxiliaryBatchStatus,
  IAuxiliaryUploadBatch
} from "@/types/dataQuality/IDataQuality";

const TERMINAL_STATUSES: AuxiliaryBatchStatus[] = [
  "completed",
  "completed_with_errors",
  "incomplete"
];

export const isAuxiliaryBatchTerminal = (status?: AuxiliaryBatchStatus | null): boolean =>
  !!status && TERMINAL_STATUSES.includes(status);

/**
 * Consulta el estado del lote de cargue mientras haya archivos en proceso.
 * El polling se detiene solo cuando el lote llega a un estado terminal.
 */
export const useAuxiliaryUploadBatch = (batchId: string | null) => {
  const { data, error, mutate, isValidating } = useSWR<GenericResponse<IAuxiliaryUploadBatch>>(
    batchId ? `/data/auxiliary-upload-batches/${batchId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000,
      refreshInterval: (latest) =>
        latest?.data && !isAuxiliaryBatchTerminal(latest.data.status) ? 4000 : 0
    }
  );

  return {
    batch: data?.data,
    error,
    mutate,
    isValidating,
    isTerminal: isAuxiliaryBatchTerminal(data?.data?.status)
  };
};
