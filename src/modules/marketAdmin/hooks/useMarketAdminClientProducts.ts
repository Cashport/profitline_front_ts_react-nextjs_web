import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminClientProductCategory } from "@/types/marketAdmin/IMarketAdmin";

// GET /marketplace-admin/clients/:client_id/products — productos disponibles según su pricelist
export const useMarketAdminClientProducts = (clientId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<
    GenericResponse<IMarketAdminClientProductCategory[]>
  >(clientId ? `/marketplace-admin/clients/${clientId}/products` : null, fetcher);

  return { data: data?.data ?? [], isLoading, error, mutate };
};
