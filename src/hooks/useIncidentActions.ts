import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { IIncidentAction } from "@/types/novelties/INovelties";

interface UseIncidentActionsProps {
  /** Sin id no se pide nada (grupos de cartera que no son novedad). */
  incidentId?: number | null;
}

/** Acciones (tickets) de una novedad: GET /invoice/incident/:id/actions. */
export const useIncidentActions = (props: UseIncidentActionsProps) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<IIncidentAction[]>>(
    props.incidentId ? `/invoice/incident/${props.incidentId}/actions` : null,
    fetcher
  );

  return {
    data: data?.data,
    error,
    isLoading,
    mutate
  };
};
