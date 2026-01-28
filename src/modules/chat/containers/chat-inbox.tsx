"use client";

import { useEffect, useMemo, useState } from "react";

import useChatTickets from "@/hooks/useChatTickets";
import { useDebounce } from "@/hooks/useDeabouce";
import { auth } from "../../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useSocket } from "@/context/ChatContext";
import { cn } from "@/utils/utils";

import { type Conversation } from "@/modules/chat/lib/mock-data";
import ChatThread from "./chat-thread";
import ChatDetails from "./chat-details";
import MassMessageSheet from "./mass-message-sheet";
import ChatInboxHeader from "../components/chat-inbox-header";
import ChatConversationList from "../components/chat-conversation-list";

import { ITicket } from "@/types/chat/IChat";
import TemplateDialog from "./template-dialog";
import SelectClientDialog from "./select-client-dialog";
import AddClientModal from "../components/contacts-tab-modal";
import { useToast } from "@/modules/chat/hooks/use-toast";
import {
  getTemplateMessages,
  getWhatsappClientContacts,
  getWhatsappClients
} from "@/services/chat/clients";
import { sendWhatsAppTemplateNew } from "@/services/chat/chat";

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
    hasUnreadUpdate: ticket.lastViewedAt === null || unreadTicketsSet.has(ticket.id),
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
    <div className="flex flex-col h-full w-full bg-white text-[#141414] rounded-lg">
      <ChatInboxHeader
        query={query}
        onQueryChange={setQuery}
        onNewChat={() => setSendNewMessage(true)}
        onAddClient={() => setShowAddClientModal(true)}
        onFilter={() => {}}
      />

      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12">
        <ChatConversationList
          query={query}
          onQueryChange={setQuery}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          conversations={filtered}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          activeConversationId={activeConversation?.id}
          onConversationClick={setActiveId}
          unreadTicketIds={unreadTickets}
          onMarkAsRead={(id) => {
            setUnreadTickets((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }}
          page={page}
          onPageChange={setPage}
          pagination={pagination}
          onFilter={() => {}}
        />

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
              mutateTickets={mutateTickets}
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

          if (templateId === "presentacion" || templateId === "saludo") {
            // Payload para "presentacion" y "saludo" - usa clientName y clientUUID como customerCashportUUID
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
              templateId,
              senderId: "cmhv6mnla0003no0huiao1u63",
              name: sendConversation?.clientName || "",
              customerCashportUUID: sendConversation?.clientUUID || ""
            };
          } else {
            // Default: "estado_de_cuenta" (lógica existente)
            const result = await getTemplateMessages(
              sendConversation?.clientUUID || "",
              templateId
            );
            payload = {
              ...result,
              phoneNumber: contact.contact_phone,
              templateId: templateId,
              senderId: "cmhv6mnla0003no0huiao1u63",
              name: contact.contact_name,
              customerCashportUUID: sendConversation?.clientUUID || ""
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
