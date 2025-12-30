import config from "@/config";
import { API } from "@/utils/api/api";
import {
  GenericResponse,
  GenericResponsePaginated,
  PaginationSimple
} from "@/types/global/IGlobal";
import { IChatData, ITicket, IWhatsAppTemplate } from "@/types/chat/IChat";

export interface GetTicketsResponse {
  data: ITicket[];
  pagination: PaginationSimple;
}

export const getTickets = async (
  limit: number = 20,
  page?: number
): Promise<GetTicketsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (page !== undefined) {
      params.append("page", page.toString());
    }

    const response: GenericResponsePaginated<ITicket[]> = await API.get(
      `/whatsapp-tickets?${params.toString()}`,
      {
        baseURL: config.API_CHAT
      }
    );
    return {
      data: response.data,
      pagination: response.pagination
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

export const getOneTicket = async (
  ticketId: string,
  limit: number = 20,
  page?: number
): Promise<IChatData> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (page !== undefined) {
      params.append("page", page.toString());
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
