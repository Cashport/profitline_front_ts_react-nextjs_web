"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Select } from "antd";

import { useMessageApi } from "@/context/MessageContext";
import { changeSupportStatus, reassignSupportTicket } from "@/services/support/support";
import type { ISupportDetail, SupportStatus } from "@/types/support/ISupport";
import { formatDate, formatDuration, slaBadge } from "../../utils/support-format";
import SupportConversation from "../support-conversation/support-conversation";
import { CriticalityTag, StatusDot } from "../support-tags/support-tags";

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-0.5 text-[13px] font-semibold text-cp-ink-3">{children}</div>
);

/** Texto del botón para pasar a `to`, según quién lo hace. */
function actionLabel(from: SupportStatus, to: SupportStatus, asRequester: boolean) {
  if (asRequester && from === "RESOLVED" && to === "CLOSED") return "Confirmar solución";
  if (asRequester && from === "RESOLVED" && to === "IN_PROGRESS") return "No está resuelto";
  if (asRequester && from === "WAITING_CLIENT" && to === "IN_PROGRESS") return "Ya respondí";
  if (to === "IN_PROGRESS")
    return from === "NEW" ? "Atender" : from === "RESOLVED" ? "Reabrir" : "Retomar";
  if (to === "WAITING_CLIENT") return "Pedir información al usuario";
  if (to === "RESOLVED") return "Marcar resuelto";
  if (to === "CANCELLED") return "Cancelar ticket";
  return to;
}

/** Transiciones que piden un comentario antes de confirmarse. */
const NEEDS_COMMENT: Partial<Record<SupportStatus, { title: string; required: boolean }>> = {
  WAITING_CLIENT: { title: "¿Qué necesitas que te diga el usuario?", required: true },
  RESOLVED: { title: "¿Cómo se resolvió? (lo verá el usuario)", required: false },
  CANCELLED: { title: "¿Por qué se cancela?", required: false }
};

interface Props {
  detail: ISupportDetail;
  onChange: (next: ISupportDetail) => void;
  /** Support Desk: endpoints sin proyecto. */
  desk?: boolean;
  /** Dentro del detalle de la tarea: oculta el enlace a la tarea. */
  fromTask?: boolean;
  conversationHeight?: string;
}

