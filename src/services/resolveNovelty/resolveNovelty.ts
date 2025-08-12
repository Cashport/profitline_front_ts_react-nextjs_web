import config from "@/config";
import { API } from "@/utils/api/api";

interface IncidentActionData {
  comments?: string;
  files?: File[];
}

export const approveIncident = async (
  invoiceId: number,
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
    `${config.API_HOST}/invoice/${invoiceId}/approve-incident/${incidentId}`,
    formData
  );

  return response;
};

export const rejectIncident = async (
  invoiceId: number,
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
    `${config.API_HOST}/invoice/${invoiceId}/reject-incident/${incidentId}`,
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
