import { useEffect, useMemo, useState } from "react";
import { Bell, CaretDown, MagnifyingGlass, Robot } from "@phosphor-icons/react";
import { Dropdown, MenuProps, Pagination } from "antd";
import { cn, formatChatDate } from "@/utils/utils";
import { Input } from "@/modules/chat/ui/input";
import { Separator } from "@/modules/chat/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { type Conversation } from "@/modules/chat/lib/mock-data";
import ChatActions from "@/modules/chat/components/chat-actions";
import { Scroll } from "@/components/ui/scroll";
import AddClientModal from "@/modules/chat/components/contacts-tab-modal";
import TemplateDialog from "@/modules/chat/components/template-dialog/template-dialog";
import SelectClientDialog from "@/modules/chat/components/select-client-dialog/select-client-dialog";

import useChatTickets from "@/hooks/useChatTickets";
import { useDebounce } from "@/hooks/useDeabouce";
import { useSocket } from "@/context/ChatContext";
import { useToast } from "@/modules/chat/hooks/use-toast";
import { IAddClientForm, ITicket } from "@/types/chat/IChat";
import { ticketToConversation } from "@/modules/chat/lib/ticketToConversation";
import { sendTemplate } from "@/services/chat/chat";

interface AllChatsProps {
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewChat: () => void; // opens MassMessageSheet in parent
}

export default function AllChats({
  activeConversation,
  onConversationSelect,
  onNewChat
}: AllChatsProps) {
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [addClientInitial, setAddClientInitial] = useState<{ name?: string; phone?: string }>({});
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [templateTarget, setTemplateTarget] = useState<
    { mode: "direct"; clientUuid: string; destinationNumber: string } | { mode: "newChat" } | null
  >(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const { toast } = useToast();
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
    isRead: activeTab === "abiertos" ? true : activeTab === "no-leidos" ? false : undefined,
    justOpen: activeTab === "abiertos" ? true : undefined
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

      if (activeConversation?.id !== data.ticketId && data.message.direction === "INBOUND") {
        setUnreadTickets((prev) => new Set(prev).add(data.ticketId));
      }
    });
  }, [isConnected, subscribeToTicketUpdates, activeConversation?.id, mutateTickets]);

  const conversations = useMemo(() => {
    return ticketsData
      .map((ticket) => ticketToConversation(ticket, unreadTickets))
      .sort((a, b) => Number(b.escalated) - Number(a.escalated));
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

  const handleAddClientSuccess = (data: IAddClientForm) => {
    const clientUuid = String(data.client.value);
    const callingCode = data.indicative.label.split(" ")[0];
    const destinationNumber = callingCode + data.phone;
    setTemplateTarget({ mode: "direct", clientUuid, destinationNumber });
  };

  const handleOnSelectTemplate = async (payload: {
    channel: "whatsapp";
    content: string;
    templateId: string;
  }) => {
    if (!templateTarget) return;

    if (templateTarget.mode === "newChat") {
      setTemplateTarget(null);
      setPendingTemplateId(payload.templateId);
    } else {
      setTemplateLoading(true);
      try {
        await sendTemplate({
          templateId: payload.templateId,
          clientUuid: templateTarget.clientUuid,
          destinationNumber: [templateTarget.destinationNumber]
        });
        setTemplateTarget(null);
        toast({ title: "Plantilla enviada exitosamente" });
      } catch {
        toast({ title: "Error al enviar la plantilla", variant: "destructive" });
      } finally {
        setTemplateLoading(false);
      }
    }
  };

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

  const handleAddClient = () => {
    if (selectedIds.length > 1) {
      toast({
        title: "Seleccione uno a la vez para esta acción",
        variant: "destructive"
      });
      return;
    }
    if (selectedIds.length === 1) {
      const conv = conversations.find((c) => c.id === selectedIds[0]);
      setAddClientInitial({
        name: conv?.customer,
        phone: conv?.phone
      });
    } else {
      setAddClientInitial({});
    }
    setShowAddClientModal(true);
  };

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
              {
                key: "add-client",
                label: "Agregar cliente",
                onClick: handleAddClient
              },
              {
                key: "new-chat",
                label: "Nuevo chat",
                onClick: () => setTemplateTarget({ mode: "newChat" })
              }
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
            autoComplete="off"
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
              console.log(c);
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
                    <div className="flex w-full items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1 min-w-0">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm font-semibold ${c.status === "CLOSED" ? "text-[#72737f]" : ""}`}
                        >
                          {c.status === "CLOSED"
                            ? `${c.client_name || ""} - Cerrado ⚠️ `
                            : `${c.client_name || ""}`}
                        </p>

                        {c.escalated && (
                          <span
                            title="Escalado"
                            className="inline-flex items-center justify-center rounded-full bg-black p-1 shrink-0"
                          >
                            <Bell size={14} weight="fill" className="text-cashport-orange" />
                          </span>
                        )}

                        {c.agent && (
                          <span
                            title="Agente asignado"
                            className="inline-flex items-center justify-center rounded-full p-1 shrink-0"
                          >
                            <Robot size={19} weight="fill" color="#8a8a8a" />
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 w-12 md:w-14 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatChatDate(c.lastMessageAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-normal w-fit">{c.customer}</p>

                      <div className="flex items-center gap-1 shrink-0">
                        {c.hasUnreadUpdate && c.countMessages > 0 ? (
                          <p
                            className="bg-primary text-black text-[12px] font-medium rounded-full w-[23px] h-[23px] flex items-center justify-center"
                            style={{ minWidth: 24, textAlign: "center" }}
                          >
                            {c.countMessages}
                          </p>
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

      <AddClientModal
        showAddClientModal={showAddClientModal}
        setShowAddClientModal={(show) => {
          if (!show) setAddClientInitial({});
          setShowAddClientModal(show);
        }}
        isActionLoading={false}
        initialName={addClientInitial.name}
        initialPhone={addClientInitial.phone}
        onSuccess={handleAddClientSuccess}
      />

      <TemplateDialog
        open={templateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setTemplateTarget(null);
        }}
        channel="whatsapp"
        loading={templateLoading}
        onUse={handleOnSelectTemplate}
      />

      <SelectClientDialog
        open={!!pendingTemplateId}
        templateId={pendingTemplateId ?? ""}
        onOpenChange={() => setPendingTemplateId(null)}
        onSuccess={() => mutateTickets()}
      />
    </aside>
  );
}
