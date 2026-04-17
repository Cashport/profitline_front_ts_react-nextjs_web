import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";

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
  // TO DO: Cambiar el any por el tipo correcto
  const { data, error, isLoading, mutate } = useSWR(pathKey, fetcher);

  return {
    data,
    loading: isLoading,
    error,
    mutate
  };
};
