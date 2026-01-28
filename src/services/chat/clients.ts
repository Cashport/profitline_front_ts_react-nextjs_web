import config from "@/config";
import { PayloadByTicket } from "@/types/chat/IChat";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

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
    console.warn("error getting payload by ticket: ", error);
    return null;
  }
};

export const sendDigitalRecordWhatsapp = async (clientId: string, recipients: string[]) => {
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/client/send-digital-record-whatsapp`,
      { clientUUID: clientId, to: recipients }
    );
    return response.data;
  } catch (error) {
    console.warn("error sending digital record via whatsapp: ", error);
    throw error;
  }
};

export const downloadDigitalRecordFiles = async (clientId: string): Promise<any> => {
  try {
    const response = await API.post(`${config.API_HOST}/client/download-digital-record-files`, {
      clientUUID: clientId
    });
    return response.data;
  } catch (error) {
    console.warn("error downloading digital record files: ", error);
    return null;
  }
};
