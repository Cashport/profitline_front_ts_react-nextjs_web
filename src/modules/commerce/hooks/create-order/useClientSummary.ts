import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IClientSummary } from "@/types/commerce/ICommerce";

export const useClientSummary = (clientId?: string) => {
  const projectId = useAppStore((state) => state.selectedProject?.ID);

  const pathKey =
    projectId && clientId
      ? `/marketplace/projects/${projectId}/clients/${clientId}/summary`
      : null;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IClientSummary>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