export default function SupportTicketDetail({
  detail,
  onChange,
  desk = false,
  fromTask = false,
  conversationHeight
}: Props) {
  const { showMessage } = useMessageApi();
  const t = detail.ticket;
  const asAgent = t.my_roles.includes("agent");
  const asRequester = t.my_roles.includes("requester");
  const [target, setTarget] = useState<SupportStatus | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const sla = slaBadge(t);

  const run = async (action: () => Promise<ISupportDetail>, ok: string) => {
    setBusy(true);
    try {
      onChange(await action());
      showMessage("success", ok);
      return true;
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo guardar");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const asksComment = (to: SupportStatus) =>
    (asAgent && NEEDS_COMMENT[to]) ||
    (asRequester && t.status === "RESOLVED" && to === "IN_PROGRESS"
      ? { title: "¿Qué falta por resolver?", required: true }
      : null);

  const go = async (to: SupportStatus) => {
    const ask = asksComment(to);
    if (ask && target !== to) {
      setTarget(to);
      return;
    }
    if (ask?.required && !comment.trim()) {
      showMessage("error", "Escribe el comentario para continuar");
      return;
    }
    const done = await run(
      () => changeSupportStatus(t.id, to, comment, desk),
      to === "CLOSED" ? "¡Gracias por confirmar!" : "Estado actualizado"
    );
    if (done) {
      setTarget(null);
      setComment("");
    }
  };

  const transitions = detail.permissions.transitions;
  const primary: SupportStatus | null = transitions.some((x) => x.status === "CLOSED")
    ? "CLOSED"
    : transitions.some((x) => x.status === "RESOLVED")
      ? "RESOLVED"
      : t.status === "NEW" && transitions.some((x) => x.status === "IN_PROGRESS")
        ? "IN_PROGRESS"
        : null;
  const ask = target ? asksComment(target) : null;

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 pr-10 text-[13px]">
        <span className="font-mono text-cp-ink-3">{t.code}</span>
        <StatusDot value={t.status} asAgent={asAgent} />
        <CriticalityTag value={t.criticality} />
        <span className="text-cp-ink-3">
          · Creado {formatDate(t.created_at)} por {t.created_by.name ?? "—"}
          {desk && t.project_name ? ` · ${t.project_name}` : ""}
        </span>
      </div>

      <h3 className="mt-2 text-[16px] font-semibold leading-snug">{t.title}</h3>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
        <div className="min-w-0 text-[13px]">
          <Label>Tema</Label>
          <div className="truncate" title={`${t.category_name} › ${t.subcategory_name}`}>
            {t.subcategory_name}
            <span className="text-cp-ink-3"> · {t.category_name}</span>
          </div>
        </div>
        <div className="min-w-0 text-[13px]">
          <Label>Responsable</Label>
          {detail.permissions.can_reassign ? (
            <Select
              size="small"
              className="w-full"
              showSearch
              optionFilterProp="label"
              disabled={busy}
              value={String(t.assigned_to.id)}
              options={detail.assignable_users.map((u) => ({ value: String(u.id), label: u.name }))}
              onChange={(v: string) =>
                run(() => reassignSupportTicket(t.id, Number(v), desk), "Responsable actualizado")
              }
            />
          ) : (
            <div className="truncate">{t.assigned_to.name ?? "Equipo de soporte"}</div>
          )}
        </div>
        <div className="min-w-0 text-[13px]">
          <Label>Solución (ANS {formatDuration(t.sla.resolution_min)})</Label>
          <span className="font-semibold" style={{ color: sla.color }}>
            {sla.text}
          </span>
        </div>
        {t.sla.attention_min != null && (
          <div className="min-w-0 text-[13px]">
            <Label>Atención (ANS {formatDuration(t.sla.attention_min)})</Label>
            {t.attended_at ? (
              <span className={t.sla.attention_breached ? "font-semibold text-cp-red" : ""}>
                Atendido {formatDate(t.attended_at)}
                {t.sla.attention_breached ? " · fuera de tiempo" : ""}
              </span>
            ) : (
              <span className={t.sla.attention_breached ? "font-semibold text-cp-red" : ""}>
                {t.sla.attention_breached
                  ? "Vencido"
                  : `Antes de ${formatDate(t.sla.attention_due_at)}`}
              </span>
            )}
          </div>
        )}
        {detail.tags.map((tag) => (
          <div key={tag.tag_id} className="min-w-0 text-[13px]">
            <Label>{tag.name}</Label>
            <div className="truncate">{tag.value}</div>
          </div>
        ))}
        {asAgent && t.task && !fromTask && (
          <div className="min-w-0 text-[13px]">
            <Label>Tarea</Label>
            {desk ? (
              <span className="font-mono">{t.task.code}</span>
            ) : (
              <Link href={`/tickets?task=${t.task.id}`} className="font-mono">
                {t.task.code}
              </Link>
            )}
          </div>
        )}
      </div>

      {transitions.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-cp-line pt-4">
          {transitions.map(({ status: to }) => (
            <Button
              key={to}
              disabled={busy}
              type={to === primary ? "primary" : "default"}
              className={to === primary ? "!text-[#141414]" : undefined}
              onClick={() => go(to)}
            >
              {actionLabel(t.status, to, asRequester && !asAgent)}
            </Button>
          ))}
        </div>
      )}

      {target && ask && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-cp-subtle p-3">
          <span className="text-[13px] font-semibold text-cp-ink-2">
            {ask.title}
            {!ask.required && " (opcional)"}
          </span>
          <Input.TextArea
            rows={3}
            maxLength={4000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="primary"
              loading={busy}
              className="!text-[#141414]"
              onClick={() => go(target)}
            >
              {actionLabel(t.status, target, asRequester && !asAgent)}
            </Button>
            <Button onClick={() => setTarget(null)} disabled={busy}>
              Volver
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-cp-line pt-3.5">
        <Label>Conversación</Label>
        <SupportConversation
          detail={detail}
          desk={desk}
          onChange={onChange}
          maxHeight={conversationHeight}
        />
      </div>
    </div>
  );
}
