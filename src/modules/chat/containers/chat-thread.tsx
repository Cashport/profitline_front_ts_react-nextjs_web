"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import {
  ArrowsOut,
  CaretDown,
  CodesandboxLogo,
  FileArrowDown,
  Microphone,
  Paperclip,
  PaperPlaneRight,
  Smiley,
  Square,
  X
} from "@phosphor-icons/react";

import { getWhatsAppTemplates, sendMessage, sendWhatsAppTemplate } from "@/services/chat/chat";

import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { ScrollArea } from "@/modules/chat/ui/scroll-area";
import { Separator } from "@/modules/chat/ui/separator";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Badge } from "@/modules/chat/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { Input } from "@/modules/chat/ui/input";
import type { Conversation } from "@/modules/chat/lib/mock-data";
import { formatRelativeTime } from "@/modules/chat/lib/mock-data";
import { IMessage, IMessageSocket, IWhatsAppTemplate } from "@/types/chat/IChat";
import TemplateDialog from "./template-dialog";
import { Dialog, DialogContent } from "@/modules/chat/ui/dialog";
import { useToast } from "@/modules/chat/hooks/use-toast";

import { cn } from "@/utils/utils";
import { useSocket } from "@/context/ChatContext";
import useTicketMessages from "@/hooks/useTicketMessages";
import { getPayloadByTicket } from "@/services/clients/clients";

type FileItem = { url: string; name: string; size: number };

type Props = {
  conversation: Conversation;
  onShowDetails?: () => void;
  detailsOpen?: boolean;
};

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function normalizePhoneForWA(phone: string) {
  // WhatsApp Cloud espera el número en formato internacional sin símbolos, ej: 51993346829
  return phone.replace(/\D/g, "");
}

