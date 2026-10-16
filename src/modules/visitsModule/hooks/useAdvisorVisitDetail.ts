import useSWR from "swr";

import { getAdvisorVisitDetail } from "@/services/visits/visits";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IAdvisorVisitDetail } from "@/types/visits/IVisits";
import { dayFetchOptions } from "../utils/visits-fetch";

/**
 * Detalle del día de un asesor: GET /visit-admin/users/:user_id/day-detail?date=YYYY-MM-DD.
 * Sin asesor abierto no pide nada. El `day` va en la URL de la llave, así que SWR
 * cachea por día y vuelve a pedir cuando la barra cambia de fecha.
 */
export function useAdvisorVisitDetail(userId: number | null, day: string, isToday: boolean) {
  const { data, error, isLoading } = useSWR<GenericResponse<IAdvisorVisitDetail>>(
    userId != null ? ["advisor-visit-detail", userId, day] : null,
    ([, id, date]) => getAdvisorVisitDetail(id as number, date as string),
    dayFetchOptions(isToday)
  );

  return { detail: data?.data, isLoading, error };
}
