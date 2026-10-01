import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminClientDetail } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/clients/:client_id — info general + conteos de los tabs
export const useMarketAdminClientDetail = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminClientDetail>>(
    clientId ? `/marketplace-admin/clients/${clientId}` : null,
    fetcher
  );

  return { data: data?.data, isLoading, error, mutate };
};
