import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { ITask } from "@/types/tasks/ITasks";

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
