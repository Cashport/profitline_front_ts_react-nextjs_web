import useSWR from "swr";
import { useParams } from "next/navigation";

import { fetcher } from "@/utils/api/api";
import { extractSingleParam } from "@/utils/utils";

import { IClientPaymentStatus } from "@/types/clientPayments/IClientPayments";
import { GenericResponse } from "@/types/global/IGlobal";

export const useClientsPayments = () => {
  const params = useParams();

  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);

  const clientId = clientIdParam || "";
  const projectId = projectIdParam ? parseInt(projectIdParam) : 0;

  const pathKey = `/bank/get-payments/project/${projectId}/client/${clientId}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IClientPaymentStatus[]>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
