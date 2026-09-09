import config from "@/config";
import { API } from "@/utils/api/api";

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
}

export const addIncidentComment = async (
  incidentId: string,
  commentData: AddCommentData
): Promise<any> => {
  const response: any = await API.post(
    `${config.API_HOST}/invoice/incident-comments/${incidentId}`,
    commentData
  );

  return response;
};