export default function ChatThread({ conversation, onShowDetails, detailsOpen }: Props) {
  const { toast } = useToast();
  const [channel, setChannel] = useState<"whatsapp" | "email">("whatsapp");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailImages, setEmailImages] = useState<FileItem[]>([]);
  const [emailFiles, setEmailFiles] = useState<FileItem[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const {
    data: ticketData,
    mutate,
    isLoading
  } = useTicketMessages({ ticketId: conversation.id, page: 1 });
  const ticketMessages = useMemo(
    () => ticketData?.messages?.slice().reverse() || [],
    [ticketData?.messages]
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [waTemplates, setWaTemplates] = useState<IWhatsAppTemplate[]>([]);

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
        mediaUrl: msg.mediaUrl
      };

      // Update the SWR cache by adding the new message only if it doesn't exist
      mutate((currentData) => {
        if (!currentData) return currentData;

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

      // Auto-scroll when new messages arrive via socket
      setTimeout(scrollToBottom, 100);
    });

    // Cleanup function: runs when conversation.id changes or component unmounts
    // This ensures we unsubscribe from the previous room before connecting to the new one
    return () => {
      desubscribeTicketRoom(conversation.id);
    };
  }, [conversation.id, mutate, isConnected]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (!isLoading && ticketMessages.length > 0) {
      scrollToBottom();
    }
  }, [conversation.id, isLoading, ticketMessages.length, waTemplates.length]);

  useEffect(() => {
    // Cleanup ObjectURLs en unmount
    return () => {
      emailImages.forEach((i) => URL.revokeObjectURL(i.url));
      emailFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (channel === "whatsapp") {
      getWhatsAppTemplates()
        .then((res) => {
          console.log("Templates cargadas:", res);
          setWaTemplates(res);
        })
        .catch((err) => console.error("Error cargando plantillas:", err));
    }
  }, [channel]);

  async function sendWhatsapp() {
    const text = message.trim();
    if (!text) return;
    const to = normalizePhoneForWA(conversation.phone || "");
    if (!to) {
      toast({
        title: "No hay número",
        description: "Este contacto no tiene teléfono válido.",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsSendingWA(true);
      await sendMessage(conversation.customerId, text);
      setMessage("");

      // Create a temporary message for immediate UI feedback
      const tempMessage: IMessage = {
        id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID until we get the real one from socket
        content: text,
        type: "TEXT",
        direction: "OUTBOUND",
        status: "SENT",
        timestamp: new Date().toISOString(),
        mediaUrl: null
      };

      // Add the sent message immediately to ticketMessages (at beginning of array since we reverse it)
      mutate((currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          messages: [tempMessage, ...currentData.messages]
        };
      }, false);

      toast({ title: "Mensaje enviado", description: "WhatsApp Cloud aceptó el mensaje." });
      scrollToBottom();
    } catch (err: any) {
      toast({
        title: "Error al enviar",
        description: err?.message || "No se pudo enviar por WhatsApp Cloud.",
        variant: "destructive"
      });
    } finally {
      setIsSendingWA(false);
    }
  }

  function cleanupEmailObjectUrls() {
    emailImages.forEach((i) => URL.revokeObjectURL(i.url));
    emailFiles.forEach((f) => URL.revokeObjectURL(f.url));
  }

  function sendEmail() {
    const s = subject.trim();
    const b = body.trim();
    if (!s || !b) return;
    const images = emailImages.map((i) => i.url);
    const files = emailFiles.map((f) => ({ url: f.url, name: f.name, size: f.size }));

    console.info("Sending email:", { subject: s, body: b, images, files });

    setSubject("");
    setBody("");
    cleanupEmailObjectUrls();
    setEmailImages([]);
    setEmailFiles([]);
    setChannel("whatsapp");
    scrollToBottom();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        //const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        //const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        scrollToBottom();
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordSecs(0);
      timerRef.current = window.setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } catch {
      alert("No se pudo acceder al micrófono. Verifica permisos y HTTPS.");
    }
  }
  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }

  function onPickEmailImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const add = files
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, size: f.size }));
    setEmailImages((prev) => [...prev, ...add]);
    e.target.value = "";
  }

  function onPickEmailFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const add = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name, size: f.size }));
    setEmailFiles((prev) => [...prev, ...add]);
    e.target.value = "";
  }

  function onDropEmail(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length === 0) return;
    const imgs = files
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, size: f.size }));
    const others = files
      .filter((f) => !f.type.startsWith("image/"))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, size: f.size }));
    setEmailImages((prev) => [...prev, ...imgs]);
    setEmailFiles((prev) => [...prev, ...others]);
  }

  function removeEmailImage(idx: number) {
    setEmailImages((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }
  function removeEmailFile(idx: number) {
    setEmailFiles((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  }

  function formatWhatsAppText(text: string): string {
    if (!text) return "";

    return text
      .replace(/_\*(.*?)\*_/g, "<b><i>$1</i></b>")
      .replace(/\*(.*?)\*/g, "<b>$1</b>")
      .replace(/_(.*?)_/g, "<i>$1</i>")
      .replace(/~(.*?)~/g, "<s>$1</s>")
      .replace(/```(.*?)```/g, "<code>$1</code>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br/>");
  }

  function renderBubble(m: IMessage) {
    const mine = m.direction === "OUTBOUND";
    const status = m.status;
    const wrapper = "max-w-[80%] md:max-w-[70%]";
    const bubble =
      "rounded-2xl border px-3 py-2 text-sm " +
      (mine
        ? "bg-[#141414] text-white border-[#141414]"
        : "bg-white text-[#141414] border-[#DDDDDD]");

    if ((m.type === "IMAGE" || m.type === "STICKER") && m.mediaUrl) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble + " p-2"}>
              <button
                onClick={() => setPreviewImage(m.mediaUrl!)}
                className="group relative block overflow-hidden rounded-lg"
                aria-label="Ver imagen"
              >
                <div className="relative w-full max-h-72 aspect-video">
                  <Image
                    style={{ position: "relative" }}
                    src={m.mediaUrl || "/placeholder.svg"}
                    alt="Imagen enviada"
                    fill
                    unoptimized
                    className="rounded-lg object-cover"
                    onLoad={scrollToBottom}
                  />
                </div>
                <div className="absolute bottom-1 right-1 hidden rounded bg-black/40 p-1 text-white group-hover:block">
                  <ArrowsOut className="h-4 w-4" />
                </div>
              </button>
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    if (m.type === "DOCUMENT" && m.mediaUrl) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble + " p-3"}>
              <button
                onClick={() => window.open(m.mediaUrl!, "_blank")}
                className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                aria-label="Abrir documento"
              >
                <div className="rounded-lg bg-[#F7F7F7] p-3">
                  <FileArrowDown className="h-6 w-6 text-[#141414]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.content || "Documento"}</div>
                  <div className="text-xs text-muted-foreground">Haz clic para abrir</div>
                </div>
              </button>
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    if (m.type === "TEMPLATE") {
      let parsedData: any = null;
      try {
        parsedData =
          typeof m.templateData === "string" ? JSON.parse(m.templateData) : m.templateData;
      } catch {
        parsedData = null;
      }

      const template = waTemplates.find((t) => t.name === m.templateName);
      if (!template) {
        return (
          <div className="text-red-500">Plantilla &quot;{m.templateName}&quot; no encontrada</div>
        );
      }

      const templateComponents = template.components;
      const bodyComponent = templateComponents.find((c: any) => c.type === "BODY");
      const buttonComponent = templateComponents.find(
        (c: any) => c.type === "BUTTON" && c.sub_type === "URL"
      );

      // Renderizamos los parámetros reales del mensaje
      const bodyParams =
        parsedData?.components?.find((c: any) => c.type === "body")?.parameters || [];
      let bodyText = bodyComponent?.text || "";

      bodyParams.forEach((p: any, i: number) => {
        bodyText = bodyText.replace(`{{${i + 1}}}`, p.text || "");
      });

      const buttonParam = parsedData?.components?.find((c: any) => c.type === "button")
        ?.parameters?.[0]?.text;
      const buttonText = buttonParam || null;

      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className="max-w-[80%] rounded-lg bg-[#F7F7F7] p-3">
            <div
              className="text-sm text-[#141414] whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: formatWhatsAppText(bodyText) }}
            />

            {buttonText && (
              <a
                href={`http://cashport.ai/mobile?token=${encodeURIComponent(buttonText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-lg bg-[#CBE71E] px-3 py-1 text-xs font-semibold text-[#141414] hover:opacity-90"
              >
                Ver detalle
              </a>
            )}
          </div>
        </div>
      );
    }

    // Texto por defecto
    return (
      <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
        <div className={wrapper}>
          <div className="flex items-center gap-1">
            <div className={bubble}>{m.content}</div>
            {mine && status === "DELIVERED" && (
              <div className="text-[10px] text-muted-foreground self-end">✓</div>
            )}
            {mine && status === "PENDING" && (
              <div className="text-[10px] text-muted-foreground self-end">⧗</div>
            )}
            {mine && status === "READ" && (
              <div className="text-[10px] self-end text-green-500">✓✓</div>
            )}
            {mine && status === "FAILED" && <div className="text-[20px] text-red-500">!</div>}
          </div>
          <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
            {formatRelativeTime(m.timestamp)}
          </div>
        </div>
      </div>
    );
  }

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
              <p className="truncate text-sm font-semibold">{conversation.customer}</p>
              <Badge className="rounded-full bg-[#141414] px-2 py-0.5 text-xs text-white">
                {conversation.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {channel === "whatsapp" ? conversation.phone : conversation.email ?? "sin correo"}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            style={{ borderColor: "#DDDDDD" }}
            onClick={() => onShowDetails?.()}
          >
            {detailsOpen ? "Ver más" : "Mostrar info"}
            <CaretDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* History */}
      <ScrollArea className="flex-1 min-h-0" viewportRef={viewportRef}>
        <div className="space-y-6 px-4 py-6">
          {ticketMessages.map((m) => (
            <div key={m.id}>{renderBubble(m)}</div>
          ))}
        </div>
      </ScrollArea>

      <Separator style={{ backgroundColor: "#DDDDDD" }} />

      {/* Composer */}
      <div className="flex flex-col gap-2 p-3">
        {channel === "whatsapp" ? (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje para WhatsApp..."
                className="min-h-[72px] resize-none border-[#DDDDDD] bg-[#F7F7F7]"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="Adjuntar archivo"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="Adjuntar imagen"
                  >
                    <CodesandboxLogo className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="Insertar emoji"
                  >
                    <Smiley className="h-4 w-4" />
                  </Button>
                  {!recording ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      aria-label="Grabar nota de voz"
                      onClick={startRecording}
                    >
                      <Microphone className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1 px-2"
                      onClick={stopRecording}
                      aria-label="Detener grabación"
                    >
                      <Square className="h-4 w-4" />
                      {recordSecs}s
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    style={{ borderColor: "#DDDDDD" }}
                    onClick={() => setTemplateOpen(true)}
                  >
                    Plantillas
                  </Button>
                  <Button
                    className="gap-2 text-[#141414]"
                    style={{ backgroundColor: "#CBE71E" }}
                    onClick={sendWhatsapp}
                    disabled={isSendingWA || !message.trim()}
                  >
                    {isSendingWA ? "Enviando..." : "Enviar"}
                    <PaperPlaneRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Email composer con drag-and-drop y eliminación de adjuntos
          <div
            className={cn(
              "space-y-2 rounded-md",
              isDragging ? "outline outline-2 outline-dashed outline-[#CBE71E]" : "outline-none"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={onDropEmail}
          >
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del correo"
              className="bg-[#F7F7F7]"
              style={{ borderColor: "#DDDDDD" }}
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Escribe el cuerpo del correo..."
              className="min-h-[140px] bg-[#F7F7F7]"
              style={{ borderColor: "#DDDDDD" }}
            />

            {(emailImages.length > 0 || emailFiles.length > 0) && (
              <div className="rounded-md border p-2" style={{ borderColor: "#DDDDDD" }}>
                {emailImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {emailImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden rounded-md border h-20"
                        style={{ borderColor: "#DDDDDD" }}
                      >
                        <Image
                          src={img.url || "/placeholder.svg"}
                          alt={"Adjunto " + img.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeEmailImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white z-10"
                          aria-label={"Quitar imagen " + img.name}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {emailFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {emailFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <FileArrowDown className="h-4 w-4" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          · {formatBytes(f.size)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto h-7 w-7 text-muted-foreground"
                          aria-label={"Quitar adjunto " + f.name}
                          onClick={() => removeEmailFile(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onPickEmailImages}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onPickEmailFiles}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="Adjuntar imágenes"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <CodesandboxLogo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="Adjuntar archivos"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  style={{ borderColor: "#DDDDDD" }}
                  onClick={() => setTemplateOpen(true)}
                >
                  Plantillas
                </Button>
                <Button
                  className="gap-2 text-[#141414]"
                  style={{ backgroundColor: "#CBE71E" }}
                  onClick={sendEmail}
                  disabled={!subject.trim() || !body.trim()}
                >
                  Enviar correo
                  <PaperPlaneRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {isDragging && (
              <div className="pointer-events-none -mt-2 rounded-md border border-dashed border-[#CBE71E] p-3 text-center text-xs text-muted-foreground">
                Suelta archivos o imágenes para adjuntar
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template dialog (channel-aware) */}
      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        channel={channel}
        ticketId={conversation.id}
        onUse={async () => {
          try {
            console.log("ticketid", conversation.id);
            const templatePayload = await getPayloadByTicket(conversation.id);
            console.log("Payload generado:", templatePayload);

            if (!templatePayload) {
              toast({
                title: "Error",
                description: "No se pudo generar el payload para la plantilla.",
                variant: "destructive"
              });
              return;
            }

            await sendWhatsAppTemplate(templatePayload);

            // Crear un mensaje temporal para feedback visual inmediato
            const tempMessage: IMessage = {
              id: `temp_template_${Date.now()}_${Math.random()}`,
              content: "",
              type: "TEMPLATE",
              direction: "OUTBOUND",
              status: "SENT",
              timestamp: new Date().toISOString(),
              mediaUrl: null,
              templateName: templatePayload.template || "estado_de_cuenta",
              templateData: templatePayload.components
                ? JSON.stringify({ components: templatePayload.components })
                : undefined
            };

            // Añadir el mensaje al cache de SWR
            mutate((currentData) => {
              if (!currentData) return currentData;
              return {
                ...currentData,
                messages: [tempMessage, ...currentData.messages]
              };
            }, false);

            setTemplateOpen(false);
            toast({
              title: "Plantilla enviada",
              description: "La plantilla de WhatsApp fue enviada exitosamente."
            });
            scrollToBottom();
          } catch (error) {
            console.error("Error al enviar la plantilla:", error);
            toast({
              title: "Error al enviar",
              description: "No se pudo enviar la plantilla de WhatsApp.",
              variant: "destructive"
            });
          }
        }}
      />

      {/* Image preview */}
      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <div className="relative w-full h-[70dvh]">
              <Image
                src={previewImage || "/placeholder.svg"}
                alt="Vista previa"
                fill
                unoptimized
                className="rounded-xl object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
