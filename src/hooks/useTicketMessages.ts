import { IChatData } from "@/types/chat/IChat";
import { getOneTicket } from "@/services/chat/chat";
import useSWR from "swr";

interface UseTicketMessagesParams {
  ticketId: string;
  limit?: number;
  page?: number;
}

const useTicketMessages = ({ ticketId, limit = 20, page }: UseTicketMessagesParams) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (page !== undefined) {
    params.append('page', page.toString());
  }
  
  const { data, isLoading, error, mutate } = useSWR<IChatData>(
    `/whatsapp-messages/ticket/${ticketId}?${params.toString()}`,
    () => getOneTicket(ticketId, limit, page)
  );

  return { data, isLoading, error, mutate };
};

export default useTicketMessages;