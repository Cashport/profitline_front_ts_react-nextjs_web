import useSWR from "swr";

import config from "@/config";
import instance, { fetcher } from "@/utils/api/api";
import type { IGetValidatedClientsResponse } from "@/types/communications/ICommunications";
import type { GenericResponse } from "@/types/global/IGlobal";

export const useClientList = () => {
  const { data, error, isLoading, mutate } = useSWR<
    GenericResponse<IGetValidatedClientsResponse[]>
  >("/comunication/my-client-list", fetcher);

  const getExportClientList = async (): Promise<Blob> => {
    const response = await instance.get<Blob>(
      `${config.API_HOST}/comunication/my-client-list?export=true`,
      { responseType: "blob" }
    );
    return response.data;
  };

  return {
    data: data?.data ?? [],
    loading: isLoading,
    error,
    mutate,
    getExportClientList
  };
};
