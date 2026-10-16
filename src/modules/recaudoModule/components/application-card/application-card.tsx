"use client";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { PNA_DAYS_WARN, TONE_TEXT } from "../../constants";
import { fmt, money, pct } from "../../utils/format";
import { pendingDays, sumBy } from "../../utils/rows";
import { MUTED } from "../shared/chart-styles";
import { LegendItem, Swatch } from "../shared/legend";
import { KPI_LABEL, KPI_VALUE } from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/** Aplicación del recaudo: aplicado vs. sin aplicar (PNA) y lead time de aplicación. */
export default function ApplicationCard({ data }: { data: ICollectionTower }) {
  const { application: ap, daily, unappliedPayments } = data;
  const { applied: as, unapplied: us } = ap.series;
  const applied = sumBy(daily, (d) => d.applied ?? 0);
  const unapplied = sumBy(daily, (d) => d.unapplied ?? 0);
  const total = applied + unapplied || 1;
  const aged = unappliedPayments.filter((p) => pendingDays(p) > PNA_DAYS_WARN);
  const lt = ap.leadTimeDays;
  const prev = ap.previousLeadTimeDays;
  const delta = lt !== null && prev !== null ? lt - prev : NaN;
  const days = (v: number | null) => (v === null ? "—" : `${fmt(v, 1)} días`);

  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-card px-3.5 pb-3 pt-3.5 shadow-sm">
      <div className={KPI_LABEL}>Aplicación del recaudo</div>

      <div className="flex items-start justify-between gap-3">
        <div className={KPI_VALUE}>
          {pct(applied / total, 0)}
          <small className="text-[12px] font-medium tracking-normal text-muted-foreground"> aplicado</small>
        </div>
        <TowerTooltip
          title="Lead time de aplicación"
          rows={[
            { key: "mes", color: as.color, label: "Este mes", value: days(lt) },
            { key: "ant", color: MUTED, label: "Mes anterior", value: days(prev) },
            { key: "le2", color: us.color, label: "Aplicado en ≤ 2 días", value: pct(ap.appliedWithin2Days, 0) }
          ]}
        >
          <div className="text-right">
            <div className={KPI_VALUE}>
              {lt === null ? "—" : fmt(lt, 1)}
              <small className="text-[12px] font-medium tracking-normal text-muted-foreground"> días</small>
            </div>
            <div className="mt-1 text-[10.5px] text-muted-foreground">
              lead time de aplicación
              {isFinite(delta) && Math.abs(delta) >= 0.05 && (
                <>
                  {" · "}
                  <span className={TONE_TEXT[delta <= 0 ? "ok" : "crit"]}>
                    {(delta > 0 ? "+" : "-") + fmt(Math.abs(delta), 1)} d vs mes ant.
                  </span>
                </>
              )}
            </div>
          </div>
        </TowerTooltip>
      </div>

      <AgingBar
        className="mt-2.5"
        height={8}
        segments={[
          { key: "applied", value: applied, color: as.color },
          { key: "unapplied", value: unapplied, color: us.color }
        ]}
        wrapSegment={(seg, node) => {
          const serie = seg.key === "applied" ? as : us;
          return (
            <TowerTooltip
              title={serie.label}
              rows={[
                { key: "v", color: serie.color, label: "Valor", value: money(seg.value) },
                { key: "p", color: serie.color, label: "Del recaudo", value: pct(seg.value / total) }
              ]}
            >
              {node}
            </TowerTooltip>
          );
        }}
      />

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-muted-foreground">
        <LegendItem mark={<Swatch color={as.color} />} label={as.label} value={money(applied)} />
        <LegendItem mark={<Swatch color={us.color} />} label={us.label} value={money(unapplied)} />
        {aged.length > 0 && (
          <TowerTooltip
            title="Pendientes de aplicar"
            rows={[
              {
                key: "v",
                color: us.color,
                label: `Con más de ${PNA_DAYS_WARN} días`,
                value: money(sumBy(aged, (p) => p.amount))
              },
              { key: "n", label: "Pagos", value: String(aged.length) }
            ]}
          >
            <span className="ml-auto">
              <StatusChip sev="warn" className="rounded tabular-nums">
                {aged.length} con +{PNA_DAYS_WARN} días
              </StatusChip>
            </span>
          </TowerTooltip>
        )}
      </div>
    </div>
  );
}
