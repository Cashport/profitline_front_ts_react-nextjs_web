import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IGetPreviewClients } from "@/types/communications/ICommunications";

interface Props {
  communicationId: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const useClientCommunication = ({ communicationId, page, limit, search }: Props) => {
  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (search && search.trim()) params.append("search", search.trim());

  const query = params.toString();
  const pathKey = `/comunication/circularizations/${communicationId}/clients${query ? `?${query}` : ""}`;
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetPreviewClients>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data,
    loading: isLoading,
    error,
    mutate
  };
};
