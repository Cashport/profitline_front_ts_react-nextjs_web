import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { MedicalAccountStatus } from "../types/IMedicalAccount";

export const useMedicalAccountStatuses = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<MedicalAccountStatus[]>>(
    "/medical-accounts/statuses",
    fetcher
  );

  return {
    statuses: data?.data ?? [],
    isLoading,
    error
  };
};
