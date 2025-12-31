import { getTickets, GetTicketsResponse } from "@/services/chat/chat";
import useSWR from "swr";

interface UseChatTicketsParams {
  limit?: number;
  page?: number;
  search?: string;
}

const useChatTickets = ({ limit = 200, page = 1, search = "" }: UseChatTicketsParams = {}) => {
  const { data, isLoading, error, mutate } = useSWR<GetTicketsResponse>(
    `/whatsapp-tickets?limit=${limit}&page=${page}&search=${search}`,
    () => getTickets(limit, page, search),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true
    }
  );

  return {
    data: data?.data,
    pagination: data?.pagination,
    isLoading,
    error,
    mutate
  };
};

export default useChatTickets;
