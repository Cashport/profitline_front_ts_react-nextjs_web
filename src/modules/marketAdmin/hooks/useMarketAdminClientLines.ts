import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { getAllLinesByClient } from "@/services/line/line";

// GET marketplace/projects/:projectId/clients/:client_id/products — líneas con sus productos
// (misma fuente que el plan anual en la pantalla de reglas de descuento)
export const useMarketAdminClientLines = (clientId?: string) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const { data, error, isLoading } = useSWR(
    projectId && clientId ? ["client-lines", projectId, clientId] : null,
    () => getAllLinesByClient(projectId.toString(), clientId!),
    { shouldRetryOnError: false }
  );

  return { data: data ?? [], isLoading, error };
};
