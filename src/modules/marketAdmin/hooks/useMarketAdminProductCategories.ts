import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminProductCategory } from "@/types/marketAdmin/IMarketAdmin";

// GET /product/categories — opciones del filtro de Categoría. Se trae la lista
// completa del proyecto: cada categoría ya expone su line_id, así que no hace
// falta el ?line_id= del endpoint.
export const useMarketAdminProductCategories = () => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const { data, error, isLoading } = useSWR<GenericResponse<IMarketAdminProductCategory[]>>(
    ID ? ["/product/categories", ID] : null,
    () => fetcher("/product/categories"),
    { revalidateOnFocus: false }
  );

  return { data: data?.data ?? [], isLoading, error };
};
