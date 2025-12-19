import config from "@/config";
import { API } from "@/utils/api/api";

export async function getWhatsappClients() {
  const res =
    await API.get<{ uuid: string; id: string; client_name: string }[]>("/client/whatsapp");
  return res.data;
}

export async function getWhatsappClientContacts(clientUUID: string) {
  const res = await API.get<{ id: number; contact_name: string; contact_phone: string }[]>(
    `/client/whatsapp/${clientUUID}/contacts`
  );
  return res.data;
}

export async function getTemplateMessages(clientUUID: string, templateId: string) {
  const res = await API.get<any>(
    `/client/get-payload-by-client/client-uuid/${clientUUID}/ticket/${templateId}`
  );
  return res.data;
}

export const sendWhatsAppTemplateNew = async (payload: any): Promise<void> => {
  try {
    await API.post("/whatsapp-templates/send-new", payload, {
      baseURL: config.API_CHAT
    });
  } catch (error) {
    console.error("Error sending WhatsApp template:", error);
    throw error;
  }
};
