import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentsByStatus } from "@/types/banks/IBanks";

interface Props {
  like?: string;
}

export const useBankPayments = ({ like }: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const pathKey = like
    ? `/bank/get-payments?project_id=${projectId}&like=${like}`
    : `/bank/get-payments?project_id=${projectId}`;

  const { data, error, mutate } = useSWR<GenericResponse<IPaymentsByStatus[]>>(pathKey, fetcher);

  return {
    data: data?.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
