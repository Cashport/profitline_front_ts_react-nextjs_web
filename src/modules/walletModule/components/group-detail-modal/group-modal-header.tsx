"use client";

import { X } from "lucide-react";

import { cn } from "@/utils/utils";
import { EST_META } from "../../constants";
import { corto } from "../../utils/format";
import { slaDe } from "../../utils/group-detail";
import StatusChip from "../shared/status-chip";
import GroupActionsMenu from "./group-actions-menu";
import type { NoveltyModalMode } from "./novelty-drawer";
import type { IWalletGroupDetail } from "../../types";

interface GroupModalHeaderProps {
  detail: IWalletGroupDetail;
  onClose: () => void;
  /** Facturas marcadas en la pestaña "Facturas". */
  seleccionadas: number;
  /** Cambia el estado de la novedad; devuelve si quedó aplicado. */
  onChangeStatus: (statusId: number) => Promise<boolean>;
  /** Abre el panel de crear / editar / vincular novedad. */
  onOpenNoveltyModal: (mode: NoveltyModalMode) => void;
}

export default function GroupModalHeader({
  detail,
  onClose,
  seleccionadas,
  onChangeStatus,
  onOpenNoveltyModal
}: GroupModalHeaderProps) {
  const nov = detail.novedad;
  const meta = EST_META[detail.tipo];
  const sla = nov ? slaDe(nov) : null;

  return (
    <header className="flex flex-none items-start gap-4 border-b border-border px-[22px] pb-4 pt-[18px]">
      <div className="min-w-0 flex-1">
        <div className="mb-[7px] flex flex-wrap items-center gap-2">
          <span
            className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", meta.bg)}
            style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
          />
          {nov && (
            <span className="font-mono text-[12.5px] tracking-[0.02em] text-muted-foreground">
              {nov.id}
            </span>
          )}
          {nov ? (
            <>
              <StatusChip sev={nov.estado.sev} color={nov.estado.color}>
                {nov.estado.nom}
              </StatusChip>
              {sla && <StatusChip sev={sla.sev}>{sla.txt}</StatusChip>}
            </>
          ) : (
            <StatusChip sev={meta.chip}>{meta.chipTxt}</StatusChip>
          )}
        </div>

        <h3 className="text-[19px] font-semibold leading-[1.2] tracking-[-0.015em] text-foreground">
          {nov ? nov.tipoNom : meta.nom}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
          {corto(detail.cliente.nombre)}
          <span className="tabular-nums opacity-80">· NIT {detail.cliente.nit}</span>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        <GroupActionsMenu
          esNovedad={!!nov}
          totalFacturas={detail.totalFacturas}
          seleccionadas={seleccionadas}
          estadoActualId={nov?.estado.id}
          onChangeStatus={onChangeStatus}
          onOpenNoveltyModal={onOpenNoveltyModal}
        />
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
