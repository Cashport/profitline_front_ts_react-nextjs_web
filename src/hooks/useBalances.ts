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
  if (filters?.from_date) queries.push(`from_date=${filters.from_date}`);
  if (filters?.to_date) queries.push(`to_date=${filters.to_date}`);

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
