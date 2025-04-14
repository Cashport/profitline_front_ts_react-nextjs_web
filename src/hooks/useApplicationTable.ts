import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import { IApplyTabClients } from "@/types/applyTabClients/IApplyTabClients";
import { useParams } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";

export const useApplicationTable = () => {
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const clientId = clientIdParam || "";

  const { ID } = useAppStore((state) => state.selectedProject);

  const pathKey = `/paymentApplication/applications/?project_id=${ID}&client_id=${clientId}`;

  const { data, error, mutate, isValidating } = useSWR<GenericResponse<IApplyTabClients>>(
    pathKey,
    fetcher
  );

  return {
    data: data?.data,
    isLoading: !error && !data,
    error,
    mutate,
    isValidating
  };
};
