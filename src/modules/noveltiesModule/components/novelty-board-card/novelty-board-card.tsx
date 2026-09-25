"use client";

import BoardCard from "@/components/ui/board-lanes/board-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { toPerson } from "@/modules/walletModule/utils/api-adapter";
import { corto, fac, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import type { IIncidentListItem } from "@/types/novelties/INovelties";
import { diasSinGestion, noveltyCode, sevGestion, slaDe } from "../../utils/novelties-calc";

interface NoveltyBoardCardProps {
  item: IIncidentListItem;
  onOpenDetail: (incidentId: number) => void;
}

/** Tarjeta de una novedad dentro de una columna del tablero. */
export default function NoveltyBoardCard({ item, onOpenDetail }: NoveltyBoardCardProps) {
  const sla = slaDe(item);
  const dias = diasSinGestion(item);

  return (
    <BoardCard sev={sla.sev} onClick={() => onOpenDetail(item.incident_id)}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        <span className="font-mono">{noveltyCode(item)}</span>
        <span className="ml-auto tabular-nums">{fmtM(item.amount)}</span>
      </div>

      <div className="mb-[5px] mt-1 text-[12.5px] font-semibold leading-[1.3] text-foreground">
        {corto(item.client_name)}
      </div>

      <div className="mb-1.5 text-[11.5px] text-muted-foreground">
        {item.novelty_name} · {fac(item.invoice_count)}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <PersonBadge person={toPerson(item.assigned_to_name)} mini />
        <span className="ml-auto">
          <StatusChip sev={sla.sev}>{sla.txt}</StatusChip>
        </span>
      </div>

      <div className="mt-[5px] flex items-center gap-2 text-[11px] text-muted-foreground">
        Últ. gestión
        {dias === null ? (
          <span>—</span>
        ) : (
          <StatusChip sev={sevGestion(dias)}>{dias === 0 ? "Hoy" : `${dias}d`}</StatusChip>
        )}
        <span className="ml-auto tabular-nums">
          Límite {item.limit_date ? fmtD(new Date(item.limit_date)) : "—"}
        </span>
      </div>
    </BoardCard>
  );
}
