import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import { GenericResponse } from "@/types/global/IGlobal";
import { IMarketAdminProductLine } from "@/types/marketAdmin/IMarketAdmin";

// GET /product/lines — opciones del filtro de Línea. El projectid lo inyecta el
// interceptor de axios, pero va también en la key para no servir el cache de
// otro proyecto al cambiar de proyecto.
export const useMarketAdminProductLines = () => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const { data, error, isLoading } = useSWR<GenericResponse<IMarketAdminProductLine[]>>(
    ID ? ["/product/lines", ID] : null,
    () => fetcher("/product/lines"),
    { revalidateOnFocus: false }
  );

  return { data: data?.data ?? [], isLoading, error };
};
