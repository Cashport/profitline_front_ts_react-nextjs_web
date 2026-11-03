import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { useTicketsView } from "../stores/tickets-view-store";

/** Llave SWR del gestor de tareas: ruta + proyecto + `refreshToken`. */
export type TaskKey = readonly [string, number, number];

/**
 * El proyecto va en la llave para que al cambiar de proyecto no se vea la
 * caché del anterior; `refreshToken` sube tras crear/editar y recarga lista,
 * grupos, tablero y conteos de una vez (también las llaves de useSWRInfinite,
 * que el `mutate` global no alcanza).
 */
export function useTaskKey() {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const refreshToken = useTicketsView((s) => s.refreshToken);
  return (path: string | null): TaskKey | null =>
    path && projectId ? [path, projectId, refreshToken] : null;
}

export const taskFetcher = ([url]: TaskKey) => fetcher(url);
