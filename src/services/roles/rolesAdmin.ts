import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { IRoleDetail } from "@/types/roles/IRolesAdmin";
import { API } from "@/utils/api/api";

export const ROLES_ADMIN_KEY = "/role/admin";
export const ROLES_CATALOG_KEY = "/role/admin/catalog";
export const roleDetailKey = (rolId: number) => `/role/admin/${rolId}`;

export const saveRole = async (input: {
  rol_id?: number;
  rol_name: string;
  component_ids: number[];
}): Promise<IRoleDetail> => {
  const body = { rol_name: input.rol_name, component_ids: input.component_ids };
  const response: GenericResponse<IRoleDetail> = input.rol_id
    ? await API.put(`${config.API_HOST}${roleDetailKey(input.rol_id)}`, body)
    : await API.post(`${config.API_HOST}${ROLES_ADMIN_KEY}`, body);
  return response.data;
};

export const getRoleDetail = async (rolId: number): Promise<IRoleDetail> => {
  const response: GenericResponse<IRoleDetail> = await API.get(
    `${config.API_HOST}${roleDetailKey(rolId)}`
  );
  return response.data;
};

export const moveEndpoint = async (endpointId: number, componentId: number) => {
  await API.put(`${config.API_HOST}/role/admin/endpoints/${endpointId}`, {
    component_id: componentId
  });
};

export const createComponent = async (
  pageId: number,
  componentName: string
): Promise<{ component_id: number }> => {
  const response: GenericResponse<{ component_id: number }> = await API.post(
    `${config.API_HOST}/role/admin/components`,
    { page_id: pageId, component_name: componentName }
  );
  return response.data;
};
