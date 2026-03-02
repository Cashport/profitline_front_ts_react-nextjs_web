import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IGetCatalogs } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";

export const useCatalogsDataQuality = (clientId: string, countryId: string) => {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const pathKey = `/data/catalog/materials?id_client=${clientId}&id_country=${countryId}&id_project=${ID}`;

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IGetCatalogs[]>>(
    pathKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000
    }
  );

  return {
    data: data?.data,
    isLoading,
    error,
    mutate
  };
};
