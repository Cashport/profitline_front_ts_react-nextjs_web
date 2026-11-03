import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IProjectRolesConfig } from "@/types/roles/IProjectRoles";
import { projectRolesKey } from "@/services/roles/projectRoles";

export const useProjectRoles = (projectId: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IProjectRolesConfig>>(
    projectId ? projectRolesKey(projectId) : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return { config: data?.data, error, isLoading, mutate };
};
