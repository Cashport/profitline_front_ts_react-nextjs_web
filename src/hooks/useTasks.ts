import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

interface ITaskStatus {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface ITask {
  id: number;
  id_project: number;
  id_client: string;
  description: string;
  related_user_id: number;
  amount: number;
  status: ITaskStatus;
  client_name: string;
  user_name: string;
  total_portfolio: number;
  task_type: string;
}
export const useTasks = (searchQuery?: string) => {
  const requestUrl = ["/task/get-all"];
  if (searchQuery) {
    requestUrl.push(`?searchQuery=${searchQuery}`);
  }

  const { data, isLoading, mutate } = useSWR<GenericResponse<ITask[]>>(
    requestUrl.join(""),
    fetcher
  );

  return {
    data: data?.data || [],
    isLoading,
    mutate
  };
};
