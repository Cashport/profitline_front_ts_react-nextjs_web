import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminClientUser } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/clients/:client_id/users — usuarios con acceso al cliente
export const useMarketAdminClientUsers = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminClientUser[]>>(
    clientId ? `/marketplace-admin/clients/${clientId}/users` : null,
    fetcher
  );

  return { data: data?.data ?? [], isLoading, error, mutate };
};
