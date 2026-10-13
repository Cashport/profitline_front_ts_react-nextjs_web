import useSWR from "swr";

import { fetcher } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITicket } from "@/types/tickets/ITickets";

/** Un ticket (GET /tickets/:id). Sin id no se pide nada: el modal está cerrado. */
export const useTicketDetail = (ticketId?: number | null) => {
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<ITicket>>(
    ticketId ? `/tickets/${ticketId}` : null,
    fetcher
  );

  return { ticket: data?.data, isLoading, error, mutate };
};
