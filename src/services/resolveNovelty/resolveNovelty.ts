import config from "@/config";
import { API } from "@/utils/api/api";
import type { GenericResponse } from "@/types/global/IGlobal";
import type {
  ICreateIncidentActionBody,
  ICreateIncidentBody,
  ICreateIncidentData,
  IIncidentAction,
  IResolveIncidentActionBody,
  IUpdateIncidentBody,
  IUpdateIncidentStatusBody
} from "@/types/novelties/INovelties";

interface IncidentActionData {
  comments?: string;
  files?: File[];
}

// Aprueba/rechaza TODA la novedad (todos sus documentos activos), no una
// sola factura -- el backend ya no requiere `invoiceId` en la ruta (ver
// `POST /invoice/incident/:incident_id/approve|reject`).
export const approveIncident = async (
  incidentId: number,
  actionData: IncidentActionData
): Promise<any> => {
  const formData = new FormData();
  actionData.comments && formData.append("comments", actionData.comments);

  if (actionData.files) {
    actionData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/incident/${incidentId}/approve`,
    formData
  );

  return response;
};

export const rejectIncident = async (
  incidentId: number,
  actionData: IncidentActionData
): Promise<any> => {
  const formData = new FormData();
  actionData.comments && formData.append("comments", actionData.comments);

  if (actionData.files) {
    actionData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/incident/${incidentId}/reject`,
    formData
  );

  return response;
};

interface AddCommentData {
  comments: string;
  files?: File[];
}

// multipart/form-data: `comments` obligatorio + `files` (0..N) opcional.
export const addIncidentComment = async (
  incidentId: number | string,
  commentData: AddCommentData
): Promise<any> => {
  const formData = new FormData();
  formData.append("comments", commentData.comments);

  if (commentData.files) {
    commentData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response: any = await API.post(
    `${config.API_HOST}/invoice/incident-comments/${incidentId}`,
    formData
  );

  return response;
};

// Acciones (tickets) de la novedad. `title` es lo único obligatorio.
export const createIncidentAction = async (
  incidentId: number,
  body: ICreateIncidentActionBody
): Promise<GenericResponse<IIncidentAction>> => {
  const response: GenericResponse<IIncidentAction> = await API.post(
    `${config.API_HOST}/invoice/incident/${incidentId}/actions`,
    body
  );

  return response;
};

// Sólo resuelve una acción OPEN de esa misma novedad.
export const resolveIncidentAction = async (
  incidentId: number,
  actionId: number,
  body: IResolveIncidentActionBody = {}
): Promise<GenericResponse<IIncidentAction>> => {
  const response: GenericResponse<IIncidentAction> = await API.patch(
    `${config.API_HOST}/invoice/incident/${incidentId}/actions/${actionId}/resolve`,
    body
  );

  return response;
};

// Crea una novedad sobre facturas y/o saldos del cliente. El endpoint es
// multipart (acepta evidencia en `files`), así que `documents` viaja
// serializado, igual que `invoices_id` en el flujo legado.
export const createIncident = async (
  clientUuid: string,
  body: ICreateIncidentBody
): Promise<GenericResponse<ICreateIncidentData>> => {
  const formData = new FormData();
  formData.append("motive_id", String(body.motive_id));
  formData.append("documents", JSON.stringify(body.documents));
  if (body.comments) formData.append("comments", body.comments);
  if (body.assigned_to != null) formData.append("assigned_to", String(body.assigned_to));
  if (body.limit_date) formData.append("limit_date", body.limit_date);
  if (body.next_ticket_date) formData.append("next_ticket_date", body.next_ticket_date);

  const response: GenericResponse<ICreateIncidentData> = await API.post(
    `${config.API_HOST}/invoice/incident/client/${clientUuid}`,
    formData
  );

  return response;
};

// Edita los datos de la novedad (tipo, responsable, fechas).
export const updateIncident = async (
  incidentId: number,
  body: IUpdateIncidentBody
): Promise<GenericResponse<unknown>> => {
  const response: GenericResponse<unknown> = await API.put(
    `${config.API_HOST}/invoice/incident/${incidentId}`,
    body
  );

  return response;
};

// Cambia el estado de la novedad (catálogo incident_status).
export const updateIncidentStatus = async (
  incidentId: number,
  body: IUpdateIncidentStatusBody
): Promise<GenericResponse<unknown>> => {
  const response: GenericResponse<unknown> = await API.patch(
    `${config.API_HOST}/invoice/incident/${incidentId}/status`,
    body
  );

  return response;
};
