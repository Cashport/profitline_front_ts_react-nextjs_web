import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IVariableHistoryEntry } from "@/types/dataQuality/IDataQuality";

// GET /data/client-archive-monthly/:id/variable-history: solo se pide cuando el
// drawer de historial de variables está abierto; con archiveId null, SWR no fetchea.
export const useVariableHistory = (archiveId: number | null) => {
  const key = archiveId != null ? `/data/client-archive-monthly/${archiveId}/variable-history` : null;

  const { data, error, isLoading } = useSWR<GenericResponse<IVariableHistoryEntry[]>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    history: data?.data,
    isLoading,
    error
  };
};
