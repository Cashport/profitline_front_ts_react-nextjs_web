import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IChatData, ITicket, IWhatsAppTemplate } from "@/types/chat/IChat";
import { mockTickets, mockWhatsAppTemplates } from "@/modules/chat/lib/mock-data";

// Toggle para usar mock data mientras el backend no está disponible
const USE_MOCK = true;

export const getTickets = async (): Promise<ITicket[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockTickets;
  }

  try {
    const response: GenericResponse<ITicket[]> = await API.get("/whatsapp-tickets?limit=20", {
      baseURL: config.API_CHAT
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

export const getOneTicket = async (ticketId: string, limit: number = 20, page?: number): Promise<IChatData> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (page !== undefined) {
      params.append('page', page.toString());
    }
    
    const response: GenericResponse<IChatData> = await API.get(
      `/whatsapp-messages/ticket/${ticketId}?${params.toString()}`,
      {
        baseURL: config.API_CHAT
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
};

export const sendMessage = async (customerId: string, message: string): Promise<void> => {
  try {
    const body = {
      customerId,
      message
    };
    await API.post(`/whatsapp-messages`, body, {
      baseURL: config.API_CHAT
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getWhatsAppTemplates = async (): Promise<IWhatsAppTemplate[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockWhatsAppTemplates;
  }

  try {
    const response: GenericResponse<IWhatsAppTemplate[]> = await API.get("/whatsapp-templates", {
      baseURL: config.API_CHAT
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching WhatsApp templates:", error);
    throw error;
  }
};

export const sendWhatsAppTemplate = async (payload: any): Promise<void> => {
  try {
    await API.post("/whatsapp-templates/send", payload, {
      baseURL: config.API_CHAT
    });
  } catch (error) {
    console.error("Error sending WhatsApp template:", error);
    throw error;
  }
};