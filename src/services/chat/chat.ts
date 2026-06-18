import config from "@/config";
import { API, ApiError } from "@/utils/api/api";
import {
  GenericResponse,
  GenericResponsePaginated,
  PaginationSimple
} from "@/types/global/IGlobal";
import { IChatData, ITemplateRequest, ITicket, IWhatsAppTemplate } from "@/types/chat/IChat";

// Toggle para usar mock data mientras el backend no está disponible

export interface GetTicketsResponse {
  data: ITicket[];
  pagination: PaginationSimple;
}

export const getTickets = async (
  limit: number = 20,
  page?: number,
  search?: string
): Promise<GetTicketsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (page !== undefined) {
      params.append("page", page.toString());
    }
    if (search) {
      params.append("searchQuery", search);
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
    if (error instanceof ApiError && error?.data?.message) {
      const res = error.data as { message: string };
      if (res?.message) {
        throw new Error(res.message || "Error sending message");
      }
    }
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

export const markTicketAsRead = async (ticketId: string): Promise<void> => {
  try {
    await API.put(
      `/whatsapp-messages/ticket/${ticketId}/mark-read`,
      {},
      { baseURL: config.API_CHAT }
    );
  } catch (error) {
    console.error("Error marking ticket as read:", error);
    throw error;
  }
};

export const closeWhatsAppTicket = async (ticketId: string): Promise<void> => {
  try {
    await API.put(`/whatsapp-tickets/${ticketId}/close`, {}, { baseURL: config.API_CHAT });
  } catch (error) {
    console.error("Error closing WhatsApp ticket:", error);
    throw error;
  }
};

export const sendAttahcment: (modelData: {
  customerId: string;
  caption: string;
  file: File;
}) => Promise<any> = async (modelData) => {
  const { customerId, caption, file } = modelData;
  try {
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("caption", caption);
    formData.append("file", file);
    const res = await API.post("/whatsapp-messages/send-attachment", formData, {
      baseURL: config.API_CHAT,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error sending attachment:", error);
    throw error;
  }
};

export const sendTemplate = async (payload: ITemplateRequest) => {
  try {
    await API.post("/cashport-whatsapp/send-template", payload);
  } catch (error) {
    console.error("Error sending WhatsApp template:", error);
    throw error;
  }
};

//deprecado
/**
 * @deprecated Usar sendTemplate en su lugar
 * @param payload
 */
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
