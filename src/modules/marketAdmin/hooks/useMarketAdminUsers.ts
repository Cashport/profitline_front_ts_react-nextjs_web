import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IMarketAdminUser, IUseMarketAdminUsersParams } from "@/types/marketAdmin/IMarketAdmin";

export const useMarketAdminUsers = ({
  page = 1,
  limit = 10,
  search,
  role_id,
  status
}: IUseMarketAdminUsersParams = {}) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const queryParams: string[] = [];
  queryParams.push(`page=${page}`);
  queryParams.push(`limit=${limit}`);
  if (search) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }
  if (role_id !== undefined) {
    queryParams.push(`role_id=${role_id}`);
  }
  if (status !== undefined) {
    queryParams.push(`status=${status}`);
  }
  const queryString = `?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMarketAdminUser[]>>(
    ID ? `/marketplace-admin/users${queryString}` : null,
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
