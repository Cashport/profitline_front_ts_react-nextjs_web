import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentApplicationByStatus } from "@/types/paymentApplications/IPaymentApplication";

interface Props {
  selectedFilters?: any;
  enabled?: boolean;
}

export const usePaymentApplications = ({ selectedFilters, enabled = true }: Props) => {
  const startDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[0]
    : undefined;
  const endDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[1]
    : undefined;

  const startDateQuery = startDate ? `&start_date=${startDate}` : "";
  const endDateQuery = endDate ? `&end_date=${endDate}` : "";

  const pathKey = enabled ? `/paymentApplication/list?${startDateQuery}${endDateQuery}` : null;

  const { data, error, mutate } = useSWR<GenericResponse<IPaymentApplicationByStatus[]>>(pathKey, fetcher, {
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
