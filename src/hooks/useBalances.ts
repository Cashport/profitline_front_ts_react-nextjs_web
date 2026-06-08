import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import { IGetBalances } from "@/types/financialDiscounts/IFinancialDiscounts";

export const useBalances = () => {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const { data, isLoading, error, mutate } = useSWR<GenericResponse<IGetBalances[]>>(
    `/financial-discount/balances/project/${ID}`,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    isError: !!error,
    mutate
  };
};
