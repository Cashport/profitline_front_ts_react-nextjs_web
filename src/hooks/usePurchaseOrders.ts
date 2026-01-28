import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { IPurchaseOrder, IUsePurchaseOrdersParams } from "@/types/purchaseOrders/purchaseOrders";

export const usePurchaseOrders = ({
  page = 1,
  pageSize = 25,
  search,
  clientId,
  sellerId,
  statusId,
  createdFrom,
  createdTo
}: IUsePurchaseOrdersParams) => {
  const queryParams: string[] = [];

  // Pagination (always included)
  queryParams.push(`page=${page}`);
  queryParams.push(`pageSize=${pageSize}`);

  // Search (encoded)
  if (search) {
    queryParams.push(`search=${encodeURIComponent(search.trim())}`);
  }

  // Filters (check !== undefined to allow empty values)
  if (clientId !== undefined) {
    queryParams.push(`clientId=${encodeURIComponent(clientId)}`);
  }
  if (sellerId !== undefined) {
    queryParams.push(`sellerId=${encodeURIComponent(sellerId)}`);
  }
  if (statusId !== undefined) {
    queryParams.push(`statusId=${statusId}`);
  }

  // Date ranges (truthy check)
  if (createdFrom) {
    queryParams.push(`createdFrom=${createdFrom}`);
  }
  if (createdTo) {
    queryParams.push(`createdTo=${createdTo}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<IPurchaseOrder[]>>(
    `/purchaseOrder/all${queryString}`,
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
