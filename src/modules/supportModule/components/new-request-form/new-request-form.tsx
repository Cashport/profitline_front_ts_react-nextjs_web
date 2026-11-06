"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Input, Select } from "antd";
import { Check, Paperclip, X } from "lucide-react";

import { createSupportTicket } from "@/services/support/support";
import type { ISupportFormConfig, ISupportTicket } from "@/types/support/ISupport";
import { cn } from "@/utils/utils";
import { formatBytes, formatDuration } from "../../utils/support-format";
import { CriticalityTag } from "../support-tags/support-tags";

const Field = ({
  label,
  optional,
  error,
  children
}: {
  label: string;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) => (
  <label className="flex min-w-0 flex-col gap-1.5">
    <span className="text-[13px] font-semibold">
      {label}
      {optional && <span className="font-normal text-cp-ink-3"> · opcional</span>}
    </span>
    {children}
    {error && <span className="text-[13px] text-cp-red">{error}</span>}
  </label>
);

interface Draft {
  category: number | null;
  subcategory: number | null;
  title: string;
  description: string;
  tags: Record<string, string>;
}

const EMPTY: Draft = { category: null, subcategory: null, title: "", description: "", tags: {} };

/** "Nueva solicitud": categoría → subcategoría (muestra criticidad y ANS), título, descripción y adjuntos. */
export default function NewRequestForm({
  config,
  onSeeMine,
  onCreated
}: {
  config: ISupportFormConfig;
  onSeeMine: () => void;
  onCreated: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<ISupportTicket | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const category = config.categories.find((c) => c.id === draft.category);
  const sub = category?.subcategories.find((s) => s.id === draft.subcategory);
  const tags = useMemo(
    () =>
      draft.category
        ? config.tags.filter((t) => t.applies_to_all || t.category_ids.includes(draft.category!))
        : [],
    [config.tags, draft.category]
  );

  const errors = {
    category: !draft.category ? "Elige una categoría" : null,
    subcategory: draft.category && !draft.subcategory ? "Elige una subcategoría" : null,
    title: !draft.title.trim() ? "Ponle un título a tu solicitud" : null,
    description: !draft.description.trim() ? "Cuéntanos qué pasó para poder ayudarte" : null,
    tags: Object.fromEntries(
      tags.filter((t) => t.is_required && !draft.tags[t.id]).map((t) => [t.id, "Elige un valor"])
    ) as Record<string, string>
  };
  const invalid =
    !!errors.category ||
    !!errors.subcategory ||
    !!errors.title ||
    !!errors.description ||
    Object.keys(errors.tags).length > 0;

  const submit = async () => {
    setTried(true);
    if (invalid || sending || !draft.subcategory) return;
    setSending(true);
    setSendError(null);
    try {
      const ticket = await createSupportTicket({
        subcategory_id: draft.subcategory,
        title: draft.title.trim(),
        description: draft.description.trim(),
        tags: Object.fromEntries(
          Object.entries(draft.tags).filter(([id, v]) => v && tags.some((t) => String(t.id) === id))
        ),
        files
      });
      setSent(ticket);
      onCreated();
    } catch (error) {
      setSendError((error as Error).message || "No pudimos enviar tu solicitud.");
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setDraft(EMPTY);
    setFiles([]);
    setTried(false);
    setSent(null);
    setSendError(null);
  };

  if (sent) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-cp-lime">
          <Check className="h-5 w-5 text-[#141414]" strokeWidth={2.6} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-semibold">Recibimos tu solicitud</span>
          <span className="text-[13px] leading-relaxed text-cp-ink-2">
            Se creó el ticket <b>{sent.code}</b> y ya está asignado al equipo de soporte. Te
            avisaremos por correo cuando haya una respuesta.
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-px overflow-hidden rounded-[10px] border border-cp-line bg-cp-line">
          <Cell label="Ticket" value={sent.code} />
          <div className="flex flex-col gap-1 bg-cp-surface px-3.5 py-2.5">
            <span className="text-[13px] text-cp-ink-3">Criticidad</span>
            <span>
              <CriticalityTag value={sent.criticality} />
            </span>
          </div>
          {sent.sla.attention_min != null && (
            <Cell label="Primera atención" value={formatDuration(sent.sla.attention_min)} />
          )}
          <Cell label="Solución" value={formatDuration(sent.sla.resolution_min)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="primary" className="!text-[#141414]" onClick={onSeeMine}>
            Ver mis tickets
          </Button>
          <Button type="text" onClick={reset}>
            Crear otra solicitud
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-[18px]">
      <div className="flex flex-col gap-1">
        <span className="text-[18px] font-semibold">¿En qué te ayudamos?</span>
        <span className="text-[13px] text-cp-ink-3">
          Elige el tema para que llegue directo a la persona indicada.
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <Field label="Categoría" error={tried ? errors.category : null}>
          <Select
            placeholder="Selecciona una categoría"
            value={draft.category ?? undefined}
            status={tried && errors.category ? "error" : undefined}
            options={config.categories.map((c) => ({ value: c.id, label: c.name }))}
            onChange={(v: number) =>
              setDraft({ ...draft, category: v, subcategory: null, tags: {} })
            }
          />
        </Field>
        <Field label="Subcategoría" error={tried ? errors.subcategory : null}>
          <Select
            placeholder={category ? "Selecciona una subcategoría" : "Primero elige una categoría"}
            disabled={!category}
            value={draft.subcategory ?? undefined}
            status={tried && errors.subcategory ? "error" : undefined}
            options={(category?.subcategories ?? []).map((s) => ({ value: s.id, label: s.name }))}
            onChange={(v: number) => setDraft({ ...draft, subcategory: v })}
          />
        </Field>
      </div>

      {sub && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[10px] bg-cp-bg px-3.5 py-2.5 text-[13px] text-cp-ink-2">
          <span className="flex items-center gap-2">
            Criticidad <CriticalityTag value={sub.criticality} />
          </span>
          {sub.sla_attention_min != null && (
            <span>
              Primera atención{" "}
              <b className="text-cp-ink">{formatDuration(sub.sla_attention_min)}</b>
            </span>
          )}
          <span>
            Solución <b className="text-cp-ink">{formatDuration(sub.sla_resolution_min)}</b>
          </span>
          <span className="ml-auto text-cp-ink-3">Horas hábiles · definido por tu proyecto</span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {tags.map((t) => (
            <Field
              key={t.id}
              label={t.name}
              optional={!t.is_required}
              error={tried ? errors.tags[t.id] : null}
            >
              <Select
                showSearch
                allowClear={!t.is_required}
                placeholder={`Selecciona ${t.name.toLowerCase()}`}
                value={draft.tags[t.id] || undefined}
                status={tried && errors.tags[t.id] ? "error" : undefined}
                options={t.values.map((v) => ({ value: v, label: v }))}
                onChange={(v: string) =>
                  setDraft({ ...draft, tags: { ...draft.tags, [t.id]: v ?? "" } })
                }
              />
            </Field>
          ))}
        </div>
      )}

      <Field label="Título" error={tried ? errors.title : null}>
        <Input
          maxLength={200}
          value={draft.title}
          status={tried && errors.title ? "error" : undefined}
          placeholder="Ej. No puedo aplicar el pago del cliente 900123456"
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </Field>

      <Field label="Describe el problema" error={tried ? errors.description : null}>
        <Input.TextArea
          rows={5}
          value={draft.description}
          status={tried && errors.description ? "error" : undefined}
          placeholder="Qué intentabas hacer, qué pasó y, si aplica, el cliente o pedido afectado."
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold">
          Adjuntos <span className="font-normal text-cp-ink-3">· opcional</span>
        </span>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFiles([...files, ...Array.from(e.dataTransfer.files)]);
          }}
          className="flex min-h-[56px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#c4c4c4] bg-transparent p-2 text-[13px] text-cp-ink-2 hover:border-cp-ink"
        >
          <Paperclip className="h-4 w-4" />
          Arrastra archivos o{" "}
          <span className="font-medium text-cp-blue">búscalos en tu equipo</span>
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
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <span
                key={`${f.name}-${i}`}
                className="flex h-[30px] max-w-full items-center gap-1.5 rounded-[7px] bg-cp-muted px-2.5 text-[13px]"
              >
                <span className="truncate">{f.name}</span>
                <span className="shrink-0 text-cp-ink-3">{formatBytes(f.size)}</span>
                <X
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer text-cp-ink-4"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {sendError && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-cp-red px-3.5 py-2.5 text-[13px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-cp-red" />
          <span className="min-w-[200px] flex-1">
            {sendError} Tus datos siguen aquí; inténtalo de nuevo.
          </span>
        </div>
      )}

      <div className={cn("flex items-center gap-2 pt-0.5")}>
        <Button type="primary" className="!text-[#141414]" loading={sending} onClick={submit}>
          {sending ? "Enviando…" : "Enviar solicitud"}
        </Button>
        <Button type="text" onClick={reset} disabled={sending}>
          Limpiar
        </Button>
      </div>
    </div>
  );
}

const Cell = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 bg-cp-surface px-3.5 py-2.5">
    <span className="text-[13px] text-cp-ink-3">{label}</span>
    <span className="text-[14px] font-semibold">{value}</span>
  </div>
);
