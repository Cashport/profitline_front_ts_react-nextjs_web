import config from "@/config";
import { API } from "@/utils/api/api";
import {
  GenericResponse,
  GenericResponsePaginated,
  PaginationSimple
} from "@/types/global/IGlobal";
import { IChatData, ITicket, IWhatsAppTemplate } from "@/types/chat/IChat";
import { mockTickets, mockWhatsAppTemplates } from "@/modules/chat/lib/mock-data";

// Toggle para usar mock data mientras el backend no está disponible
const USE_MOCK = false;

export interface GetTicketsResponse {
  data: ITicket[];
  pagination: PaginationSimple;
}

export const getTickets = async (
  limit: number = 20,
  page?: number,
  search?: string
): Promise<GetTicketsResponse> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter by search if provided
    let filteredTickets = mockTickets;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = mockTickets.filter(
        (ticket) =>
          ticket.clientName?.toLowerCase().includes(searchLower) ||
          ticket.customer?.name?.toLowerCase().includes(searchLower) ||
          ticket.customer?.phoneNumber?.includes(search) ||
          ticket.subject?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const currentPage = page ?? 1;
    const total = filteredTickets.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (currentPage - 1) * limit;
    const paginatedData = filteredTickets.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page: currentPage,
        limit,
        total,
        pages
      }
    };
  }

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
