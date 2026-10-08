"use client";

import { MISSING } from "../../constants";
import type { ILiveAdvisor, ILiveState, IVisitsPalette } from "../../types";
import { fmtNumber } from "../../utils/visits-format";
import type { ILiveTeamKpis } from "../../utils/visits-live";
import RankingRow from "./ranking-row";

interface RankingPanelProps {
  /** Asesores visibles, ya en orden de ranking, con su estado en `t`. */
  rows: { advisor: ILiveAdvisor; state: ILiveState }[];
  totalAdvisors: number;
  /** null cuando el día no viene del API: KPIs y contador en "XX". */
  kpis: ILiveTeamKpis | null;
  t: number;
  palette: IVisitsPalette;
  /** Lo que dice la lista cuando no hay filas (cargando, error, sin coincidencias…). */
  emptyText: string;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
}

/** Vista de equipo: KPIs del día y ranking de asesores, desde el API. */
export default function RankingPanel({
  rows,
  totalAdvisors,
  kpis,
  t,
  palette,
  emptyText,
  onSelect,
  onHover
}: RankingPanelProps) {
  const counter = !kpis
    ? MISSING
    : rows.length === totalAdvisors
      ? `${totalAdvisors} en campo hoy`
      : `${rows.length} de ${totalAdvisors}`;

  const tiles = [
    { label: "Activos", value: kpis?.active ?? MISSING, suffix: `/${kpis?.total ?? MISSING}` },
    {
      label: "Visitas",
      value: kpis?.visitsDone ?? MISSING,
      suffix: `/${kpis?.visitsPlanned ?? MISSING}`
    },
    { label: "Efect.", value: kpis ? fmtNumber(kpis.effectivenessPct) : MISSING, suffix: "%" },
    // Las actividades aún no llegan del backend.
    { label: "Actividades", value: MISSING, suffix: `/${MISSING}` }
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3.5 pt-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <h2 className="min-w-0 truncate text-[15px] font-semibold text-foreground">
          Ranking · Actividades
        </h2>
        <span className="whitespace-nowrap text-[11.5px] text-muted-foreground">{counter}</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {tiles.map((tile) => (
          <div key={tile.label} className="min-w-0 rounded-[10px] bg-secondary px-2.5 py-2">
            <span className="block truncate text-[10.5px] text-muted-foreground">{tile.label}</span>
            <div className="whitespace-nowrap text-base font-semibold tabular-nums tracking-[-0.02em] text-foreground">
              {tile.value}
              <small className="ml-px text-[10.5px] font-medium text-muted-foreground">
                {tile.suffix}
              </small>
            </div>
          </div>
        ))}
      </div>

      <ol className="-mx-3.5 mt-2.5 min-h-0 flex-1 overflow-y-auto border-t border-border pb-2.5 pl-3.5 pr-2.5 [scrollbar-width:thin] max-[900px]:overflow-visible">
        {rows.length ? (
          rows.map(({ advisor, state }, i) => (
            <RankingRow
              key={advisor.id}
              advisor={advisor}
              state={state}
              position={i + 1}
              t={t}
              palette={palette}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))
        ) : (
          <li className="px-2 py-3.5 text-xs text-muted-foreground">{emptyText}</li>
        )}
      </ol>
    </div>
  );
}
