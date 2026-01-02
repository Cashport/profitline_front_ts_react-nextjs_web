"use client";

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  Chat,
  Funnel,
  MagnifyingGlass,
  ChatCircleDots,
  DotsThreeVertical
} from "@phosphor-icons/react";

import useChatTickets from "@/hooks/useChatTickets";
import { useDebounce } from "@/hooks/useDeabouce";
import { auth } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSocket } from "@/context/ChatContext";
import { cn } from "@/utils/utils";

import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Separator } from "@/modules/chat/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { ScrollArea } from "@/modules/chat/ui/scroll-area";
import { Badge } from "@/modules/chat/ui/badge";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { type Conversation, formatRelativeTime } from "@/modules/chat/lib/mock-data";
import ChatThread from "./chat-thread";
import ChatDetails from "./chat-details";
import MassMessageSheet from "./mass-message-sheet";

import { ITicket } from "@/types/chat/IChat";
import "@/modules/chat/styles/chatStyles.css";
import TemplateDialog from "./template-dialog";
import SelectClientDialog from "./select-client-dialog";
import AddClientModal from "../components/contacts-tab-modal";
import { useToast } from "@/modules/chat/hooks/use-toast";
import {
  getTemplateMessages,
  getWhatsappClientContacts,
  getWhatsappClients,
  sendWhatsAppTemplateNew
} from "@/services/whatsapp/clients";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";

function riskColors(days: number) {
  if (days <= 0) return { bg: "#F7F7F7", text: "#141414", border: "#DDDDDD", label: "Al día" };
  if (days <= 7)
    return { bg: "#EAF6B1", text: "#141414", border: "#DDE78F", label: `${days} días` };
  if (days <= 30)
    return { bg: "#FDE68A", text: "#141414", border: "#FACC15", label: `${days} días` };
  return { bg: "#FCA5A5", text: "#141414", border: "#F87171", label: `${days} días` };
}

// Function to transform ITicket to Conversation format
function ticketToConversation(ticket: ITicket, unreadTicketsSet: Set<string>): Conversation {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateOverdueDays = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    id: ticket.id,
    customer: ticket.customer.name,
    customerId: ticket.customer.id,
    client_name: ticket.customer.clientName,
    phoneNumber: ticket.customer.phoneNumber,
    customerCashportUUID: ticket.customer.customerCashportUUID,
    initials: getInitials(ticket.customer.name),
    phone: ticket.customer.phoneNumber,
    email: ticket.agent?.email || "",
    document: "",
    segment: "",
    status: ticket.status === "OPEN" ? "Abierto" : "Cerrado",
    overdueDays: calculateOverdueDays(ticket.createdAt),
    lastMessage: ticket.lastMessage?.content || "",
    updatedAt: ticket.updatedAt,
    tags: ticket.tags ? [ticket.tags] : [],
    metrics: { totalVencido: 0, ultimoPago: "" },
    timeline: [],
    messages: [],
    hasUnreadUpdate: unreadTicketsSet.has(ticket.id),
    lastMessageAt: ticket.lastMessageAt
  };
}

type NewConversation = {
  stage: "selectClient" | "selectContact" | "confirm" | "completed";
  clientUUID: string;
  clientName: string;
  contactId: string;
  contactNumber: string;
  templateId: string;
};

