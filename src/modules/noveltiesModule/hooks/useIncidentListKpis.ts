import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IIncidentListKpis } from "@/types/novelties/INovelties";

export const useIncidentListKpis = () => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IIncidentListKpis>>(
    "/invoice/incident-list/kpis",
    fetcher,
    { revalidateOnFocus: false }
  );

  return { data: data?.data, isLoading, error, mutate };
};
