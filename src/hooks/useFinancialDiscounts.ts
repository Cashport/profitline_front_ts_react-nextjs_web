import { useCallback, useEffect, useState } from "react";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IFinancialDiscountsResponse,
  StatusFinancialDiscounts
} from "@/types/financialDiscounts/IFinancialDiscounts";

interface Params {
  clientId: string;
  projectId: number;
  id?: number;
  line?: number[];
  subline?: number[];
  channel?: number[];
  zone?: number[];
  searchQuery?: string;
  page?: number;
  motive_id?: number;
  statusId?: string | number;
}

export const useFinancialDiscounts = (initialParams: Params) => {
  const [data, setData] = useState<IFinancialDiscountsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchData = useCallback(
    async (overrideParams?: Partial<Params>, mergeByStatus = false) => {
      setIsLoading(true);
      try {
        const params = { ...initialParams, ...overrideParams };

        const response: GenericResponse<IFinancialDiscountsResponse> = await API.post(
          `/financial-discount/get-project/${params.projectId}/client/${params.clientId}`,
          {
            line: params.line,
            subline: params.subline,
            channel: params.channel,
            zone: params.zone,
            searchQuery: params.searchQuery,
            page: params.page,
            motive_id: params.motive_id,
            statusId: params.statusId
            // rowsPerPage: 2 // Default value, can be adjusted as needed
          }
        );

        if (mergeByStatus && params.statusId && response.data?.rows?.length > 0) {
          const updatedStatus: StatusFinancialDiscounts = response.data.rows[0];
          setData((prev) => {
            if (!prev) return response.data;
            return {
              ...prev,
              rows: prev.rows.map((item) =>
                item.status_id === updatedStatus.status_id ? updatedStatus : item
              )
            };
          });
        } else {
          setData(response.data);
        }

        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      initialParams.clientId,
      initialParams.projectId,
      initialParams.id,
      initialParams.line?.join(","),
      initialParams.subline?.join(","),
      initialParams.channel?.join(","),
      initialParams.zone?.join(","),
      initialParams.searchQuery,
      initialParams.page,
      initialParams.motive_id,
      initialParams.statusId
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetchByStatus: (statusId: string | number, page?: number) =>
      fetchData({ statusId, page }, true)
  };
};
