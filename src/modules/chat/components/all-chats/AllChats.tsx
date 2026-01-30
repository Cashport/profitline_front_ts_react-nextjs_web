import { useEffect, useMemo, useState } from "react";
import { CaretDown, ChatCircleDots, MagnifyingGlass } from "@phosphor-icons/react";
import { Dropdown, MenuProps, Pagination } from "antd";
import { cn, formatChatDate } from "@/utils/utils";
import { Input } from "@/modules/chat/ui/input";
import { Separator } from "@/modules/chat/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { type Conversation } from "@/modules/chat/lib/mock-data";
import ChatActions from "@/modules/chat/components/chat-actions";
import { Scroll } from "@/components/ui/scroll";

import useChatTickets from "@/hooks/useChatTickets";
import { useDebounce } from "@/hooks/useDeabouce";
import { useSocket } from "@/context/ChatContext";
import { ITicket } from "@/types/chat/IChat";
import { ticketToConversation } from "@/modules/chat/lib/ticketToConversation";

interface AllChatsProps {
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewChat: () => void;
  onAddClient: () => void;
  onAccountStatement: () => void;
}

export default function AllChats({
  activeConversation,
  onConversationSelect,
  onNewChat,
  onAddClient,
  onAccountStatement
}: AllChatsProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<"todos" | "abiertos" | "no-leidos">("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [unreadTickets, setUnreadTickets] = useState<Set<string>>(new Set());

  const {
    data: ticketsData = [],
    pagination,
    isLoading: loading,
    mutate: mutateTickets
  } = useChatTickets({
    page,
    search: debouncedQuery,
    isRead: activeTab === "abiertos" ? true : activeTab === "no-leidos" ? false : undefined
  });

  const { isConnected, subscribeToTicketUpdates } = useSocket();

  // Subscribe to ticket updates via socket
  useEffect(() => {
    if (!isConnected) return;
    return subscribeToTicketUpdates((data) => {
      mutateTickets(
        (currentData) => {
          if (!currentData) return currentData;
          const updatedTickets = currentData.data.map((ticket) => {
            if (ticket.id === data.ticketId) {
              return {
                ...ticket,
                lastMessage: {
                  ...ticket.lastMessage,
                  content: data.message.content,
                  timestamp: data.message.timestamp
                } as ITicket["lastMessage"],
                lastMessageAt: data.message.timestamp,
                updatedAt: data.message.timestamp
              };
            }
            return ticket;
          });

          const sortedTickets = updatedTickets.sort(
            (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );

          return {
            ...currentData,
            data: sortedTickets
          };
        },
        { revalidate: false }
      );

      if (activeConversation?.id !== data.ticketId) {
        setUnreadTickets((prev) => new Set(prev).add(data.ticketId));
      }
    });
  }, [isConnected, subscribeToTicketUpdates, activeConversation?.id, mutateTickets]);

  const conversations = useMemo(() => {
    return ticketsData.map((ticket) => ticketToConversation(ticket, unreadTickets));
  }, [ticketsData, unreadTickets]);

  // Auto-select first conversation when data loads and none is selected
  useEffect(() => {
    if (!activeConversation && conversations.length > 0 && !loading) {
      onConversationSelect(conversations[0]);
    }
  }, [conversations, activeConversation, loading, onConversationSelect]);

  // Reset page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeTab]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleConversationClick(conversation: Conversation) {
    setUnreadTickets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(conversation.id);
      return newSet;
    });
    onConversationSelect(conversation);
  }

  const items: MenuProps["items"] = [
    {
      label: <p>Marcar como no leido</p>,
      key: "0"
    }
  ];

  return (
    <aside
      className="border-r md:col-span-3 overflow-hidden min-h-0 flex flex-col"
      style={{ borderColor: "#DDDDDD" }}
    >
      <div
        className="flex items-center justify-between px-5 py-5 pb-0"
        style={{ borderColor: "#DDDDDD" }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 600 }}>Chats</h2>
        <div className="self-end">
          <ChatActions
            items={[
              { key: "send-batch", label: "Enviar masivo", onClick: onNewChat },
              { key: "account-statement", label: "Estado de cuenta", onClick: onAccountStatement },
              { key: "add-client", label: "Agregar cliente", onClick: onAddClient },
              { key: "new-chat", label: "Nuevo chat", onClick: onNewChat }
            ]}
          />
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, telefono o mensaje..."
            className="w-full bg-[#F7F7F7] pl-8"
            style={{ borderColor: "#DDDDDD" }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="w-full px-3 pt-2"
      >
        <TabsList className="grid w-full grid-cols-3 bg-[#F7F7F7]">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="abiertos">Abiertos</TabsTrigger>
          <TabsTrigger value="no-leidos">No leídos</TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator className="my-2" />

      <Scroll className="min-h-0 flex-1">
        <ul className="pl-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando tickets...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No se encontraron tickets</div>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversation?.id;
              const isSelected = selectedIds.includes(c.id);
              return (
                <li
                  key={c.id}
                  className={cn(
                    "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-md px-3 py-3 min-h-[80px]",
                    isActive ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
                  )}
                  onClick={() => handleConversationClick(c)}
                >
                  <Checkbox
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(c.id)}
                    aria-label={"Seleccionar chat de " + c.customer}
                  />
                  <div className="ml-6 min-w-0 flex-1">
                    <div className="flex w-full items-baseline gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {c.client_name}
                      </p>
                      <span className="shrink-0 w-12 md:w-14 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatChatDate(c.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-normal w-fit">{c.customer}</p>

                      <div className="flex items-center gap-1 shrink-0">
                        {c.hasUnreadUpdate ? (
                          <ChatCircleDots
                            className="w-5 h-5 min-w-[20px] shrink-0"
                            color="#CBE71E"
                            weight="duotone"
                          />
                        ) : null}
                        <Dropdown menu={{ items }} trigger={["click"]}>
                          <CaretDown
                            size={14}
                            className="hidden group-hover:inline transition-all"
                          />
                        </Dropdown>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "truncate text-sm text-muted-foreground",
                        c.hasUnreadUpdate && "font-semibold text-[#141414]"
                      )}
                    >
                      {c.lastMessage}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </Scroll>

      {conversations.length > 0 && pagination && (
        <Pagination
          current={page}
          pageSize={pagination.limit}
          total={pagination.total}
          onChange={(newPage) => setPage(newPage)}
          showSizeChanger={false}
          size="small"
          className="!py-2 flex justify-center border-t"
          style={{ borderColor: "#DDDDDD" }}
        />
      )}
    </aside>
  );
}
