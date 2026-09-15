import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";

const EMPTY: string[] = [];

export const useIncidentListCoordinators = () => {
  const { data, error, isLoading } = useSWR<GenericResponse<string[]>>(
    "/invoice/incident-list/coordinators",
    fetcher,
    { revalidateOnFocus: false }
  );

  return { coordinators: data?.data ?? EMPTY, isLoading, error };
};
