"use client";

import BarList, { type BarListRow } from "@/components/ui/bar-list/bar-list";
import PanelCard from "@/components/ui/panel-card/panel-card";
import DetailTooltip, { estadoRows } from "@/modules/walletModule/components/shared/detail-tooltip";
import StatusLegend from "@/modules/walletModule/components/shared/status-legend";
import { EST_META } from "@/modules/walletModule/constants";
import { fmtM } from "@/modules/walletModule/utils/format";
import { segmentWidths } from "@/modules/walletModule/utils/wallet-calc";
import type { ITorreEjecutivo } from "../../types";

interface ExecutivePanelProps {
  ejecutivos: ITorreEjecutivo[];
}

/** Composición de la cartera por ejecutivo: ancho = cartera, cifra = sin conciliar. */
export default function ExecutivePanel({ ejecutivos }: ExecutivePanelProps) {
  const max = Math.max(1, ...ejecutivos.map((e) => e.segments.total));
  // wrapTrack sólo recibe la fila pintada; por aquí recupera su ejecutivo.
  const porId = new Map(ejecutivos.map((e) => [e.persona.id, e]));

  const rows: BarListRow[] = ejecutivos.map((e) => ({
    id: e.persona.id,
    label: e.persona.nombre,
    // El carril mide la cartera; dentro, los segmentos reparten esa misma cartera.
    trackWidth: Math.max(12, (e.segments.total / max) * 100),
    segments: segmentWidths(e.segments).map((s) => ({
      key: s.estado,
      width: s.width,
      className: EST_META[s.estado].bg
    })),
    value: fmtM(e.sinConciliar)
  }));

  return (
    <PanelCard
      title="Composición de la cartera por ejecutivo"
      hint="ancho = cartera · cifra = vencido sin conciliar"
    >
      <div className="mb-2.5">
        <StatusLegend />
      </div>

      <BarList
        rows={rows}
        maxHeight={363}
        emptyLabel="Ningún ejecutivo tiene cartera con estos filtros."
        wrapTrack={(track, row) => {
          const e = porId.get(row.id);
          if (!e) return track;

          return (
            <DetailTooltip
              title={`${e.persona.nombre} · cartera`}
              rows={estadoRows(e.segments)}
              total={{ value: fmtM(e.segments.total) }}
            >
              {track}
            </DetailTooltip>
          );
        }}
      />
    </PanelCard>
  );
}
