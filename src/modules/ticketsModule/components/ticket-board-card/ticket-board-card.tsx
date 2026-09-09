"use client";

import BoardCard from "@/components/ui/board-lanes/board-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { corto, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { estadoTicket } from "@/modules/walletModule/utils/group-detail";
import type { ITicketRow } from "../../types";

interface TicketBoardCardProps {
  row: ITicketRow;
  onOpenDetail: (clave: string) => void;
}

/** Tarjeta de un ticket dentro de una columna del tablero. */
export default function TicketBoardCard({ row, onOpenDetail }: TicketBoardCardProps) {
  const t = row.ticket;
  const e = estadoTicket(t);

  return (
    <BoardCard sev={e.tsev ?? e.sev} onClick={() => onOpenDetail(row.clave)}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        <span className="font-mono">{t.id}</span>
        <span className="ml-auto tabular-nums">{fmtM(row.monto)}</span>
      </div>

      <div className="mb-[5px] mt-1 text-[12.5px] font-semibold leading-[1.3] text-foreground">
        {t.titulo}
      </div>

      <div className="mb-1.5 text-[11.5px] text-muted-foreground">
        {corto(row.cliente)}
        {t.categoria ? ` · ${t.categoria}` : ""}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <PersonBadge person={t.responsable} mini />
        <span className="ml-auto">
          {e.tiempo ? (
            <StatusChip sev={e.tsev ?? "ok"}>{e.tiempo}</StatusChip>
          ) : (
            <StatusChip sev={e.sev}>{e.estado}</StatusChip>
          )}
        </span>
      </div>

      <div className="mt-[5px] flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums">Fecha {fmtD(t.deadline)}</span>
        <span className="ml-auto font-mono">{row.novedadId ?? ""}</span>
      </div>
    </BoardCard>
  );
}
