import useSWR from "swr";
import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { IMarketplaceOrderFilters } from "@/components/atoms/Filters/FilterMarketplaceOrders/FilterMarketplaceOrders";
import { IOrderData } from "@/types/commerce/ICommerce";
import { GenericResponse } from "@/types/global/IGlobal";
import { buildOrdersQueryParams } from "../../utils/buildOrdersQueryParams";

interface UseOrdersProps {
  selectedFilters: IMarketplaceOrderFilters;
  status_id?: number;
  page?: number;
  search?: string;
}

export const useOrders = ({ selectedFilters, status_id, page, search }: UseOrdersProps) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const queryString = buildOrdersQueryParams({
    sellers: selectedFilters.sellers,
    status_id,
    page,
    search
  });

  const pathKey = `/marketplace/projects/${projectId}/orders${queryString}`;

  const { data, error, mutate } = useSWR<GenericResponse<IOrderData[]>>(pathKey, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: false
  });

  return {
    ordersByCategory: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
};
