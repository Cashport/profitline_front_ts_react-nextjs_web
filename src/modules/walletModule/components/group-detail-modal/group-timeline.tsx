"use client";

import { cn } from "@/utils/utils";
import { fmtD } from "../../utils/format";
import { estadoTicket } from "../../utils/group-detail";
import AttachmentList from "../shared/attachment-list";
import StatusChip from "../shared/status-chip";
import type { IWalletTicket, IWalletTimelineEntry } from "../../types";

interface GroupTimelineProps {
  entries: IWalletTimelineEntry[];
  tickets: IWalletTicket[];
}

const DOT: Record<string, string> = {
  ok: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  tarde: "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  hoy: "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  abierto: "border-wallet-nov bg-wallet-nov/10 text-wallet-nov"
};

/** Bitácora del grupo: comentarios, adjuntos, eventos y tickets. */
export default function GroupTimeline({ entries, tickets }: GroupTimelineProps) {
  if (!entries.length) {
    return (
      <p className="text-[11.5px] leading-relaxed text-muted-foreground">
        Todavía no hay gestiones registradas en este grupo.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {entries.map((e, i) => {
        const ticket = e.ticketId ? tickets.find((t) => t.id === e.ticketId) : undefined;
        const st = ticket ? estadoTicket(ticket) : null;
        const esTicket = e.tipo === "ticket" && !!ticket;

        return (
          <div
            key={e.id}
            className={cn(
              "relative grid grid-cols-[22px_1fr] gap-2.5 pb-3.5",
              i < entries.length - 1 &&
                "before:absolute before:bottom-0 before:left-[10px] before:top-5 before:w-px before:bg-border"
            )}
          >
            <div
              className={cn(
                "z-[1] grid h-[21px] w-[21px] place-items-center rounded-full border border-border bg-muted text-[9px] font-bold text-muted-foreground",
                esTicket && st && DOT[st.k],
                e.tipo === "ticket_ok" && DOT.ok
              )}
            >
              {esTicket && st ? st.ico : e.tipo === "ticket_ok" ? "✓" : e.autor?.iniciales ?? "··"}
            </div>

            <div className="min-w-0 text-[12.5px] text-foreground">
              <div className="mb-0.5 text-[11px] text-muted-foreground">
                {e.autor?.nombre ?? "Sistema"} · {fmtD(e.fecha)}
                {e.tipo === "evento" ? " · evento" : ""}
              </div>

              {ticket && st ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[11.5px] text-muted-foreground">{ticket.id}</span>
                  {e.texto}
                  {ticket.estado === "abierto" && (
                    <StatusChip sev={st.tsev ?? st.sev}>{st.tiempo ?? st.estado}</StatusChip>
                  )}
                </div>
              ) : (
                e.texto
              )}

              {e.adjuntos && <AttachmentList items={e.adjuntos} className="mt-1.5" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
