import { fetcher } from "@/utils/api/api";
import { InvoiceDetail } from "@/types/clients/invoice-detail";
import useSWR from "swr";

interface UseInvoiceDetailProps {
  id?: number;
  page?: number;
  clientId?: string;
  projectId?: number;
  invoiceId?: number;
}

export const useInvoiceDetail = (props: UseInvoiceDetailProps) => {
  const { data, isLoading, mutate } = useSWR<InvoiceDetail>(
    `/invoice/${props.invoiceId}/client/${props.clientId}/project/${props.projectId}`,
    fetcher
  );
  return {
    data: data?.data,
    loading: isLoading,
    mutate
  };
};
