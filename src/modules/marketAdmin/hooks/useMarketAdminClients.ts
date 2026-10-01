import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMarketAdminClient, IUseMarketAdminClientsParams } from "@/types/marketAdmin/IMarketAdmin";

export const useMarketAdminClients = ({
  page = 1,
  limit = 10,
  search,
  status,
  linea
}: IUseMarketAdminClientsParams = {}) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const queryParams: string[] = [];
  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);
  if (search) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (status !== undefined) {
    queryParams.push(`status=${status}`);
  }
  if (linea) {
    queryParams.push(`linea=${encodeURIComponent(linea)}`);
  }
  const queryString = `?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMarketAdminClient[]>>(
    ID ? `/marketplace-admin/clients${queryString}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? {
      actualPage: page,
      rowsperpage: limit,
      totalPages: 0,
      totalRows: 0
    },
    isLoading,
    error,
    mutate
  };
};
