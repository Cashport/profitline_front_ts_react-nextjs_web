import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import { IApplyTabClients } from "@/types/applyTabClients/IApplyTabClients";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";
import { useState } from "react";

export const useApplicationTable = () => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const clientId = clientIdParam || "";
  const [preventRevalidation, setPreventRevalidation] = useState(false);

  const { ID } = useAppStore((state) => state.selectedProject);

  const pathKey = `/paymentApplication/applications/?project_id=${ID}&clientUUID=${clientId}`;

  const { data, error, mutate, isValidating } = useSWR<GenericResponse<IApplyTabClients>>(
    preventRevalidation ? null : pathKey, // No hay key -> no hay fetch
    preventRevalidation ? null : fetcher
  );

  return {
    data: data?.data,
    isLoading: !error && !data,
    error,
    mutate,
    isValidating,
    setPreventRevalidation
  };
};
