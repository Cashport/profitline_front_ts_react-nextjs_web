import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IRelatedSku } from "@/types/marketAdmin/IMarketAdmin";

// GET /product/:id/related-skus — SKUs ERP relacionados (is_principal === 1 → SKU principal).
export const useMarketAdminRelatedSkus = (id?: number | string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IRelatedSku[]>>(
    id ? `/product/${id}/related-skus` : null,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
