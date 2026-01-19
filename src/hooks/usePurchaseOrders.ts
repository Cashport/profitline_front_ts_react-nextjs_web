import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { getAllOrdersUrl } from "@/services/purchaseOrders/purchaseOrders";
import { IPurchaseOrder } from "@/types/purchaseOrders/purchaseOrders";

interface IUsePurchaseOrdersParams {
  projectId: number;
  page?: number;
  limit?: number;
}

export const usePurchaseOrders = ({
  projectId
  //   page = 1,
  //   limit = 20
}: IUsePurchaseOrdersParams) => {
  const queryParams: string[] = [];
  //   queryParams.push(`page=${page}`);
  //   queryParams.push(`limit=${limit}`);

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IPurchaseOrder[]>>(
    `${getAllOrdersUrl(projectId)}${queryString}`,
    fetcher
  );

  return {
    data: data?.data ?? [],
    pagination: data?.pagination ?? {
      actualPage: 1,
      rowsperpage: 10,
      totalPages: 0,
      totalRows: 0
    },
    isLoading,
    error,
    mutate
  };
};
