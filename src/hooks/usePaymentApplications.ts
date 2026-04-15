import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentApplicationByStatus } from "@/types/paymentApplications/IPaymentApplication";

interface Props {
  selectedFilters?: any;
}

export const usePaymentApplications = ({ selectedFilters }: Props) => {
  const startDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[0]
    : undefined;
  const endDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[1]
    : undefined;

  const startDateQuery = startDate ? `&start_date=${startDate}` : "";
  const endDateQuery = endDate ? `&end_date=${endDate}` : "";

  const pathKey = `/paymentApplication/list?${startDateQuery}${endDateQuery}`;

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
