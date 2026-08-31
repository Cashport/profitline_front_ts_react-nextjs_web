import useSWR from "swr";

import { getAllLinesByProject } from "@/services/line/line";
import { useAppStore } from "@/lib/store/store";

// GET /line/project/:id — opciones del filtro de Línea del listado de clientes.
// El proyecto va en la key para no servir el cache de otro proyecto al cambiarlo.
export const useMarketAdminLines = () => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const { data, error, isLoading } = useSWR(
    ID ? ["/line/project", ID] : null,
    () => getAllLinesByProject(String(ID)),
    { revalidateOnFocus: false }
  );

  return { data: data?.filter((line) => !line.is_deleted) ?? [], isLoading, error };
};
