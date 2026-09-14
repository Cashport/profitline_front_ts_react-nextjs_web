import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { INoveltyStatus } from "@/types/novelties/INovelties";

const EMPTY: INoveltyStatus[] = [];

export const useNoveltyStatuses = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<INoveltyStatus[]>>(
    "/invoice/novelty-status",
    fetcher,
    { revalidateOnFocus: false }
  );

  const statuses = data?.data ? [...data.data].sort((a, b) => a.sort_order - b.sort_order) : EMPTY;

  return { statuses, isLoading, error };
};
