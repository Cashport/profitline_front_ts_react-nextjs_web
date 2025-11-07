"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { ScrollArea } from "@/modules/chat/ui/scroll-area";
import { Separator } from "@/modules/chat/ui/separator";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Badge } from "@/modules/chat/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { Input } from "@/modules/chat/ui/input";
import type { Conversation, Message } from "@/modules/chat/lib/mock-data";
import { formatRelativeTime, conversationsMock } from "@/modules/chat/lib/mock-data";
import TemplateDialog from "./template-dialog";
import { Dialog, DialogContent } from "@/modules/chat/ui/dialog";
import { useToast } from "@/modules/chat/hooks/use-toast";
import { cn } from "@/utils/utils";
import {
  ArrowsOut,
  CaretDown,
  CodesandboxLogo,
  EnvelopeSimple,
  FileArrowDown,
  FileText,
  Microphone,
  Paperclip,
  PaperPlaneRight,
  Smiley,
  Square,
  X
} from "@phosphor-icons/react";

type FileItem = { url: string; name: string; size: number };

type Props = {
  conversation: Conversation;
  onSend?: (message: string) => void;
  onSendAudio?: (audioUrl: string) => void;
  onSendEmail?: (subject: string, body: string, files?: FileItem[], images?: string[]) => void;
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

export default function ChatThread({
  conversation,
  onSend,
  onSendAudio,
  onSendEmail,
  onShowDetails,
  detailsOpen
}: Props) {
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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.id]);

  useEffect(() => {
    // Cleanup ObjectURLs en unmount
    return () => {
      emailImages.forEach((i) => URL.revokeObjectURL(i.url));
      emailFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, text, preview_url: false })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Fallo en el envío");
      }
      onSend?.(text);
      setMessage("");
      toast({ title: "Mensaje enviado", description: "WhatsApp Cloud aceptó el mensaje." });
      requestAnimationFrame(() => {
        const el = viewportRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
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

    if (onSendEmail) {
      onSendEmail(s, b, files, images);
    } else {
      const conv = conversationsMock.find((c) => c.id === conversation.id);
      if (conv) {
        conv.messages.push({
          id: String(Date.now()),
          from: "agent",
          channel: "email",
          email: { subject: s, body: b },
          attachments: files,
          imageUrls: images,
          timestamp: new Date().toISOString()
        });
        conv.lastMessage = `Email: ${s}`;
        conv.updatedAt = new Date().toISOString();
      }
    }

    setSubject("");
    setBody("");
    cleanupEmailObjectUrls();
    setEmailImages([]);
    setEmailFiles([]);
    setChannel("whatsapp");
    requestAnimationFrame(() => {
      const el = viewportRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
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
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        onSendAudio?.(url);
        stream.getTracks().forEach((t) => t.stop());
        requestAnimationFrame(() => {
          const el = viewportRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
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

  function renderBubble(m: Message) {
    const mine = m.from === "agent";
    const wrapper = "max-w-[80%] md:max-w-[70%]";
    const bubble =
      "rounded-2xl border px-3 py-2 text-sm " +
      (mine
        ? "bg-[#141414] text-white border-[#141414]"
        : "bg-white text-[#141414] border-[#DDDDDD]");

    if (m.imageUrl) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble + " p-2"}>
              <button
                onClick={() => setPreviewImage(m.imageUrl!)}
                className="group relative block overflow-hidden rounded-lg"
                aria-label="Ver imagen"
              >
                <img
                  src={m.imageUrl || "/placeholder.svg"}
                  alt="Imagen enviada"
                  className="max-h-72 rounded-lg object-cover"
                />
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

    if (m.fileUrl) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble}>
              <a href={m.fileUrl} className="flex items-center gap-2 hover:underline" download>
                <FileArrowDown className="h-4 w-4" />
                <span className="font-medium">{m.fileName ?? "Archivo"}</span>
                <span className="text-xs opacity-80">· {formatBytes(m.fileSize)}</span>
              </a>
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    if (m.audioUrl) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble}>
              <audio controls src={m.audioUrl} className="w-full" aria-label="Nota de voz" />
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    if (m.email) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble + " p-3"}>
              <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                <EnvelopeSimple className="h-3.5 w-3.5" />
                <span>Correo</span>
              </div>
              <div className="font-semibold">{m.email.subject}</div>
              <div className="mt-2 whitespace-pre-wrap">{m.email.body}</div>

              {m.imageUrls && m.imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {m.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImage(url)}
                      className="group relative overflow-hidden rounded-md"
                      aria-label="Ver imagen adjunta"
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt="Imagen adjunta"
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 hidden rounded bg-black/40 p-1 text-white group-hover:block">
                        <ArrowsOut className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {m.attachments && m.attachments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {m.attachments.map((a, idx) => (
                    <a
                      key={idx}
                      href={a.url}
                      download
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <FileArrowDown className="h-4 w-4" />
                      <span className="font-medium">{a.name}</span>
                      <span className="text-xs opacity-80">· {formatBytes(a.size)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    if (m.template) {
      return (
        <div className={"flex " + (mine ? "justify-end" : "justify-start")}>
          <div className={wrapper}>
            <div className={bubble + " p-3"}>
              <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                <FileText className="h-3.5 w-3.5" />
                <span>{"Plantilla: " + m.template.name}</span>
              </div>
              <div className="whitespace-pre-wrap">{m.text ?? m.template.content ?? ""}</div>
            </div>
            <div className={"mt-1 text-[11px] " + (mine ? "text-right" : "text-left")}>
              {formatRelativeTime(m.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    // Texto por defecto
    return (
      <div className={"flex " + (m.from === "agent" ? "justify-end" : "justify-start")}>
        <div className={wrapper}>
          <div className={bubble}>{m.text}</div>
          <div className={"mt-1 text-[11px] " + (m.from === "agent" ? "text-right" : "text-left")}>
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
      <ScrollArea className="flex-1 min-h-0" ref={viewportRef}>
        <div className="space-y-6 px-4 py-6">
          {conversation.messages.map((m) => (
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
                        className="relative overflow-hidden rounded-md border"
                        style={{ borderColor: "#DDDDDD" }}
                      >
                        <img
                          src={img.url || "/placeholder.svg"}
                          alt={"Adjunto " + img.name}
                          className="h-20 w-full object-cover"
                        />
                        <button
                          onClick={() => removeEmailImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
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
        onUse={(payload) => {
          if (payload.channel === "email") {
            setSubject((prev) => (prev ? prev : payload.subject));
            setBody((prev) => (prev ? prev + "\n" + payload.body : payload.body));
          } else {
            setMessage((prev) => (prev ? prev + "\n" + payload.content : payload.content));
          }
        }}
      />

      {/* Image preview */}
      <Dialog open={!!previewImage} onOpenChange={(o) => !o && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          {previewImage && (
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Vista previa"
              className="max-h-[70dvh] w-auto rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
