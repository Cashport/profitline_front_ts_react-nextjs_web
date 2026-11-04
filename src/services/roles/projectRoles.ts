import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { IProjectRolesConfig } from "@/types/roles/IProjectRoles";
import { API } from "@/utils/api/api";

export const projectRolesKey = (projectId: number) => `/role/projects/${projectId}`;

export const updateProjectRoles = async (
  projectId: number,
  rolIds: number[]
): Promise<IProjectRolesConfig> => {
  const response: GenericResponse<IProjectRolesConfig> = await API.put(
    `${config.API_HOST}${projectRolesKey(projectId)}`,
    { rol_ids: rolIds }
  );
  return response.data;
};
