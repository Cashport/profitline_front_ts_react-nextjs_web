import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMedicalAccountUploadData } from "@/types/medicalAccounts/IMedicalAccounts";

export const useMedicalAccountDetail = (id: string | number | null | undefined) => {
  // Base URL already ends in `/api`; a by-id GET needs no project_id.
  const pathKey = id ? `/medical-accounts/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMedicalAccountUploadData>>(
    pathKey,
    fetcher
  );

  return {
    account: data?.data ?? null,
    isLoading,
    error,
    mutate
  };
};
