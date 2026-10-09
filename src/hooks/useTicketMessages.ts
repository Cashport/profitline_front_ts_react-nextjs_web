import { IChatData } from "@/types/chat/IChat";
import { getOneTicket } from "@/services/chat/chat";
import { useCallback, useRef, useState } from "react";
import useSWR from "swr";

interface UseTicketMessagesParams {
  ticketId: string;
  limit?: number;
}

const useTicketMessages = ({ ticketId, limit = 20 }: UseTicketMessagesParams) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const { data, isLoading, error, mutate } = useSWR<IChatData>(
    ticketId ? `/whatsapp-messages/ticket/${ticketId}?limit=${limit}` : null,
    () => getOneTicket(ticketId, limit, 1),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const hasMore = data ? data.pagination.page < data.pagination.pages : false;

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    if (!data || data.pagination.page >= data.pagination.pages) return;

    const nextPage = data.pagination.page + 1;
    loadingRef.current = true;
    setIsLoadingMore(true);
    try {
      const older = await getOneTicket(ticketId, limit, nextPage);
      await mutate((current) => {
        if (!current) return older;
        const seen = new Set(current.messages.map((m) => m.id));
        const newOlder = older.messages.filter((m) => !seen.has(m.id));
        return {
          messages: [...current.messages, ...newOlder],
          pagination: older.pagination
        };
      }, false);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [data, ticketId, limit, mutate]);

  return { data, isLoading, error, mutate, loadMore, hasMore, isLoadingMore };
};

export default useTicketMessages;
