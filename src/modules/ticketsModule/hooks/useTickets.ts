import { useState } from "react";
import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponsePage } from "@/types/global/IGlobal";
import type { ITicket } from "@/types/tickets/ITickets";
import { buildTicketFilterParams } from "../utils/tickets-params";
import type { TicketFilters } from "../types";

interface UseTicketsParams extends TicketFilters {
  page?: number;
  limit?: number;
}

/** Bandeja de tickets: GET /tickets, paginado y filtrado en el servidor. */
export const useTickets = ({
  page = 1,
  limit = 20,
  situation,
  ...filters
}: UseTicketsParams = {}) => {
  const params = buildTicketFilterParams(filters);
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (situation) params.set("situation", situation);

  // Momento de la última respuesta exitosa; null hasta la primera.
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  // Los filtros van dentro de la cache key: cada combinación se cachea aparte.
  const { data, error, isLoading, mutate } = useSWR<GenericResponsePage<ITicket[]>>(
    `/tickets?${params.toString()}`,
    fetcher,
    { keepPreviousData: true, onSuccess: () => setFetchedAt(new Date()) }
  );

  return {
    tickets: data?.data,
    pagination: data?.pagination ?? {
      actualPage: page,
      rowsperpage: limit,
      totalPages: 0,
      totalRows: 0
    },
    fetchedAt,
    isLoading,
    error,
    mutate
  };
};
