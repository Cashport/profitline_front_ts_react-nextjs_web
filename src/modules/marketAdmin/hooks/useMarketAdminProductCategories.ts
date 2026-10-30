import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminProductCategory } from "@/types/marketAdmin/IMarketAdmin";

// GET /product/categories — opciones del filtro de Categoría. Se trae la lista
// completa del proyecto: cada categoría ya expone su line_id, así que no hace
// falta el ?line_id= del endpoint. Con `includeProductLines` también devuelve
// las líneas en las que la categoría tiene productos (una fila por línea).
export const useMarketAdminProductCategories = (includeProductLines = false) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const url = includeProductLines
    ? "/product/categories?include_product_lines=true"
    : "/product/categories";

  const { data, error, isLoading } = useSWR<GenericResponse<IMarketAdminProductCategory[]>>(
    ID ? [url, ID] : null,
    () => fetcher(url),
    { revalidateOnFocus: false }
  );

  return { data: data?.data ?? [], isLoading, error };
};