export default function ChatInbox() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [activeTab, setActiveTab] = useState<"todos" | "abiertos" | "cerrados">("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [massOpen, setMassOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [page, setPage] = useState(1);
  const {
    data: ticketsData = [],
    pagination,
    isLoading: loading,
    mutate: mutateTickets
  } = useChatTickets({ page, search: debouncedQuery });
  const [unreadTickets, setUnreadTickets] = useState<Set<string>>(new Set());
  const [sendNewMessage, setSendNewMessage] = useState(false);
  const [sendConversation, setSendConversation] = useState<NewConversation | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [contacts, setContacts] = useState<
    { id: number; contact_name: string; contact_phone: string }[]
  >([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const { connect, subscribeToTicketUpdates, isConnected } = useSocket();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getWhatsappClients();
        const formatted = res.map((c) => ({ id: c.uuid, name: c.client_name }));
        setClients(formatted);
      } catch (error) {
        console.error("Error fetching WhatsApp clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    setContacts([]);
    if (sendConversation?.clientUUID) {
      const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
          const res = await getWhatsappClientContacts(sendConversation.clientUUID);
          setContacts(res);
        } catch (error) {
          console.error("Error fetching WhatsApp contacts:", error);
        } finally {
          setLoadingContacts(false);
        }
      };
      fetchContacts();
    }
  }, [sendConversation?.clientUUID]);

  useEffect(() => {
    // Esperamos a que Firebase Auth termine de inicializar
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (activeId && user?.uid) {
        connect({
          userId: user.uid
        });
      }
    });
    return () => unsubscribe();
  }, [activeId, connect]);

  // Use effect to subscribe to ticket updates and update ticketsData accordingly
  useEffect(() => {
    if (!isConnected) return;
    return subscribeToTicketUpdates((data) => {
      console.log("Ticket update received in ChatInbox:", data);

      mutateTickets(
        (currentData) => {
          if (!currentData) return currentData;
          // Actualizar el ticket correspondiente
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

          // Ordenar por lastMessageAt descendente (más reciente primero)
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

      // Si el ticket actualizado NO es el activo, marcarlo como no leído
      if (activeId !== data.ticketId) {
        setUnreadTickets((prev) => new Set(prev).add(data.ticketId));
      }
    });
  }, [isConnected, subscribeToTicketUpdates, activeId, mutateTickets]);

  // Set activeId to first ticket on initial load
  useEffect(() => {
    if (ticketsData && ticketsData.length > 0 && !activeId) {
      setActiveId(ticketsData[0].id);
    }
  }, [ticketsData, activeId]);

  // Convert tickets to conversations format for display
  const conversations = useMemo(() => {
    return ticketsData.map((ticket) => ticketToConversation(ticket, unreadTickets));
  }, [ticketsData, unreadTickets]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (activeTab === "todos") return true;
      if (activeTab === "abiertos") return c.status === "Abierto";
      return c.status === "Cerrado";
    });
  }, [conversations, activeTab]);

  const activeConversation = useMemo<Conversation | undefined>(
    () => filtered.find((c) => c.id === activeId) ?? filtered[0],
    [filtered, activeId]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b" style={{ borderColor: "#DDDDDD" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Chat className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Conversaciones</h1>
          <Badge className="rounded-full bg-[#F7F7F7] text-xs text-[#141414]" variant="secondary">
            WhatsApp
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="relative hidden md:block">
            <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, teléfono o mensaje..."
              className="w-[340px] bg-[#F7F7F7] pl-8"
              style={{ borderColor: "#DDDDDD" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <DotsThreeVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowAddClientModal(true)}
                className="cursor-pointer"
              >
                Agregar cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-2" style={{ borderColor: "#DDDDDD" }}>
            <Funnel className="h-4 w-4" />
            Filtrar
          </Button>
          <Button
            className="gap-2 text-[#141414]"
            style={{ backgroundColor: "#CBE71E" }}
            onClick={() => setSendNewMessage(true)}
          >
            Nuevo chat
          </Button>
        </div>
      </header>

      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12">
        <aside
          className="border-r md:col-span-3 overflow-hidden min-h-0 flex flex-col"
          style={{ borderColor: "#DDDDDD" }}
        >
          <div className="flex items-center gap-2 px-3 py-3 md:hidden">
            <div className="relative flex-1">
              <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="bg-[#F7F7F7] pl-8"
                style={{ borderColor: "#DDDDDD" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button size="icon" variant="outline" style={{ borderColor: "#DDDDDD" }}>
              <Funnel className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full px-3 pt-2"
          >
            <TabsList className="grid w-full grid-cols-3 bg-[#F7F7F7]">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="abiertos">Abiertos</TabsTrigger>
              <TabsTrigger value="cerrados">Cerrados</TabsTrigger>
            </TabsList>
          </Tabs>
          <Separator className="my-2" />
          <ScrollArea className="min-h-0 flex-1 pr-2">
            <ul className="px-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">Cargando tickets...</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-muted-foreground">No se encontraron tickets</div>
                </div>
              ) : (
                filtered.map((c) => {
                  const isActive = c.id === activeConversation?.id;
                  const isSelected = selectedIds.includes(c.id);
                  const risk = riskColors(c.overdueDays);
                  return (
                    <li
                      key={c.id}
                      className={cn(
                        "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-md px-3 py-3",
                        isActive ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
                      )}
                      onClick={() => {
                        setActiveId(c.id);
                        // Marcar como leído al abrir la conversación
                        setUnreadTickets((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(c.id);
                          return newSet;
                        });
                      }}
                    >
                      <Checkbox
                        className="absolute left-2 top-1/2 -translate-y-1/2"
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(c.id)}
                        aria-label={"Seleccionar chat de " + c.customer}
                      />
                      <Avatar className="ml-6 h-9 w-9 border" style={{ borderColor: "#DDDDDD" }}>
                        <AvatarFallback>{c.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex w-full items-baseline gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                            {c.client_name}
                          </p>
                          <span className="shrink-0 w-12 md:w-14 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {formatRelativeTime(c.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-[11px] font-normal w-fit">{c.customer}</p>
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-sm text-muted-foreground",
                              c.hasUnreadUpdate && "font-semibold text-[#141414]"
                            )}
                          >
                            {c.lastMessage}
                          </p>

                          {c.hasUnreadUpdate ? (
                            <ChatCircleDots
                              className="w-5 h-5 min-w-[20px] shrink-0"
                              color="#CBE71E"
                              weight="duotone"
                            />
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge
                            className={cn(
                              "h-5 rounded-full px-2 text-xs",
                              c.status === "Abierto"
                                ? "bg-[#141414] text-white"
                                : "bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]"
                            )}
                          >
                            {c.status}
                          </Badge>
                          <Badge
                            className="h-5 rounded-full px-2 text-xs"
                            style={{
                              backgroundColor: risk.bg,
                              color: risk.text,
                              border: `1px solid ${risk.border}`
                            }}
                          >
                            {c.overdueDays > 0 ? `Atraso: ${risk.label}` : "Sin atraso"}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </ScrollArea>
          {ticketsData.length > 0 && pagination && (
            <Pagination
              current={page}
              pageSize={pagination.limit}
              total={pagination.total}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
              size="small"
              className="py-2 flex justify-center border-t"
              style={{ borderColor: "#DDDDDD" }}
            />
          )}
        </aside>

        <section
          className={cn(detailsOpen ? "md:col-span-6" : "md:col-span-9", "min-h-0 flex flex-col")}
        >
          {activeConversation ? (
            <ChatThread
              key={activeConversation.id}
              conversation={activeConversation}
              onShowDetails={() => setDetailsOpen(true)}
              detailsOpen={detailsOpen}
              onOpenAddClientModal={() => setShowAddClientModal(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona un chat para ver la conversación
            </div>
          )}
        </section>

        <aside
          className={cn(
            "hidden border-l md:col-span-3 md:block min-h-0 flex flex-col",
            detailsOpen ? "md:block" : "md:hidden"
          )}
          style={{ borderColor: "#DDDDDD" }}
        >
          {activeConversation && (
            <ChatDetails conversation={activeConversation} onClose={() => setDetailsOpen(false)} />
          )}
        </aside>
      </div>

      <MassMessageSheet
        open={massOpen}
        onOpenChange={setMassOpen}
        selectedCount={selectedIds.length}
        onSend={(payload) => {
          console.log("Envío masivo simulado:", payload, "destinatarios:", selectedIds);
          setMassOpen(false);
        }}
      />
      <SelectClientDialog
        onConfirm={async () => {
          const contact = contacts.find(
            (c) => c.id.toString() === (sendConversation?.contactId || "")
          );
          if (!contact) return;

          const templateId = sendConversation?.templateId || "";
          let payload: any;

          if (templateId === "presentacion") {
            // Payload para "presentacion" - usa clientName y clientUUID como customerCashportUUID
            payload = {
              templateData: {
                components: [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: sendConversation?.clientName || ""
                      }
                    ]
                  }
                ]
              },
              phoneNumber: contact.contact_phone,
              templateId: "presentacion",
              senderId: "cmhv6mnla0003no0huiao1u63",
              name: sendConversation?.clientName || "",
              customerCashportUUID: sendConversation?.clientUUID || ""
            };
          } else {
            // Default: "estado_de_cuenta" (lógica existente)
            const result = await getTemplateMessages(
              sendConversation?.clientUUID || "",
              "template"
            );
            payload = {
              ...result,
              phoneNumber: contact.contact_phone,
              templateId: "estado_de_cuenta",
              senderId: "cmhv6mnla0003no0huiao1u63",
              name: contact.contact_name
            };
          }

          setIsSending(true);
          try {
            await sendWhatsAppTemplateNew(payload);
            setSendConversation(null);
            await mutateTickets();
          } catch (error) {
            toast({
              title: "Error enviando",
              description: "No se pudo enviar el mensaje de WhatsApp.",
              variant: "destructive"
            });
          } finally {
            setIsSending(false);
          }
        }}
        onOpenChange={() => setSendConversation(null)}
        open={!!sendConversation}
        clients={clients}
        onSelectClient={(clientUUID) => {
          const selectedClient = clients.find((c) => c.id === clientUUID);
          setSendConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              stage: "confirm",
              clientUUID,
              clientName: selectedClient?.name || "",
              contactId: "",
              contactNumber: ""
            };
          });
        }}
        onSelectContact={(contactId: string) => {
          console.log(contactId);
          setSendConversation((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              contactId
            };
          });
        }}
        isContactLoading={loadingContacts}
        isLoading={isSending}
        contacts={contacts.map((c) => ({ id: c.id.toString(), name: c.contact_name }))}
      />
      <TemplateDialog
        open={sendNewMessage}
        onOpenChange={setSendNewMessage}
        channel={"whatsapp"}
        ticketId={activeConversation ? activeConversation.id : ""}
        onUse={(payload) => {
          setSendNewMessage(false);
          setSendConversation({
            stage: "selectClient",
            clientUUID: "",
            clientName: "",
            contactId: "",
            contactNumber: "",
            templateId: payload.templateId
          });
        }}
      />
      <AddClientModal
        showAddClientModal={showAddClientModal}
        setShowAddClientModal={setShowAddClientModal}
        isActionLoading={false}
        initialName={activeConversation?.customer}
        initialPhone={activeConversation?.phone}
      />
    </div>
  );
}
