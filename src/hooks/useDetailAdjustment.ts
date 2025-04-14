import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

export interface IInvoices {
  id: number;
  id_erp: string;
}

interface FinancialDiscountEvent {
  id: number;
  id_financial_discount: string;
  cp_id_financial_discount: number;
  cp_status: number;
  invoices: {} | IInvoices[];
  files: string[] | Record<string, never>;
  created_at: string;
  invoice_event_type: number;
  user_id: number | null;
  comments: string;
  event_date: string;
  is_deleted: number;
  amount: number;
  status: number;
  username: string | null;
  event_name: string;
  financial_type: string;
  cp_id: number | null;
}

interface FinancialDiscountData {
  details: FinancialDiscountEvent[];
  initial_amount: number;
  current_amount: number;
  appliedamount: number;
}

interface FinancialDiscountResponse {
  status: number;
  message: string;
  data: FinancialDiscountData;
}

interface UseFinancialDiscountProps {
  financialDiscountId: number;
  projectId: number;
  clientId: string;
}

export const useFinancialDiscountDetail = (props: UseFinancialDiscountProps) => {
  const { data, error, isLoading } = useSWR<FinancialDiscountResponse>(
    `/financial-discount/${props.financialDiscountId}/project/${props.projectId}/client/${props.clientId}`,
    fetcher
  );

  return {
    data: data?.data,
    message: data?.message,
    error: error,
    isLoading: isLoading
  };
};
