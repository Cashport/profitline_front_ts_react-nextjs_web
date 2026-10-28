import { GenericResponse } from "@/types/global/IGlobal";
import type { ITicket, TicketStatus } from "@/types/tickets/ITickets";
import { API } from "@/utils/api/api";

/** Cuerpo de POST/PATCH /tickets: llaves = `body_key` de cada campo de la config. */
export type TaskBody = Record<string, string | number | null>;

/** POST /tickets — los campos y obligatorios los valida el back contra la config. */
export const createTask = async (body: TaskBody): Promise<ITicket> => {
  const response: GenericResponse<ITicket> = await API.post("/tickets", body);
  return response.data;
};

/** PATCH /tickets/:id — `null` limpia un campo opcional. */
export const updateTask = async (id: number, body: TaskBody): Promise<ITicket> => {
  const response: GenericResponse<ITicket> = await API.patch(`/tickets/${id}`, body);
  return response.data;
};

/** PATCH /tickets/:id/status — transición validada por la máquina de estados del back. */
export const updateTaskStatus = async (
  id: number,
  status: TicketStatus,
  resolutionComment?: string | null
): Promise<ITicket> => {
  const response: GenericResponse<ITicket> = await API.patch(`/tickets/${id}/status`, {
    status,
    resolution_comment: resolutionComment?.trim() || null
  });
  return response.data;
};

/** PATCH /tickets/:id/assignee. */
export const updateTaskAssignee = async (id: number, userId: number): Promise<ITicket> => {
  const response: GenericResponse<ITicket> = await API.patch(`/tickets/${id}/assignee`, {
    assigned_to_user_id: userId
  });
  return response.data;
};
