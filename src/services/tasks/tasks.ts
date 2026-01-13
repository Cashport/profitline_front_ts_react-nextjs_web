import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import { ITaskStatus, ITaskTypes } from "@/types/tasks/ITasks";
import { API } from "@/utils/api/api";

export const getTasksStatus = async (): Promise<ITaskStatus[]> => {
  try {
    const response: GenericResponse<ITaskStatus[]> = await API.get(
      `${config.API_HOST}/task/get-status`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTaskTypes = async (): Promise<ITaskTypes[]> => {
  try {
    const response: GenericResponse<ITaskTypes[]> = await API.get(
      `${config.API_HOST}/task/get-types`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTasks = async (
  statusId: string = "6d5e2aa5-8e77-11f0-b08c-0635ef5156a1"
): Promise<ITaskTypes[]> => {
  try {
    const response: GenericResponse<any[]> = await API.post(
      `${config.API_HOST}/task/status-group${statusId ? `/${statusId}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
