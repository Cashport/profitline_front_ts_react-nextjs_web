"use client";

import StatCards, { type StatCardItem } from "@/components/ui/stat-cards/stat-cards";
import SegBar from "@/modules/walletModule/components/shared/seg-bar";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import { cli, fac, fmtM, pct } from "@/modules/walletModule/utils/format";
import { fria, vencida } from "../../utils/torre-calc";
import type { ITorreNovedad, ITorreResumen } from "../../types";

interface TorreKpiCardsProps {
  resumen: ITorreResumen;
  novedades: ITorreNovedad[];
}

/** Meta de vencido sobre cartera con la que se compara la operación. */
const META_VENCIDO = 16;

/** Las cuatro cifras de cabecera de la torre. */
export default function TorreKpiCards({ resumen, novedades }: TorreKpiCardsProps) {
  const { segments, vencidos } = resumen;
  const cobertura = vencidos.total ? (resumen.cubierto / vencidos.total) * 100 : null;

  const cards: StatCardItem[] = [
    {
      id: "cartera",
      label: "Cartera total",
      value: fmtM(segments.total),
      foot: `${fac(resumen.facturas)} · ${cli(resumen.clientes)}`
    },
    {
      id: "vencido",
      label: "Vencido",
      value: fmtM(segments.vencido),
      suffix: segments.total ? `${pct(segments.vencido, segments.total).toFixed(1)}%` : "—",
      foot: `Meta de operación ${META_VENCIDO}%`
    },
    {
      id: "cubierto",
      label: "Vencido cubierto",
      value: cobertura === null ? "—" : cobertura.toFixed(0),
      suffix: cobertura === null ? undefined : "%",
      // Los anchos salen sobre el vencido, no sobre la cartera: es lo que se cubre.
      bar: <SegBar segments={vencidos} className="mt-2.5 h-[7px]" />,
      foot: `${fmtM(vencidos.sin_conciliar)} sin conciliar`
    },
    {
      id: "novedades",
      label: "Novedades abiertas",
      value: String(novedades.length),
      foot: (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusChip sev="crit">{novedades.filter(vencida).length} con ticket vencido</StatusChip>
          <StatusChip sev="warn">{novedades.filter(fria).length} sin gestión +7d</StatusChip>
        </span>
      )
    }
  ];

  return <StatCards cards={cards} />;
}
