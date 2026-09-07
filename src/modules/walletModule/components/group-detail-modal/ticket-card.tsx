"use client";

import { cn } from "@/utils/utils";
import { fmtD } from "../../utils/format";
import { estadoTicket } from "../../utils/group-detail";
import AttachmentList from "../shared/attachment-list";
import PersonBadge from "../shared/person-badge";
import StatusChip from "../shared/status-chip";
import type { IWalletTicket } from "../../types";

interface TicketCardProps {
  ticket: IWalletTicket;
  onResolve: (id: string) => void;
}

/** Color del borde izquierdo según urgencia del ticket. */
const BORDER: Record<string, string> = {
  ok: "border-l-emerald-500",
  tarde: "border-l-rose-500",
  hoy: "border-l-rose-500",
  abierto: "border-l-wallet-nov"
};

export default function TicketCard({ ticket, onResolve }: TicketCardProps) {
  const st = estadoTicket(ticket);
  const fecha =
    ticket.estado === "abierto" ? ticket.deadline : ticket.resueltoEl ?? ticket.deadline;

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

      <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-[7px] overflow-hidden whitespace-nowrap">
          <PersonBadge person={ticket.responsable} mini />
          <span className="opacity-45">·</span>
          <span className="tabular-nums">{fmtD(fecha)}</span>
        </span>

        {ticket.estado === "abierto" && (
          <button
            type="button"
            onClick={() => onResolve(ticket.id)}
            className="ml-auto flex-none rounded-md border border-border bg-card px-2.5 py-[3px] text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Resolver
          </button>
        )}
      </div>

      {ticket.adjuntos && <AttachmentList items={ticket.adjuntos} />}
    </div>
  );
}
