import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMarketAdminProduct, IUseMarketAdminProductsParams } from "@/types/marketAdmin/IMarketAdmin";

export const useMarketAdminProducts = ({
  page = 1,
  limit = 10,
  search
}: IUseMarketAdminProductsParams = {}) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const queryParams: string[] = [];
  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);
  if (search) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }
  const queryString = `?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMarketAdminProduct[]>>(
    ID ? `/product${queryString}` : null,
    fetcher
  );

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? {
      actualPage: 1,
      rowsperpage: 10,
      totalPages: 0,
      totalRows: 0
    },
    isLoading,
    error,
    mutate
  };
};
