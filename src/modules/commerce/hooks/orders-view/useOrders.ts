import useSWR from "swr";
import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { IMarketplaceOrderFilters } from "@/components/atoms/Filters/FilterMarketplaceOrders/FilterMarketplaceOrders";
import { IOrderData } from "@/types/commerce/ICommerce";
import { GenericResponse } from "@/types/global/IGlobal";

interface UseOrdersProps {
  selectedFilters: IMarketplaceOrderFilters;
}

export const useOrders = ({ selectedFilters }: UseOrdersProps) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  // Construir query params de manera simple
  const sellersQuery =
    selectedFilters.sellers && selectedFilters.sellers.length > 0
      ? `?sellers=${selectedFilters.sellers.join(",")}`
      : "";

  // Path completo para SWR
  const pathKey = `/marketplace/projects/${projectId}/orders${sellersQuery}`;

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
