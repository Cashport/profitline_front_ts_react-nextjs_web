import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IClientDetail } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useDataQualityClientDetail = () => {
  // Hardcoded values as per requirements
  const idClient = "3";
  const idProject = 100;

  const pathKey = `/data/client-detail/${idClient}/${idProject}`;

  const { data, error, mutate } = useSWR<GenericResponse<IClientDetail>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    clientDetail: data?.data,
    isLoading: !error && !data,
    error,
    mutate
  };
};
