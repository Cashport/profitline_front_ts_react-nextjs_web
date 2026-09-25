import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import { IBalancesFilter, IGetBalances } from "@/types/financialDiscounts/IFinancialDiscounts";

export const useBalances = (filters?: IBalancesFilter) => {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const queries: string[] = [];
  if (filters?.users.length) queries.push(`users=${filters.users.join(",")}`);
  if (filters?.clients.length) queries.push(`clients=${filters.clients.join(",")}`);
  if (filters?.motive_ids?.length) queries.push(`motive_ids=${filters.motive_ids.join(",")}`);
  if (filters?.eligibility_status?.length)
    queries.push(`eligibility_status=${filters.eligibility_status.join(",")}`);
  if (filters?.from_date) queries.push(`from_date=${filters.from_date}`);
  if (filters?.to_date) queries.push(`to_date=${filters.to_date}`);
  if (filters?.client_uuid) queries.push(`client_uuid=${filters.client_uuid}`);
  if (filters?.search) queries.push(`search=${encodeURIComponent(filters.search)}`);

  const queryString = queries.length > 0 ? `?${queries.join("&")}` : "";

  const { data, isLoading, error, mutate } = useSWR<GenericResponse<IGetBalances[]>>(
    `/financial-discount/balances/project/${ID}${queryString}`,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    isError: !!error,
    mutate
  };
};
