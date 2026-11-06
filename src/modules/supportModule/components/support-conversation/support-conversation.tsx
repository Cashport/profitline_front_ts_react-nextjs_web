"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input } from "antd";
import { Lock, Paperclip, Sparkles, X } from "lucide-react";

import { useMessageApi } from "@/context/MessageContext";
import { downloadSupportAttachment, sendSupportMessage } from "@/services/support/support";
import type { ISupportDetail, ISupportEvent, SupportStatus } from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import { STATUS_META, formatBytes, formatDate, statusLabel } from "../../utils/support-format";
import MessageBody from "./message-body";

const EVENT_TEXT: Record<string, string> = {
  CREATED: "creó el ticket",
  ASSIGNED: "asignó a",
  REASSIGNED: "reasignó",
  STATUS_CHANGED: "cambió el estado",
  REOPENED: "reabrió el ticket",
  CONFIRMED: "confirmó la solución",
  ATTENTION_BREACHED: "Se venció el ANS de atención",
  RESOLUTION_BREACHED: "Se venció el ANS de solución"
};

function SystemLine({ event, asAgent }: { event: ISupportEvent; asAgent: boolean }) {
  const m = (event.meta ?? {}) as {
    from?: SupportStatus | number;
    to?: SupportStatus | number;
    from_name?: string | null;
    to_name?: string | null;
    source?: string;
  };
  const name = event.created_by?.name ?? (event.created_by ? "—" : "Sistema");
  const code = event.event_code ?? "";
  const breached = code.endsWith("_BREACHED");
  let detail: React.ReactNode = null;
  if (code === "STATUS_CHANGED" && typeof m.to === "string") {
    detail = (
      <span className="text-cp-ink-3">
        {" "}
        {statusLabel(m.from as SupportStatus, asAgent)} →{" "}
        {statusLabel(m.to as SupportStatus, asAgent)}
      </span>
    );
  } else if (code === "REASSIGNED") {
    detail = (
      <span className="text-cp-ink-3">
        {" "}
        {m.from_name ?? "—"} → {m.to_name ?? "—"}
      </span>
    );
  } else if (code === "ASSIGNED") {
    detail = <span className="text-cp-ink-3"> {m.to_name ?? "soporte"}</span>;
  }
  return (
    <li className={cn("text-[13px] text-cp-ink-2", breached && "text-cp-red")}>
      {breached ? (
        <b className="font-semibold">{EVENT_TEXT[code]}</b>
      ) : (
        <>
          <b className="font-semibold text-cp-ink">{name}</b>{" "}
          {EVENT_TEXT[code] ?? code.toLowerCase()}
          {detail}
          {m.source === "task" && <span className="text-cp-ink-4"> desde la tarea</span>}
        </>
      )}
      <span className="text-cp-ink-4"> · {formatDate(event.created_at)}</span>
    </li>
  );
}

