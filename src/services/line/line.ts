import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ICategory, ILine, ISubLine } from "@/types/lines/line";

export const getAllLinesByProject = async (idProject: string) => {
  const response: GenericResponse<ILine[]> = await API.get(`/line/project/${idProject}`);
  return response?.data || [];
};
export const getSubLinesByProject = async (idProject: string) => {
  const response: GenericResponse<ISubLine[]> = await API.get(
    `/bussines-rule/project/${idProject}/subline`
  );
  return response?.data || [];
};
export const getAllLinesByClient = async (idProject: string, clientId: string) => {
  const response: GenericResponse<ICategory[]> = await API.get(
    `marketplace/projects/${idProject}/clients/${clientId}/products`
  );
  return response?.data || [];
};
