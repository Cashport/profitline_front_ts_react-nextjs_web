import config from "@/config";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  ITask,
  ITaskByStatus,
  ITaskDetail,
  ITaskStatus,
  ITaskTabState,
  ITaskTypes
} from "@/types/tasks/ITasks";
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

export const getTaskTabs = async (): Promise<ITaskTabState[]> => {
  try {
    const response: GenericResponse<ITaskTabState[]> = await API.get(
      `${config.API_HOST}/task/counts-by-status`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTasksByStatus = async (
  statusId: string,
  page: number = 1
): Promise<ITaskByStatus> => {
  const body = { page };

  try {
    const response: GenericResponse<ITaskByStatus> = await API.post(
      `${config.API_HOST}/task/status-group/${statusId}`,
      body
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTaskDetails = async ({
  taskId,
  queueId
}: {
  taskId?: string;
  queueId?: string;
}): Promise<ITaskDetail> => {
  if (!taskId && !queueId) {
    throw new Error("Either taskId or queueId must be provided");
  }
  if (taskId && queueId) {
    throw new Error("Only one of taskId or queueId can be provided, not both");
  }
  try {
    const body = taskId ? { taskId } : { queueId };
    const response: GenericResponse<ITaskDetail> = await API.post(
      `${config.API_HOST}/task/get-task-details`,
      body
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
