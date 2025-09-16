import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ITask } from "@/types/tasks/ITasks";
import { ISelectFilterTasks } from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

export const useTasks = (filters: ISelectFilterTasks, searchQuery: string) => {
  const queryParams: string[] = [];

  if (searchQuery) {
    queryParams.push(`searchQuery=${searchQuery}`);
  }

  if (filters.statuses.length > 0) {
    const statusesParam = filters.statuses.map((status) => `${status}`).join(",");
    queryParams.push(`status=${statusesParam}`);
  }

  if (filters.taskTypes.length > 0) {
    const taskTypesParam = filters.taskTypes.map((type) => `${type}`).join(",");
    queryParams.push(`taskType=${taskTypesParam}`);
  }

  const requestUrl = "/task/get-all" + (queryParams.length > 0 ? `?${queryParams.join("&")}` : "");

  const { data, isLoading, mutate } = useSWR<GenericResponse<ITask[]>>(requestUrl, fetcher);

  return {
    data: data?.data || [],
    isLoading,
    mutate
  };
};
