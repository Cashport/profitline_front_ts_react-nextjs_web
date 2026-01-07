import useSWR from "swr";

import { fetcher } from "@/utils/api/api";

import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import { IApprovalsResponse } from "@/types/approvals/IApprovals";

interface UseApprovalsParams {
  page?: number;
  limit?: number;
  typeActionCode?: string[];
  status?: string[];
  search?: string;
}

export const useApprovals = ({
  page = 1,
  limit = 20,
  typeActionCode,
  status,
  search
}: UseApprovalsParams = {}) => {
  const queryParams: string[] = [];
  queryParams.push("only_actionable=true");
  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);

  if (search?.trim()) {
    queryParams.push(`q=${search.trim()}`);
  }

  if (typeActionCode && typeActionCode.length > 0) {
    queryParams.push(`typeActionCode=${typeActionCode.join(",")}`);
  }
  if (status && status.length > 0) {
    queryParams.push(`status=${status.join(",")}`);
  }

  const pathKey = `/approval?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IApprovalsResponse>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data.items || [],
    pagination: {
      page: data?.data.page,
      limit: data?.data.limit,
      total: data?.data.total
    },
    isLoading,
    error,
    mutate
  };
};
