import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMedicalAccountHistoryItem } from "@/types/medicalAccounts/IMedicalAccounts";

export const useMedicalAccountHistory = (id: string | number | null | undefined) => {
  const pathKey = id ? `/medical-accounts/${id}/history` : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMedicalAccountHistoryItem[]>>(
    pathKey,
    fetcher
  );

  return {
    history: data?.data ?? [],
    isLoading,
    error,
    mutate
  };
};
