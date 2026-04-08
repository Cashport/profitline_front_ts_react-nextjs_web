"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { File, FileArrowDown, Paperclip, PaperPlaneTilt, X } from "@phosphor-icons/react";

import { sendAttahcment, sendMessage } from "@/services/chat/chat";
import { cn } from "@/utils/utils";
import useTicketMessages from "@/hooks/useTicketMessages";

import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Input } from "@/modules/chat/ui/input";

import type { Conversation } from "@/modules/chat/lib/mock-data";
import { IMessage } from "@/types/chat/IChat";
import { useToast } from "@/modules/chat/hooks/use-toast";
import { message as messageApi } from "antd";

type FileItem = { url: string; name: string; size: number };

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function normalizePhoneForWA(phone: string) {
  return phone.replace(/\D/g, "");
}

type ChatFooterProps = {
  channel: "whatsapp" | "email";
  conversation: Conversation;
  scrollToBottom: () => void;
  setTemplateOpen: (v: boolean) => void;
};

export default function ChatFooter({
  channel,
  conversation,
  scrollToBottom,
  setTemplateOpen
}: ChatFooterProps) {
  const { toast } = useToast();
  const { mutate } = useTicketMessages({ ticketId: conversation.id, page: 1 });

  // WhatsApp state
  const [message, setMessage] = useState("");
  const [isSendingWA, setIsSendingWA] = useState(false);
  const waFileInputRef = useRef<HTMLInputElement | null>(null);

  // Email state
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailImages, setEmailImages] = useState<FileItem[]>([]);
  const [emailFiles, setEmailFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize message textarea: grows up to 3 rows, then scrolls
  useEffect(() => {
    const el = messageTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight || "20", 10);
    const maxHeight = lineHeight * 3 + 16; // 3 rows + padding
    el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [message]);

  useEffect(() => {
    return () => {
      emailImages.forEach((i) => URL.revokeObjectURL(i.url));
      emailFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- WhatsApp handlers ---
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

      const tempMessage: IMessage = {
        id: `temp_${Date.now()}_${Math.random()}`,
        content: text,
        type: "TEXT",
        direction: "OUTBOUND",
        status: "SENT",
        timestamp: new Date().toISOString(),
        mediaUrl: null,
        metadata: {}
      };

      mutate((currentData) => {
        if (!currentData) return currentData;
        return { ...currentData, messages: [tempMessage, ...currentData.messages] };
      }, false);

      toast({ title: "Mensaje enviado", description: "WhatsApp Cloud aceptó el mensaje." });
      mutate();
      setTimeout(() => mutate(), 2000);
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

  async function onPickWAFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      await sendAttahcment({
        customerId: conversation.customerId,
        caption: file.name,
        file
      });
      messageApi.success("Archivo enviado correctamente");
      mutate();
      setTimeout(() => scrollToBottom(), 2000);
    } catch {
      messageApi.error("Error al enviar el archivo");
    }
  }

  // --- Email handlers ---
  function cleanupEmailObjectUrls() {
    emailImages.forEach((i) => URL.revokeObjectURL(i.url));
    emailFiles.forEach((f) => URL.revokeObjectURL(f.url));
  }

  function sendEmail() {
    const s = subject.trim();
    const b = body.trim();
    if (!s || !b) return;

    console.info("Sending email:", {
      subject: s,
      body: b,
      images: emailImages.map((i) => i.url),
      files: emailFiles.map((f) => ({ url: f.url, name: f.name, size: f.size }))
    });

    setSubject("");
    setBody("");
    cleanupEmailObjectUrls();
    setEmailImages([]);
    setEmailFiles([]);
    scrollToBottom();
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

  if (channel === "whatsapp") {
    return (
      <div className="flex items-end gap-2 p-3">
        <input ref={waFileInputRef} type="file" className="hidden" onChange={onPickWAFile} />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          aria-label="Plantillas"
          onClick={() => setTemplateOpen(true)}
        >
          <File className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground"
          aria-label="Adjuntar archivo"
          onClick={() => waFileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <textarea
          ref={messageTextareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 resize-none rounded-[20px] border border-[#DDDDDD] bg-white px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-0"
          style={{ overflowY: "hidden" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendWhatsapp();
            }
          }}
        />

        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#909090] text-white disabled:opacity-50"
          onClick={sendWhatsapp}
          disabled={isSendingWA || !message.trim()}
          aria-label="Enviar mensaje"
        >
          <PaperPlaneTilt className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Email composer
  return (
    <div className="p-3">
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
                    <span className="text-xs text-muted-foreground">· {formatBytes(f.size)}</span>
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
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPickEmailFiles}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label="Plantillas"
              onClick={() => setTemplateOpen(true)}
            >
              <File className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground"
              aria-label="Adjuntar archivos"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#909090] text-white disabled:opacity-50"
            onClick={sendEmail}
            disabled={!subject.trim() || !body.trim()}
            aria-label="Enviar correo"
          >
            <PaperPlaneTilt className="h-4 w-4" />
          </button>
        </div>

        {isDragging && (
          <div className="pointer-events-none -mt-2 rounded-md border border-dashed border-[#CBE71E] p-3 text-center text-xs text-muted-foreground">
            Suelta archivos o imágenes para adjuntar
          </div>
        )}
      </div>
    </div>
  );
}
