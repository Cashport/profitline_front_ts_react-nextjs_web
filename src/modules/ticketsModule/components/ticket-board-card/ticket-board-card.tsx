"use client";

import BoardCard from "@/components/ui/board-lanes/board-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { toPerson } from "@/modules/walletModule/utils/api-adapter";
import { fmtD, fmtM } from "@/modules/walletModule/utils/format";
import type { ITicket } from "@/types/tickets/ITickets";
import ClientTag from "../shared/client-tag";
import PriorityFlag from "../shared/priority-flag";
import { estadoDe, fechaLimite } from "../../utils/tickets-calc";

interface TicketBoardCardProps {
  ticket: ITicket;
  onOpenDetail: (ticketId: number) => void;
}

/** Tarjeta de un ticket dentro de una columna del tablero. */
export default function TicketBoardCard({ ticket: t, onOpenDetail }: TicketBoardCardProps) {
  const e = estadoDe(t);
  const limite = fechaLimite(t);

  return (
    <BoardCard sev={e.tsev ?? e.sev} onClick={() => onOpenDetail(t.id)}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        <span className="font-mono">{t.ticket_code}</span>
        <PriorityFlag priority={t.priority} mini />
        <span className="ml-auto tabular-nums">{fmtM(t.amount)}</span>
      </div>

      <div className="mb-[5px] mt-1 text-[12.5px] font-semibold leading-[1.3] text-foreground">
        {t.title}
      </div>

      <div className="mb-1.5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <ClientTag id={t.client_id} name={t.client_name} mini />
        {t.category_name ? <span>· {t.category_name}</span> : null}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <PersonBadge person={toPerson(t.assigned_to_name)} mini />
        <span className="ml-auto">
          {e.tiempo ? (
            <StatusChip sev={e.tsev ?? "ok"}>{e.tiempo}</StatusChip>
          ) : (
            <StatusChip sev={e.sev}>{e.estado}</StatusChip>
          )}
        </span>
      </div>

      <div className="mt-[5px] flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums">Fecha {limite ? fmtD(limite) : "—"}</span>
        <span className="ml-auto font-mono">{t.client_id}</span>
      </div>
    </BoardCard>
  );
}
