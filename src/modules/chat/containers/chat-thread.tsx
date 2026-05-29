"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Image as AntImage } from "antd";
import { CaretDoubleLeft } from "@phosphor-icons/react";

import { getWhatsAppTemplates, markTicketAsRead, sendTemplate } from "@/services/chat/chat";

import { useSocket } from "@/context/ChatContext";
import useTicketMessages from "@/hooks/useTicketMessages";

import { ScrollArea } from "@/modules/chat/ui/scroll-area";
import { Separator } from "@/modules/chat/ui/separator";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";

import type { Conversation } from "@/modules/chat/lib/mock-data";
import { IMessage, IMessageSocket, IWhatsAppTemplate } from "@/types/chat/IChat";
import dayjs from "dayjs";
import { BubbleMessage } from "../components/bubble-message";
import { DateSeparator } from "../components/date-separator";
import { ChatFooter } from "../components/chat-footer";
import TemplateDialog from "../components/template-dialog/template-dialog";
import { useToast } from "@/modules/chat/hooks/use-toast";

type Props = {
  conversation: Conversation;
  mutateTickets: () => void;
  onShowDetails?: () => void;
  detailsOpen?: boolean;
};

export default function ChatThread({
  conversation,
  onShowDetails,
  detailsOpen,
  mutateTickets
}: Props) {
  const { toast } = useToast();
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const {
    data: ticketData,
    mutate,
    isLoading
  } = useTicketMessages({ ticketId: conversation.id, page: 1 });
  const ticketMessages = useMemo(() => ticketData?.messages?.slice().reverse() || [], [ticketData]);

  const messagesByDay = useMemo(() => {
    const map = new Map<string, IMessage[]>();
    for (const m of ticketMessages) {
      const day = dayjs(m.timestamp).format("YYYY-MM-DD");
      const group = map.get(day);
      if (group) group.push(m);
      else map.set(day, [m]);
    }
    return map;
  }, [ticketMessages]);

  const ticketSeparatorByMessageId = useMemo(() => {
    const map = new Map<string, string>();
    let lastTicketId: string | null = null;

    for (const m of ticketMessages) {
      const ticketId = m.ticket?.id || conversation.id;
      if (!ticketId || ticketId === lastTicketId) continue;

      const closedBy = m.ticket?.closedBy?.name;
      const closedAt = m.ticket?.closedAt ? dayjs(m.ticket.closedAt).format("DD/MM/YYYY") : null;
      const isClosed = m.ticket?.status === "CLOSED";

      const label = isClosed
        ? `Ticket "${m.ticket?.subject || ""}" - Cerrado${closedBy ? ` por ${closedBy}` : ""}${closedAt ? ` ${closedAt}` : ""}`
        : `Ticket "${m.ticket?.subject || ""}" - Abierto`;

      map.set(m.id, label);
      lastTicketId = ticketId;
    }

    return map;
  }, [ticketMessages, conversation.id]);

  const messagesByWaId = useMemo(() => {
    const map = new Map<string, IMessage>();
    for (const m of ticketMessages) {
      const waId = m.metadata?.whatsapp_message_id;
      if (waId) map.set(waId, m);
    }
    return map;
  }, [ticketMessages]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [waTemplates, setWaTemplates] = useState<IWhatsAppTemplate[]>([]);

  // Memoized template lookup map for O(1) access
  const templateMap = useMemo(() => {
    const map = new Map<string, IWhatsAppTemplate>();
    waTemplates.forEach((t) => {
      map.set(t.id, t);
      map.set(t.name, t);
    });
    return map;
  }, [waTemplates]);

  const { connectTicketRoom, subscribeToMessages, desubscribeTicketRoom, isConnected } =
    useSocket();

  useEffect(() => {
    // Connect to current ticket room and subscribe to messages
    if (!conversation.id || !isConnected) return;
    connectTicketRoom(conversation.id);
    subscribeToMessages((msg: IMessageSocket) => {
      // Transform socket message to IMessage format
      const newMessage: IMessage = {
        id: msg.id,
        content: msg.content,
        type: msg.type,
        direction: msg.direction,
        status: msg.status as "DELIVERED" | "SENT" | "FAILED" | "READ",
        timestamp: msg.timestamp,
        mediaUrl: msg.mediaUrl,
        templateName: msg.templateName ?? undefined,
        templateData: msg.templateData ?? undefined,
        metadata: msg.metadata
      };

      // Update the SWR cache by adding the new message only if it doesn't exist
      let isNew = true;
      mutate((currentData) => {
        if (!currentData) return currentData;
        if (currentData.messages.some((m) => m.id === newMessage.id)) {
          isNew = false;
          return currentData; // Message already exists, do not add
        }

        // Check if message with same ID already exists
        const messageExists = currentData.messages.some(
          (existingMsg) => existingMsg.id === newMessage.id
        );

        if (messageExists) {
          console.info("Message with ID already exists, skipping:", newMessage.id);
          return currentData;
        }

        return {
          ...currentData,
          messages: [newMessage, ...currentData.messages]
        };
      }, false);

      // Auto-scroll when new messages arrive via socket just if they are new
      if (isNew) setTimeout(scrollToBottom, 100);
    });

    // Cleanup function: runs when conversation.id changes or component unmounts
    // This ensures we unsubscribe from the previous room before connecting to the new one
    return () => {
      desubscribeTicketRoom(conversation.id);
    };
  }, [conversation.id, mutate, isConnected]);

  // Mark ticket as read on mount
  useEffect(() => {
    if (!conversation.id) return;
    const markAsRead = async () => {
      try {
        await markTicketAsRead(conversation.id);
        mutateTickets();
      } catch {
        console.error("Error marking ticket as read");
      }
    };

    markAsRead();
  }, [conversation.id]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (!isLoading && ticketMessages.length > 0) {
      scrollToBottom();
    }
  }, [conversation.id, isLoading, ticketMessages.length, waTemplates.length]);

  useEffect(() => {
    if (channel === "whatsapp") {
      getWhatsAppTemplates()
        .then((res) => {
          setWaTemplates(res);
        })
        .catch((err) => console.error("Error cargando plantillas:", err));
    }
  }, [channel]);

  const handleSendTemplate = async (templateId: string) => {
    if (!conversation.customerCashportUUID || !conversation.phoneNumber) {
      toast({
        title: "Datos insuficientes",
        description: "No se pudo enviar la plantilla porque faltan datos del cliente.",
        variant: "destructive"
      });
      return;
    }
    try {
      await sendTemplate({
        templateId,
        clientUuid: conversation.customerCashportUUID,
        destinationNumber: [conversation.phoneNumber]
      });
      setTemplateOpen(false);
      mutate();
      toast({
        title: "Plantilla enviada",
        description: "La plantilla de WhatsApp fue enviada exitosamente."
      });
      scrollToBottom();
    } catch (error) {
      toast({
        title: "Error al enviar",
        description:
          error instanceof Error ? error.message : "No se pudo enviar la plantilla de WhatsApp.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "#DDDDDD" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-9 w-9 border" style={{ borderColor: "#DDDDDD" }}>
            <AvatarFallback>{conversation.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">
                {conversation.client_name ? conversation.client_name : conversation.customer}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {channel === "whatsapp"
                ? `${conversation.phone} - ${conversation.customer}`
                : conversation.email ?? "sin correo"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
            <TabsList className="grid grid-cols-2 bg-[#F7F7F7]">
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="email">Correo</TabsTrigger>
            </TabsList>
          </Tabs>

          {!detailsOpen ? (
            <button onClick={() => onShowDetails?.()} aria-label="Ocultar información del cliente">
              <CaretDoubleLeft size={20} />
            </button>
          ) : null}
        </div>
      </div>

      {/* History */}
      <ScrollArea className="flex-1 min-h-0" viewportRef={viewportRef}>
        <div className="px-4 py-6">
          {Array.from(messagesByDay.entries()).map(([day, messages]) => (
            <div key={`group-${day}`} className="space-y-6">
              <DateSeparator date={messages[0].timestamp} />
              {messages.map((m) => (
                <div key={m.id} className="space-y-3">
                  {ticketSeparatorByMessageId.has(m.id) ? (
                    <div className="my-2 flex items-center gap-3 text-[13px] text-[#62687A]">
                      <div className="h-px flex-1 bg-[#D6D8DE]" />
                      <span className="whitespace-nowrap">{ticketSeparatorByMessageId.get(m.id)}</span>
                      <div className="h-px flex-1 bg-[#D6D8DE]" />
                    </div>
                  ) : null}
                  <BubbleMessage
                    message={m}
                    customerName={conversation.customer}
                    templateMap={templateMap}
                    messagesByWaId={messagesByWaId}
                    onPreviewImage={setPreviewImage}
                    onScrollToBottom={scrollToBottom}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator style={{ backgroundColor: "#DDDDDD" }} />

      {/* Composer */}
      <ChatFooter
        channel={channel}
        conversation={conversation}
        scrollToBottom={scrollToBottom}
        setTemplateOpen={setTemplateOpen}
      />

      {/* Template dialog (channel-aware) */}
      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        channel={channel}
        loading={templateLoading}
        onUse={async (payload: { channel: "whatsapp"; content: string; templateId: string }) => {
          setTemplateLoading(true);
          try {
            await handleSendTemplate(payload.templateId);
          } finally {
            setTemplateLoading(false);
          }
        }}
      />

      {/* Image preview (Ant Design - supports zoom, rotate, flip) */}
      {previewImage && (
        <AntImage
          style={{ display: "none" }}
          src={previewImage}
          preview={{
            visible: true,
            src: previewImage,
            onVisibleChange: (visible) => {
              if (!visible) setPreviewImage(null);
            }
          }}
        />
      )}
    </div>
  );
}
