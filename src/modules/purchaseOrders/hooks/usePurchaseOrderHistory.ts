import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IHistoryTimelineEvent } from "@/types/purchaseOrders/purchaseOrders";

interface UsePurchaseOrderHistoryProps {
  purchaseOrderId?: string;
  enabled?: boolean;
}

interface HistoryTimelineResponse {
  success: boolean;
  data: IHistoryTimelineEvent[];
}

export const usePurchaseOrderHistory = ({
  purchaseOrderId,
  enabled = true
}: UsePurchaseOrderHistoryProps) => {
  const pathKey =
    purchaseOrderId && enabled ? `/purchaseorder/${purchaseOrderId}/events` : null;

  const { data, error, isLoading, mutate } = useSWR<HistoryTimelineResponse>(
    pathKey,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    events: data?.data || [],
    isLoading: !error && !data && enabled,
    error: error?.message || null,
    mutate
  };
};
