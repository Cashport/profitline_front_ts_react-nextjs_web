import useSWR from "swr";

import { getAdvisorVisitDetail } from "@/services/visits/visits";

/**
 * Detalle del día de un asesor: GET /visit-admin/users/:user_id/day-detail. Sin
 * asesor abierto no pide nada.
 */
export function useAdvisorVisitDetail(userId: number | null) {
  const { data, error, isLoading } = useSWR(
    userId != null ? ["advisor-visit-detail", userId] : null,
    () => getAdvisorVisitDetail(userId!)
  );

  return { detail: data?.data, isLoading, error };
}
