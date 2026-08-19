import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMedicalAccountListItem } from "../types/IMedicalAccount";

interface UseMedicalAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export const useMedicalAccounts = ({
  page = 1,
  limit = 20,
  search = "",
  status = null,
  dateFrom = null,
  dateTo = null
}: UseMedicalAccountsParams = {}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const params = new URLSearchParams();
  if (projectId) params.set("project_id", String(projectId));
  params.set("page", String(page));
  params.set("limit", String(limit));

  const term = search.trim();
  if (term) params.set("search", term);
  if (status) params.set("status_code", status);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  const pathKey = projectId ? `/medical-accounts?${params.toString()}` : null;

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
