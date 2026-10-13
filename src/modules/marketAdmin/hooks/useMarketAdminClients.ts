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
  linea,
  asigned_user,
  coordinator,
  kam,
  kam_lider
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
  // Responsables: emails separados por coma (el backend hace split(",")).
  // Cada email se codifica aparte: un "+" sin codificar llega como espacio.
  const responsables = { asigned_user, coordinator, kam, kam_lider };
  Object.entries(responsables).forEach(([key, emails]) => {
    if (emails?.length) queryParams.push(`${key}=${emails.map(encodeURIComponent).join(",")}`);
  });
  const queryString = `?${queryParams.join("&")}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IMarketAdminClient[]>>(
    ID ? `/marketplace-admin/clients${queryString}` : null,
    (url: string) => fetcher(url, 30000),
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
