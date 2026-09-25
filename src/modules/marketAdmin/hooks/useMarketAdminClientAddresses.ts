import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminClientAddress } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/clients/:client_id/addresses — la principal viene primero
export const useMarketAdminClientAddresses = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminClientAddress[]>>(
    clientId ? `/marketplace-admin/clients/${clientId}/addresses` : null,
    fetcher
  );

  return { data: data?.data ?? [], isLoading, error, mutate };
};
