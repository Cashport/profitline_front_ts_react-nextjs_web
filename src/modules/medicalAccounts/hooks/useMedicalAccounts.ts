import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMedicalAccountListItem } from "../types/IMedicalAccount";

interface UseMedicalAccountsParams {
  page?: number;
  limit?: number;
}

export const useMedicalAccounts = ({ page = 1, limit = 20 }: UseMedicalAccountsParams = {}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const pathKey = projectId
    ? `/medical-accounts?project_id=${projectId}&page=${page}&limit=${limit}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMedicalAccountListItem[]>>(
    pathKey,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? {
      actualPage: page,
      rowsperpage: limit,
      totalPages: 0,
      totalRows: 0
    },
    isLoading,
    error,
    mutate
  };
};
