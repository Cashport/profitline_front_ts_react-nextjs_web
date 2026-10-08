import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITodayVisits } from "@/types/visits/IVisits";

/** Visitas de hoy por asesor: GET /visit-admin/today-visits. */
export function useTodayVisits() {
  const { data, error, isLoading } = useSWR<GenericResponse<ITodayVisits>>(
    "/visit-admin/today-visits",
    fetcher
  );

  return { todayVisits: data?.data, isLoading, error };
}
