import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITodayVisits } from "@/types/visits/IVisits";
import { DAY_PARAM } from "../utils/visits-format";
import { dayFetchOptions } from "../utils/visits-fetch";

/**
 * Visitas de un día por asesor: GET /visit-admin/today-visits?date=YYYY-MM-DD.
 * El `day` va en la URL de la llave, así que SWR cachea por día y vuelve a pedir
 * cuando el filtro de la barra cambia de fecha.
 */
export function useTodayVisits(day: string, isToday: boolean) {
  const { data, error, isLoading } = useSWR<GenericResponse<ITodayVisits>>(
    `/visit-admin/today-visits?${DAY_PARAM}=${day}`,
    fetcher,
    dayFetchOptions(isToday)
  );

  return { dayVisits: data?.data, isLoading, error };
}
