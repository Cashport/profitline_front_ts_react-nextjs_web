import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMarketAdminProduct, IUseMarketAdminProductsParams } from "@/types/marketAdmin/IMarketAdmin";

export const useMarketAdminProducts = ({
  page = 1,
  limit = 10,
  search,
  lineId,
  categoryId,
  status
}: IUseMarketAdminProductsParams = {}) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const queryParams: string[] = [];
  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);
  if (search) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (lineId !== undefined) {
    queryParams.push(`line_id=${lineId}`);
  }
  if (categoryId !== undefined) {
    queryParams.push(`category_id=${categoryId}`);
  }
  // `status` puede ser 0 (inactivos), por eso la guarda es contra undefined
  if (status !== undefined) {
    queryParams.push(`status=${status}`);
  }
  const queryString = `?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMarketAdminProduct[]>>(
    ID ? `/product${queryString}` : null,
    fetcher,
    { keepPreviousData: true }
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
