import useSWR from "swr";

import { fetcher } from "@/utils/api/api";

import { GenericResponse } from "@/types/global/IGlobal";

interface UseInvoiceClaimsProps {
  invoiceId?: number;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useInvoiceClaims = ({
  invoiceId,
  page = 1,
  limit = 10,
  enabled = true
}: UseInvoiceClaimsProps) => {
  const { data, isLoading, error, mutate } = useSWR<GenericResponse<any>>(
    enabled && invoiceId ? `/invoice/${invoiceId}/claims?page=${page}&limit=${limit}` : null,
    fetcher
  );

  return {
    data: data?.data,
    loading: isLoading,
    error,
    mutate
  };
};
