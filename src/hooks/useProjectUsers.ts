import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { useAppStore } from "@/lib/store/store";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IUser } from "@/types/users/IUser";

/**
 * Usuarios del proyecto activo (GET /user/lte/:projectId), para selects de
 * responsable. Mismo endpoint que `getUsersByProject`, pero por SWR: el
 * servicio se traga los errores y devolvía el error como si fuera la respuesta.
 */
export const useProjectUsers = () => {
  const projectId = useAppStore((state) => state.selectedProject?.ID);

  const { data, error, isLoading } = useSWR<GenericResponse<IUser[]>>(
    projectId ? `/user/lte/${projectId}` : null,
    fetcher
  );

  return {
    users: data?.data ?? [],
    error,
    isLoading
  };
};
