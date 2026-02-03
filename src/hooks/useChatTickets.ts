import config from "@/config";
import { GetTicketsResponse } from "@/services/chat/chat";
import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

interface UseChatTicketsParams {
  limit?: number;
  page?: number;
  search?: string;
  isRead?: boolean;
}

const useChatTickets = ({ limit = 200, page = 1, search, isRead }: UseChatTicketsParams = {}) => {
  const params = [`limit=${limit}`, `page=${page}`];

  if (search) {
    params.push(`searchQuery=${search}`);
  }
  if (typeof isRead === "boolean") {
    if (isRead) {
      params.push(`is_read=1`);
    } else {
      params.push(`is_read=0`);
    }
  }

  const patKey = `${config.API_CHAT}/whatsapp-tickets?${params.join("&")}`;
  const { data, isLoading, error, mutate } = useSWR<GetTicketsResponse>(patKey, fetcher, {
    refreshInterval: 7000,
    revalidateOnFocus: true
  });

  return {
    data: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  };
};

export default useChatTickets;
