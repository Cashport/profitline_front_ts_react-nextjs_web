import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminProductDetail } from "@/types/marketAdmin/IMarketAdmin";

export const useMarketAdminProductDetail = (id?: number | string) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IMarketAdminProductDetail>>(
    id ? `/product/${id}` : null,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
