import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentsByStatus } from "@/types/banks/IBanks";
import { IActivePaymentsFilters } from "@/components/atoms/Filters/FilterActivePaymentsTab/FilterActivePaymentsTab";

interface Props {
  like?: string;
  selectedFilters?: IActivePaymentsFilters;
}

export const useBankPayments = ({ like, selectedFilters }: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const startDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[0]
    : undefined;
  const endDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[1]
    : undefined;
  const status = selectedFilters?.active?.length ? Number(selectedFilters.active[0]) : undefined;

  const likeQuery = `${like ? `&like=${like}` : ""}`;
  const startDateQuery = startDate ? `&start_date=${startDate}` : "";
  const endDateQuery = endDate ? `&end_date=${endDate}` : "";
  const statusQuery = status !== undefined ? `&status=${status}` : "";

  const pathKey = `/bank/get-payments?project_id=${projectId}${likeQuery}${startDateQuery}${endDateQuery}${statusQuery}`;

  const { data, error, mutate } = useSWR<GenericResponse<IPaymentsByStatus[]>>(pathKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: false
  });

  return {
    data: data?.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
