import { useCallback, useEffect, useState } from "react";
import { API } from "@/utils/api/api";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";
import { InvoicesData } from "@/types/invoices/IInvoices";
import { GenericResponse } from "@/types/global/IGlobal";

interface Params {
  page?: number;
  limit?: number;
  paymentAgreement?: number;
  radicationType?: number;
  lines?: number[];
  sublines?: number[];
  zones?: number[];
  channels?: number[];
  searchQuery?: string;
}

export const useInvoices = (initialParams: Params = {}) => {
  const [data, setData] = useState<InvoicesData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);
  const clientId = clientIdParam || "";
  const projectId = projectIdParam ? parseInt(projectIdParam) : 0;

  const fetchData = useCallback(
    async (overrideParams?: Partial<Params>) => {
      setIsLoading(true);
      try {
        const paramsToSend = { ...initialParams, ...overrideParams };

        const response: GenericResponse<InvoicesData[]> = await API.post(
          `/invoice/get-client/${clientId}/project/${projectId}`,
          {
            page: paramsToSend.page ?? 1,
            limit: paramsToSend.limit ?? 50,
            payment_agrement: paramsToSend.paymentAgreement,
            radication_type: paramsToSend.radicationType,
            line: paramsToSend.lines,
            subline: paramsToSend.sublines,
            zone: paramsToSend.zones,
            channel: paramsToSend.channels
            // rowsPerPage: 2 // Default value, can be adjusted as needed
          }
        );

        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      clientId,
      projectId,
      initialParams.page,
      initialParams.limit,
      initialParams.paymentAgreement,
      initialParams.radicationType,
      initialParams.lines?.join(","),
      initialParams.sublines?.join(","),
      initialParams.zones?.join(","),
      initialParams.channels?.join(","),
      initialParams.searchQuery
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    mutate: () => fetchData()
  };
};
