import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IGetCatalogMaterialEquivalence } from "@/types/dataQuality/IDataQuality";
import { GenericResponse } from "@/types/global/IGlobal";

export const useCatalogMaterialEquivalences = (catalogMaterialId?: number) => {
  const pathKey = catalogMaterialId
    ? `/data/catalog/materials/${catalogMaterialId}/equivalence`
    : null;

  const { data, error, isLoading, mutate } = useSWR<
    GenericResponse<IGetCatalogMaterialEquivalence[]>
  >(pathKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  });

  return {
    data: data?.data ?? [],
    isLoading,
    error,
    mutate
  };
};
