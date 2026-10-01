import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITicketsSummary } from "@/types/tickets/ITickets";
import { buildTicketFilterParams } from "../utils/tickets-params";
import type { TicketFilters } from "../types";

/**
 * Tarjetas de resumen: GET /tickets/summary. Respeta los mismos filtros que el
 * listado salvo `situation`, que aquí no aplica (cada bucket ya es una).
 */
export const useTicketsSummary = (filters: Omit<TicketFilters, "situation"> = {}) => {
  const params = buildTicketFilterParams(filters);
  const query = params.toString();

  const { data, error, isLoading, mutate } = useSWR<GenericResponse<ITicketsSummary>>(
    `/tickets/summary${query ? `?${query}` : ""}`,
    fetcher,
    { keepPreviousData: true }
  );

  return { summary: data?.data, isLoading, error, mutate };
};
