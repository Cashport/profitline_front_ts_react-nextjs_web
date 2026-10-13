import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminClientConfig } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/clients/:client_id/config — ajustes financieros y operativos
export const useMarketAdminClientConfig = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminClientConfig>>(
    clientId ? `/marketplace-admin/clients/${clientId}/config` : null,
    fetcher
  );

  return { data: data?.data, isLoading, error, mutate };
};
