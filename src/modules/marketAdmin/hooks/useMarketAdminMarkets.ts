import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { getMarketAdminMarkets } from "@/services/marketAdmin/marketAdmin";

export const useMarketAdminMarkets = () => {
  const projectId = useAppStore((state) => state.selectedProject?.ID);
  const { data, error, isLoading, mutate } = useSWR<string[], Error>(
    projectId ? ["/marketplace-admin/clients/markets", projectId] : null,
    getMarketAdminMarkets,
    { revalidateOnFocus: false }
  );

  return { data: data ?? [], error, isLoading: !projectId || isLoading, mutate };
};
