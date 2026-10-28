import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITaskConfig, ITaskFieldConfig, TaskFieldKey } from "@/types/tickets/ITickets";

/**
 * GET /tickets/config: procesos, campos activos del proyecto, estados y
 * catálogos. El front solo pinta lo que viene aquí (FEMSA sin País ni Tier).
 */
export const useTaskConfig = () => {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const { data, error, isLoading } = useSWR<GenericResponse<ITaskConfig>>(
    projectId ? ["/tickets/config", projectId] : null,
    ([url]: [string]) => fetcher(url),
    { revalidateOnFocus: false }
  );

  return { config: data?.data, error, isLoading };
};

/** Campo activo del proyecto, o undefined si el proyecto no lo usa. */
export const fieldOf = (
  config: ITaskConfig | undefined,
  key: TaskFieldKey | null | undefined
): ITaskFieldConfig | undefined => (key ? config?.fields.find((f) => f.key === key) : undefined);
