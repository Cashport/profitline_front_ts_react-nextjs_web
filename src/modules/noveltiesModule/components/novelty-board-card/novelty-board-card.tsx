"use client";

import BoardCard from "@/components/ui/board-lanes/board-card";
import PersonBadge from "@/modules/walletModule/components/shared/person-badge";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { corto, fac, fmtD, fmtM } from "@/modules/walletModule/utils/format";
import { TIPO_BY_ID } from "../../constants";
import { sevGestion, slaDe } from "../../utils/novelties-calc";
import type { INoveltyRow } from "../../types";

interface NoveltyBoardCardProps {
  novelty: INoveltyRow;
  onOpenDetail: (id: string) => void;
}

/** Tarjeta de una novedad dentro de una columna del tablero. */
export default function NoveltyBoardCard({ novelty, onOpenDetail }: NoveltyBoardCardProps) {
  const sla = slaDe(novelty);

  return (
    <BoardCard sev={sla.sev} onClick={() => onOpenDetail(novelty.id)}>
      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
        <span className="font-mono">{novelty.id}</span>
        <span className="ml-auto tabular-nums">{fmtM(novelty.monto)}</span>
      </div>

      <div className="mb-[5px] mt-1 text-[12.5px] font-semibold leading-[1.3] text-foreground">
        {corto(novelty.cliente.nombre)}
      </div>

      <div className="mb-1.5 text-[11.5px] text-muted-foreground">
        {TIPO_BY_ID[novelty.tipo].nom} · {fac(novelty.facturas)}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <PersonBadge person={novelty.responsable} mini />
        <span className="ml-auto">
          <StatusChip sev={sla.sev}>{sla.txt}</StatusChip>
        </span>
      </div>

      <div className="mt-[5px] flex items-center gap-2 text-[11px] text-muted-foreground">
        Últ. gestión
        {novelty.diasSinGestion === null ? (
          <span>—</span>
        ) : (
          <StatusChip sev={sevGestion(novelty.diasSinGestion)}>
            {novelty.diasSinGestion === 0 ? "Hoy" : `${novelty.diasSinGestion}d`}
          </StatusChip>
        )}
        <span className="ml-auto tabular-nums">Límite {fmtD(novelty.limite)}</span>
      </div>
    </BoardCard>
  );
}
