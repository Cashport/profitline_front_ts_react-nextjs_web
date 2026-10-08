import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IBotHistoryList } from "@/types/dataQuality/IDataQuality";

// GET /data/bots/:scheduleId/history: solo se pide cuando hay un schedule seleccionado
// (el drawer abierto); con scheduleId null, SWR no dispara el fetch.
export const useBotHistory = (scheduleId: number | null, page: number = 1, limit: number = 20) => {
  const key = scheduleId != null ? `/data/bots/${scheduleId}/history?page=${page}&limit=${limit}` : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IBotHistoryList>>(key, fetcher, {
    revalidateOnFocus: false
  });

  return {
    history: data?.data,
    isLoading,
    error,
    mutate
  };
};
