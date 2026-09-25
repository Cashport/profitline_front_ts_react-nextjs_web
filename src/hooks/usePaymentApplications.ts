import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentApplicationByStatus } from "@/types/paymentApplications/IPaymentApplication";
import { useDebounce } from "@/hooks/useDeabouce";
import { PaymentTransactionType } from "@/modules/banks/constants/paymentTransactionType";

interface Props {
  selectedFilters?: any;
  searchQuery?: string;
  enabled?: boolean;
  transaction_type?: PaymentTransactionType[];
}

export const usePaymentApplications = ({
  selectedFilters,
  searchQuery,
  enabled = true,
  transaction_type
}: Props) => {
  const debouncedSearchQuery = useDebounce(searchQuery ?? "", 500);

  const startDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[0]
    : undefined;
  const endDate = selectedFilters?.dates?.length
    ? selectedFilters.dates[0].split("|")[1]
    : undefined;

  const startDateQuery = startDate ? `&start_date=${startDate}` : "";
  const endDateQuery = endDate ? `&end_date=${endDate}` : "";
  const searchQueryParam = debouncedSearchQuery ? `&searchQuery=${debouncedSearchQuery}` : "";
  const typeQuery = transaction_type?.length
    ? `&transaction_type=${transaction_type.join(",")}`
    : "";

  const pathKey = enabled
    ? `/paymentApplication/list?${startDateQuery}${endDateQuery}${searchQueryParam}${typeQuery}`
    : null;

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
