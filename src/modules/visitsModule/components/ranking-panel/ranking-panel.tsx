"use client";

import type { DayMode, IAdvisorState, IVisitsAdvisor, IVisitsPalette } from "../../types";
import type { ITeamKpis } from "../../utils/visits-calc";
import { fmtNumber } from "../../utils/visits-format";
import RankingRow from "./ranking-row";

interface RankingPanelProps {
  /** Asesores visibles, ya en orden de ranking. */
  rows: { advisor: IVisitsAdvisor; state: IAdvisorState }[];
  totalAdvisors: number;
  kpis: ITeamKpis;
  t: number;
  now: number;
  dayMode: DayMode;
  zoneNames: Record<string, string>;
  palette: IVisitsPalette;
  onSelect: (id: number) => void;
  onHover: (id: number | null) => void;
  onOpenDay: (id: number) => void;
}

/** Vista de equipo: KPIs del día y ranking de asesores por actividades exitosas. */
export default function RankingPanel({
  rows,
  totalAdvisors,
  kpis,
  t,
  now,
  dayMode,
  zoneNames,
  palette,
  onSelect,
  onHover,
  onOpenDay
}: RankingPanelProps) {
  const counter =
    rows.length === totalAdvisors
      ? `${totalAdvisors} ${dayMode === "future" ? "programados" : dayMode === "past" ? "usuarios" : "en campo hoy"}`
      : `${rows.length} de ${totalAdvisors}`;

  const tiles = [
    { label: "Activos", value: kpis.active, suffix: `/${kpis.total}` },
    { label: "Visitas", value: kpis.visitsDone, suffix: `/${kpis.visitsPlanned}` },
    { label: "Efect.", value: fmtNumber(kpis.effectivenessPct), suffix: "%" },
    { label: "Actividades", value: kpis.activitiesOk, suffix: `/${kpis.activitiesGoal}` }
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
              now={now}
              dayMode={dayMode}
              zoneName={zoneNames[advisor.zoneId]}
              palette={palette}
              onSelect={onSelect}
              onHover={onHover}
              onOpenDay={onOpenDay}
            />
          ))
        ) : (
          <li className="px-2 py-3.5 text-xs text-muted-foreground">
            Ningún asesor coincide con el filtro.
          </li>
        )}
      </ol>
    </div>
  );
}
