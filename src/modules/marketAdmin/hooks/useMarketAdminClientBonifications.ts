import useSWR from "swr";

import { getManagerBonificationSummary } from "@/services/marketAdmin/marketAdmin";

// GET /manager-bonification/summary?client_id=:nit — bonificados manuales del cliente
export const useMarketAdminClientBonifications = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    clientId ? ["manager-bonification-summary", clientId] : null,
    () => getManagerBonificationSummary(clientId!)
  );

  return { data, isLoading, error, mutate };
};
