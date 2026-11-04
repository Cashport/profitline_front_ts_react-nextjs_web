"use client";

import { useTranslations } from "use-intl";

import BarList, { type BarListRow } from "@/components/ui/bar-list/bar-list";
import PanelCard from "@/components/ui/panel-card/panel-card";
import DetailTooltip, {
  type DetailRow
} from "@/modules/walletModule/components/shared/detail-tooltip";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { fmtM } from "@/modules/walletModule/utils/format";
import type { ITorreTipo } from "../../types";

interface NoveltyTypePanelProps {
  tipos: ITorreTipo[];
}

/** Punto de la leyenda: los mismos dos colores que reparten cada barra. */
const Dot = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5">
    <i className={`inline-block h-2.5 w-2.5 rounded-[3px] ${className}`} />
    {children}
  </span>
);

/** Novedades abiertas por tipo, partidas entre las que van al día y las vencidas. */
export default function NoveltyTypePanel({ tipos }: NoveltyTypePanelProps) {
  const tr = useTranslations("controlTower.disputeTypes");
  // Todas las barras se miden contra el tipo más grande, no contra su propio total.
  const max = Math.max(1, ...tipos.map((t) => t.monto));
  // wrapTrack sólo recibe la fila pintada; por aquí recupera su tipo.
  const porId = new Map(tipos.map((t) => [t.id as string, t]));

  const rows: BarListRow[] = tipos.map((t) => ({
    id: t.id,
    label: t.nom,
    segments: [
      { key: "dia", width: (t.mDia / max) * 100, className: "bg-wallet-conc" },
      { key: "venc", width: (t.mVenc / max) * 100, className: "bg-wallet-nov" }
    ],
    value: fmtM(t.monto),
    extra: t.venc ? <StatusChip sev="crit">{t.venc}</StatusChip> : null
  }));

  return (
    <PanelCard
      title={tr("title")}
      hint={
        <span className="flex flex-wrap items-center gap-3">
          <Dot className="bg-wallet-conc">{tr("onTime")}</Dot>
          <Dot className="bg-wallet-nov">{tr("overdueTicket")}</Dot>
        </span>
      }
    >
      <BarList
        rows={rows}
        maxHeight={242}
        emptyLabel={tr("empty")}
        wrapTrack={(track, row) => {
          const t = porId.get(row.id);
          if (!t) return track;

          const filas: DetailRow[] = [
            { key: "dia", swatch: "bg-wallet-conc", label: tr("onTimeLabel"), value: fmtM(t.mDia) }
          ];
          if (t.mVenc) {
            filas.push({
              key: "venc",
              swatch: "bg-wallet-nov",
              label: tr("overdueCount", { count: t.venc }),
              value: fmtM(t.mVenc)
            });
          }

          return (
            <DetailTooltip
              title={t.nom}
              rows={filas}
              total={{ label: tr("total", { count: t.n }), value: fmtM(t.monto) }}
            >
              {track}
            </DetailTooltip>
          );
        }}
      />
    </PanelCard>
  );
}
