import useSWR from "swr";

import type { GenericResponse } from "@/types/global/IGlobal";
import type { ITaskOptionItem, ITicket, ITicketLog } from "@/types/tickets/ITickets";
import { taskFetcher, useTaskKey } from "./useTaskKey";

/** Una tarea (GET /tickets/:id). Sin id no se pide nada: el modal está cerrado. */
export const useTaskDetail = (ticketId: number | null) => {
  const key = useTaskKey();
  const { data, error, isLoading, mutate } = useSWR<GenericResponse<ITicket>>(
    key(ticketId ? `/tickets/${ticketId}` : null),
    taskFetcher,
    // Tras un cambio (refreshToken) se sigue viendo la tarea mientras recarga; nunca otra tarea.
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const ticket = data?.data?.id === ticketId ? data?.data : undefined;
  return { ticket, isLoading, error, mutate };
};

/** Historial de cambios (GET /tickets/:id/history), en orden cronológico. */
export const useTaskHistory = (ticketId: number | null) => {
  const key = useTaskKey();
  const { data, error, isLoading } = useSWR<GenericResponse<ITicketLog[]>>(
    key(ticketId ? `/tickets/${ticketId}/history` : null),
    taskFetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const logs = data?.data ?? [];
  const history = logs.length && logs[0].ticket_id !== ticketId ? [] : logs;
  return { history, isLoading, error };
};

/** Referencia estable para "sin opciones" (evita efectos que corren en cada render). */
const NO_OPTIONS: ITaskOptionItem[] = [];

/**
 * Clientes del proyecto para crear/editar (GET /tickets/options/:field):
 * por texto, o por ids para mostrar la etiqueta del valor ya elegido.
 */
export const useTaskOptions = (
  field: "client" | "data_client" | null,
  search: string,
  ids: string[] = []
) => {
  const key = useTaskKey();
  let path: string | null = null;
  if (field) {
    const params = new URLSearchParams({ limit: "20" });
    if (ids.length) params.set("ids", ids.join(","));
    else params.set("search", search.trim());
    path = `/tickets/options/${field}?${params.toString()}`;
  }
  const { data, isLoading } = useSWR<GenericResponse<ITaskOptionItem[]>>(key(path), taskFetcher, {
    keepPreviousData: true
  });
  return { options: data?.data ?? NO_OPTIONS, isLoading };
};
