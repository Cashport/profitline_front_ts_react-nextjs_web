import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";

interface Props {
  page?: number;
  limit?: number;
  search?: string;
}

export const useClientCommunication = ({ page, limit, search }: Props = {}) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const params = new URLSearchParams();
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));
  if (search && search.trim()) params.append("search", search.trim());

  const query = params.toString();
  const pathKey = projectId
    ? `/comunication/circularizations/${projectId}/clients${query ? `?${query}` : ""}`
    : null;

  // TO DO: Cambiar el any por el tipo correcto
  const { data, error, isLoading, mutate } = useSWR(pathKey, fetcher);

  return {
    data,
    loading: isLoading,
    error,
    mutate
  };
};
