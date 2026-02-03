import config from "@/config";
import { PayloadByTicket, IDigitalRecordFile } from "@/types/chat/IChat";
import { IClientSegmentationDetail } from "@/types/clients/IClients";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";
import axios from "axios";

export async function getWhatsappClients() {
  try {
    const res =
      await API.get<{ uuid: string; id: string; client_name: string }[]>("/client/whatsapp");
    return res.data;
  } catch (error) {
    console.error("Error fetching WhatsApp clients:", error);
    throw error;
  }
}

export async function getWhatsappClientContacts(clientUUID: string) {
  try {
    const res = await API.get<{ id: number; contact_name: string; contact_phone: string }[]>(
      `/client/whatsapp/${clientUUID}/contacts`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching WhatsApp client contacts:", error);
    throw error;
  }
}

export async function getTemplateMessages(clientUUID: string, templateId: string) {
  try {
    const res = await API.get<any>(
      `/client/get-payload-by-client/client-uuid/${clientUUID}/template/${templateId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching template messages:", error);
    throw error;
  }
}

export const getPayloadByTicket = async (
  ticketId: string,
  templateId: string
): Promise<PayloadByTicket | null> => {
  try {
    const response: GenericResponse<any> = await API.get(
      `${config.API_HOST}/client/get-payload-by-ticket`,
      {
        params: { ticketId, templateId }
      }
    );
    const data = response?.data?.data || response?.data || response;

    return data;
  } catch (error) {
    console.error("error getting payload by ticket: ", error);
    return null;
  }
};

export const sendDigitalRecordWhatsapp = async (clientId: string, recipients: number[]) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/client/digital-record-whatsapp`,
      { clientUUID: clientId, destination: recipients }
    );
    return response.data;
  } catch (error) {
    console.error("error sending digital record via whatsapp: ", error);
    throw error;
  }
};

export const downloadDigitalRecordFiles = async (
  clientId: string
): Promise<IDigitalRecordFile[] | null> => {
  try {
    const response: GenericResponse<IDigitalRecordFile[]> = await API.post(
      `${config.API_HOST}/client/download-digital-record`,
      {
        clientUUID: clientId
      }
    );
    return response.data;
  } catch (error) {
    console.error("error downloading digital record files: ", error);
    return null;
  }
};

export const downloadDigitalRecordFilesFromToken = async (
  fileKey: string,
  token: string
): Promise<any> => {
  try {
    const response: GenericResponse<any> = await axios.post(
      `${config.API_HOST}/client/download-from-token`,
      {
        fileKey
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: "blob"
      }
    );
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "archivo.pdf");
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
    return response.data;
  } catch (error) {
    console.error("error downloading digital record files from token: ", error);
    return null;
  }
};

export const getClientSegmentationDetail = async (
  clientId: string
): Promise<IClientSegmentationDetail> => {
  try {
    const response: GenericResponse<IClientSegmentationDetail> = await API.get(
      `${config.API_HOST}/client/segmentation-detail?client_uuid=${clientId}`
    );
    return response.data;
  } catch (error) {
    console.error("error fetching client segmentation detail: ", error);
    throw error;
  }
};
