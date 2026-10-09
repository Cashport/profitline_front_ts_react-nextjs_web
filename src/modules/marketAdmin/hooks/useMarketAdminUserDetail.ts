import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminUserDetail } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/users/:id — info del usuario + clientes asignados
export const useMarketAdminUserDetail = (userId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminUserDetail>>(
    userId ? `/marketplace-admin/users/${userId}` : null,
    fetcher
  );

  return { data: data?.data, isLoading, error, mutate };
};
