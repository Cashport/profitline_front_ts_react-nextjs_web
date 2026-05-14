import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

export interface IFinancialDiscount {
  id: number;
  sucursal_id: number | null;
  line_id: number | null;
  sub_line_id: number | null;
  project_id: number;
  dependecy_sucursal: number;
  initial_value: number;
  current_value: number;
  expiration_date: string;
  comments: string | null;
  files: string | null;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  status_id: number;
  document_type_id: number;
  client_id: string;
  percentage: number | null;
  is_discount: number | null;
  date_of_issue: string;
  erp_id: string;
  motive_id: number | null;
  validity_range: string | null;
  earlypay_date: string | null;
  is_legalized: number;
  status_name: string;
  project_name: string;
  document_type_name: string;
  motive_name: string | null;
  cp_id: number | null;
}

export interface StatusGroup {
  status_id: number;
  status_name: string;
  color: string;
  count: number;
  financial_discounts: IFinancialDiscount[];
  total: number;
  legalized: boolean;
}

export const useAcountingAdjustment = (clientId: string, projectId: string, type: number) => {
  const { data, isLoading, error, mutate } = useSWR<GenericResponse<StatusGroup[]>>(
    `/financial-discount/project/${projectId}/client/${clientId}?type=${type}`,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    isError: !!error,
    mutate
  };
};
