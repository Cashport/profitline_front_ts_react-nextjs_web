"use client";

import { useEffect, useMemo, useState } from "react";
import { Chat, Funnel, MagnifyingGlass, Users, ChatCircleDots } from "@phosphor-icons/react";

import { getTickets } from "@/services/chat/chat";
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

export default function ChatInbox() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "abiertos" | "cerrados">("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [massOpen, setMassOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [ticketsData, setTicketsData] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadTickets, setUnreadTickets] = useState<Set<string>>(new Set());

  const { connect, subscribeToTicketUpdates, isConnected } = useSocket();

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

  useEffect(() => {
    if (!isConnected) return;
    return subscribeToTicketUpdates((data) => {
      console.log("Ticket update received in ChatInbox:", data);

      // Actualizar el ticket correspondiente
      setTicketsData((prevTickets) => {
        return prevTickets.map((ticket) => {
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
      });

      // Si el ticket actualizado NO es el activo, marcarlo como no leído
      if (activeId !== data.ticketId) {
        setUnreadTickets((prev) => new Set(prev).add(data.ticketId));
      }
    });
  }, [isConnected, subscribeToTicketUpdates, activeId]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await getTickets();
        setTicketsData(res);
        if (res.length > 0) {
          setActiveId(res[0].id);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Convert tickets to conversations format for display
  const conversations = useMemo(() => {
    return ticketsData.map((ticket) => ticketToConversation(ticket, unreadTickets));
  }, [ticketsData, unreadTickets]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        c.customer.toLowerCase().includes(q) ||
        c.phone.includes(query) ||
        c.lastMessage.toLowerCase().includes(q);
      const matchesTab =
        activeTab === "todos"
          ? true
          : activeTab === "abiertos"
            ? c.status === "Abierto"
            : c.status === "Cerrado";
      return matchesQuery && matchesTab;
    });
  }, [conversations, query, activeTab]);

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
          <Button variant="outline" className="gap-2" style={{ borderColor: "#DDDDDD" }}>
            <Funnel className="h-4 w-4" />
            Filtrar
          </Button>
          <Button
            className="gap-2 text-[#141414]"
            style={{ backgroundColor: "#CBE71E" }}
            onClick={() => setMassOpen(true)}
          >
            <Users className="h-4 w-4" />
            Envío masivo
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
          <ScrollArea
            className="min-h-0 h-[calc(100dvh-154px)] md:h-[calc(100dvh-124px)] pr-2"
            style={{ display: "flex" }}
          >
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
    </div>
  );
}
