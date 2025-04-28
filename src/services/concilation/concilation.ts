import config from "@/config";
import {
  CreateIncidentResponse,
  IInvoiceIncident,
  InfoConcilation
} from "@/types/concilation/concilation";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

export const invoiceConciliation = async (
  files: File[],
  clientId: string,
  projectId: number
): Promise<InfoConcilation> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("client_id", clientId.toString());
  formData.append("project_id", projectId.toString());

  try {
    const response: GenericResponse<InfoConcilation> = await API.post(
      `${config.API_HOST}/massive-action/invoice-conciliation`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const invoiceCreateIncident = async (
  files: File[],
  invoices: IInvoiceIncident[],
  comments: string,
  clientId: string
) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("invoices", JSON.stringify(invoices));
  formData.append("comments", comments);
  formData.append("client_id", clientId.toString());

  const response: GenericResponse<CreateIncidentResponse> = await API.post(
    `${config.API_HOST}/massive-action/invoice-create-incident`,
    formData
  );

  return response;
};
