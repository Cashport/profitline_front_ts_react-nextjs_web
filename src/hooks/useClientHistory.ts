import useSWR from "swr";
import { fetcher } from "@/utils/api/api";

import { useAppStore } from "@/lib/store/store";

import { GenericResponse } from "@/types/global/IGlobal";
import { IHistoryRow } from "@/types/clientHistory/IClientHistory";

type useBankRulesProps = {
  clientId: string;
};

interface IDetailResponse {
  error: string;
  message: string;
  data: IHistoryRow[];
}

export const useClientHistory = ({ clientId }: useBankRulesProps) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const pathKey = `/history/get-history?project_id=${ID}&client_id=${clientId}`;

  const { data, error, mutate } = useSWR<GenericResponse<IDetailResponse>>(pathKey, fetcher);

  return {
    data: data?.data.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
