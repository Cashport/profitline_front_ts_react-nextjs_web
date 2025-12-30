import { getTickets, GetTicketsResponse } from "@/services/chat/chat";
import useSWR from "swr";

interface UseChatTicketsParams {
  limit?: number;
  page?: number;
}

const useChatTickets = ({ limit = 20, page = 1 }: UseChatTicketsParams = {}) => {
  const { data, isLoading, error, mutate } = useSWR<GetTicketsResponse>(
    `/whatsapp-tickets?limit=${limit}&page=${page}`,
    () => getTickets(limit, page),
    {
      refreshInterval: 10000,
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
