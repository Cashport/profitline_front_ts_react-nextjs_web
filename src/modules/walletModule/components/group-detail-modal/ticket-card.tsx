"use client";

import { useState } from "react";
import { Input } from "antd";

import { cn } from "@/utils/utils";
import { fmtD } from "../../utils/format";
import { estadoTicket } from "../../utils/group-detail";
import AttachmentList from "../shared/attachment-list";
import PersonBadge from "../shared/person-badge";
import StatusChip from "../shared/status-chip";
import type { IWalletTicket } from "../../types";

interface TicketCardProps {
  ticket: IWalletTicket;
  /** Resuelve true si la acción quedó resuelta; sólo entonces se cierra el cuadro. */
  onResolve: (ticket: IWalletTicket, comment?: string) => Promise<boolean>;
}

/** Color del borde izquierdo según urgencia del ticket. */
const BORDER: Record<string, string> = {
  ok: "border-l-emerald-500",
  tarde: "border-l-rose-500",
  hoy: "border-l-rose-500",
  abierto: "border-l-wallet-nov"
};

const BUTTON =
  "flex-none rounded-md border border-border bg-card px-2.5 py-[3px] text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45";

export default function TicketCard({ ticket, onResolve }: TicketCardProps) {
  const [resolviendo, setResolviendo] = useState(false);
  const [comentario, setComentario] = useState("");
  const [isSending, setIsSending] = useState(false);

  const st = estadoTicket(ticket);
  const fecha =
    ticket.estado === "abierto" ? ticket.deadline : ticket.resueltoEl ?? ticket.deadline;

  // Si falló, el cuadro se queda abierto con el comentario para reintentar.
  const handleConfirmResolve = async () => {
    if (isSending) return;
    setIsSending(true);
    try {
      const resolved = await onResolve(ticket, comentario.trim() || undefined);
      if (resolved) {
        setResolviendo(false);
        setComentario("");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-l-[3px] border-border bg-card p-3",
        BORDER[st.k]
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <StatusChip sev={st.tsev ?? st.sev} className="flex-none">
          {st.tiempo ?? st.estado}
        </StatusChip>
        {ticket.categoria && (
          <span className="truncate text-[11.5px] text-muted-foreground">{ticket.categoria}</span>
        )}
        <span className="ml-auto flex-none font-mono text-[11px] text-muted-foreground">
          {ticket.id}
        </span>
      </div>

      <div className="text-[13.5px] font-semibold leading-snug text-foreground">
        {ticket.titulo}
      </div>

      {ticket.comentario && (
        <div className="text-[12px] leading-relaxed text-muted-foreground">{ticket.comentario}</div>
      )}

      {ticket.estado === "resuelto" && ticket.comentarioResolucion && (
        <div className="text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-semibold">Resolución:</span> {ticket.comentarioResolucion}
        </div>
      )}

      <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-[7px] overflow-hidden whitespace-nowrap">
          <PersonBadge person={ticket.responsable} mini />
          <span className="opacity-45">·</span>
          <span className="tabular-nums">{fecha ? fmtD(fecha) : "Sin fecha"}</span>
        </span>

        {ticket.estado === "abierto" && !resolviendo && (
          <button
            type="button"
            onClick={() => setResolviendo(true)}
            className={cn("ml-auto", BUTTON)}
          >
            Resolver
          </button>
        )}
      </div>

      {resolviendo && (
        <div className="flex flex-col gap-2 border-t border-border pt-2">
          <Input.TextArea
            rows={2}
            autoFocus
            value={comentario}
            disabled={isSending}
            placeholder="Comentario de resolución (opcional)"
            onChange={(e) => setComentario(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSending}
              onClick={() => {
                setResolviendo(false);
                setComentario("");
              }}
              className={BUTTON}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSending}
              onClick={handleConfirmResolve}
              className="flex-none rounded-md bg-cashport-green px-2.5 py-[3px] text-[11.5px] font-bold text-cashport-black transition-colors hover:bg-cashport-green/90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSending ? "Resolviendo…" : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {ticket.adjuntos && <AttachmentList items={ticket.adjuntos} />}
    </div>
  );
}
