import config from "@/config";
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
      `/client/get-payload-by-client/client-uuid/${clientUUID}/ticket/${templateId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching template messages:", error);
    throw error;
  }
}