function MessageCard({
  event,
  ticketId,
  desk,
  mine
}: {
  event: ISupportEvent;
  ticketId: number;
  desk: boolean;
  mine: boolean;
}) {
  const internal = event.visibility === "INTERNAL";
  const ai = event.type === "AI_SUGGESTION";
  return (
    <li
      className={cn(
        "flex flex-col gap-1 rounded-[10px] px-3.5 py-2.5",
        ai
          ? "border border-dashed border-[#7b3fe4] bg-cp-surface"
          : internal
            ? "border border-[#f5b700] bg-cp-surface"
            : mine
              ? "bg-cp-lime-tint"
              : "bg-cp-bg"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
        {ai ? (
          <span className="flex items-center gap-1 font-semibold text-[#7b3fe4]">
            <Sparkles className="h-3.5 w-3.5" /> Sugerencia IA
          </span>
        ) : (
          <b className="font-semibold">{event.created_by?.name ?? "—"}</b>
        )}
        {internal && (
          <span className="flex items-center gap-1 text-cp-ink-3">
            <Lock className="h-3 w-3" /> Nota interna · solo soporte
          </span>
        )}
        <span className="text-cp-ink-4">{formatDate(event.created_at)}</span>
      </div>
      {event.body && <MessageBody text={event.body} />}
      {event.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {event.attachments.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => downloadSupportAttachment(ticketId, a.id, a.file_name, desk)}
              className="flex h-[30px] max-w-full cursor-pointer items-center gap-1.5 rounded-[7px] border-0 bg-cp-surface px-2.5 text-[13px] text-cp-ink hover:text-cp-blue"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{a.file_name}</span>
              <span className="shrink-0 text-cp-ink-3">{formatBytes(a.size_bytes)}</span>
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

interface ConversationProps {
  detail: ISupportDetail;
  desk?: boolean;
  myUserId?: number;
  onChange: (next: ISupportDetail) => void;
  /** Alto máximo de la lista; el composer queda fijo debajo. */
  maxHeight?: string;
}

/** Línea de tiempo del ticket (mensajes, notas internas, IA y eventos) + caja para responder. */
export default function SupportConversation({
  detail,
  desk = false,
  myUserId,
  onChange,
  maxHeight = "420px"
}: ConversationProps) {
  const { showMessage } = useMessageApi();
  const t = detail.ticket;
  const asAgent = t.my_roles.includes("agent");
  const me = myUserId ?? (t.my_roles.includes("requester") ? t.created_by.id : undefined);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [detail.events.length]);

  const send = async () => {
    if (!body.trim() && !files.length) return;
    setBusy(true);
    try {
      const next = await sendSupportMessage(t.id, { body, internal, files }, desk);
      setBody("");
      setFiles([]);
      setInternal(false);
      onChange(next);
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo enviar el mensaje");
    } finally {
      setBusy(false);
    }
  };

  const waitingMe = t.status === "WAITING_CLIENT" && t.my_roles.includes("requester");

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ol
        ref={listRef}
        className="m-0 flex list-none flex-col gap-2 overflow-y-auto p-0"
        style={{ maxHeight }}
      >
        <li className="flex flex-col gap-1 rounded-[10px] bg-cp-bg px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-x-2 text-[13px]">
            <b className="font-semibold">{t.created_by.name ?? "—"}</b>
            <span className="text-cp-ink-4">{formatDate(t.created_at)}</span>
          </div>
          <MessageBody text={t.description} />
          {detail.events
            .filter((e) => e.event_code === "CREATED")
            .flatMap((e) => e.attachments)
            .map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => downloadSupportAttachment(t.id, a.id, a.file_name, desk)}
                className="flex h-[30px] w-fit max-w-full cursor-pointer items-center gap-1.5 rounded-[7px] border-0 bg-cp-surface px-2.5 text-[13px] text-cp-ink hover:text-cp-blue"
              >
                <Paperclip className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.file_name}</span>
                <span className="shrink-0 text-cp-ink-3">{formatBytes(a.size_bytes)}</span>
              </button>
            ))}
        </li>
        {detail.events
          .filter((e) => e.event_code !== "CREATED")
          .map((e) =>
            e.type === "SYSTEM" ? (
              <SystemLine key={e.id} event={e} asAgent={asAgent} />
            ) : (
              <MessageCard
                key={e.id}
                event={e}
                ticketId={t.id}
                desk={desk}
                mine={me != null && e.created_by?.id === me}
              />
            )
          )}
      </ol>

      {waitingMe && (
        <div
          className="flex items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-[13px] font-medium text-white"
          style={{ background: STATUS_META.WAITING_CLIENT.color }}
        >
          Soporte necesita tu respuesta para continuar. Mientras tanto, el tiempo de solución está
          en pausa.
        </div>
      )}

      {detail.permissions.can_reply && (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-[10px] border p-2.5",
            internal ? "border-[#f5b700]" : "border-cp-line-2"
          )}
        >
          <Input.TextArea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 8 }}
            variant="borderless"
            placeholder={
              internal
                ? "Nota para el equipo de soporte (el usuario no la ve). Puedes pegar SQL entre ```sql … ```"
                : asAgent
                  ? "Responder al usuario…"
                  : "Escribe tu mensaje…"
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
            }}
          />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {files.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className="flex h-[28px] max-w-full items-center gap-1.5 rounded-[7px] bg-cp-muted px-2 text-[13px]"
                >
                  <span className="truncate">{f.name}</span>
                  <X
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer text-cp-ink-4"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  />
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border-0 bg-transparent px-2 text-[13px] font-medium text-cp-ink-3 hover:text-cp-ink"
            >
              <Paperclip className="h-4 w-4" /> Adjuntar
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                setFiles([...files, ...Array.from(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
            {detail.permissions.can_add_note && (
              <label className="flex cursor-pointer items-center gap-1.5 text-[13px] text-cp-ink-2">
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                />
                <Lock className="h-3.5 w-3.5" /> Nota interna
              </label>
            )}
            <Button
              type="primary"
              className="ml-auto !text-[#141414]"
              loading={busy}
              disabled={!body.trim() && !files.length}
              onClick={send}
            >
              {internal ? "Guardar nota" : "Enviar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
