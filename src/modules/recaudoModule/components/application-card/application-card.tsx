"use client";

import { useTranslations } from "use-intl";

import AgingBar from "@/components/ui/aging-bar/aging-bar";
import StatusChip from "@/modules/walletModule/components/shared/status-chip";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { PNA_DAYS_WARN, TONE_TEXT } from "../../constants";
import { fmt, money, pct } from "../../utils/format";
import { pendingDays, sumBy } from "../../utils/rows";
import { MUTED } from "../shared/chart-styles";
import { LegendItem, Swatch } from "../shared/legend";
import { KPI_CARD, KPI_LABEL, KPI_VALUE } from "../shared/styles";
import TowerTooltip from "../shared/tower-tooltip";

/** Aplicación del recaudo: aplicado vs. sin aplicar (PNA) y lead time de aplicación. */
export default function ApplicationCard({ data }: { data: ICollectionTower }) {
  const tc = useTranslations("collections.applicationCard");
  const { application: ap, daily, unappliedPayments } = data;
  const { applied: as, unapplied: us } = ap.series;
  const applied = sumBy(daily, (d) => d.applied ?? 0);
  const unapplied = sumBy(daily, (d) => d.unapplied ?? 0);
  const total = applied + unapplied || 1;
  const aged = unappliedPayments.filter((p) => pendingDays(p) > PNA_DAYS_WARN);
  const lt = ap.leadTimeDays;
  const prev = ap.previousLeadTimeDays;
  const delta = lt !== null && prev !== null ? lt - prev : NaN;
  const days = (v: number | null) => (v === null ? "—" : tc("days", { value: fmt(v, 1) }));

  return (
    <div className={KPI_CARD}>
      <div>
        <div className={KPI_LABEL}>{tc("title")}</div>

        <div className="flex items-start justify-between gap-3">
          <div className={KPI_VALUE}>
            {pct(applied / total, 0)}
            <small className="text-[13px] font-medium tracking-normal text-muted-foreground">
              {" "}
              {tc("applied")}
            </small>
          </div>
          <TowerTooltip
            title={tc("leadTimeTitle")}
            rows={[
              { key: "mes", color: as.color, label: tc("thisMonth"), value: days(lt) },
              { key: "ant", color: MUTED, label: tc("previousMonth"), value: days(prev) },
              {
                key: "le2",
                color: us.color,
                label: tc("within2Days"),
                value: pct(ap.appliedWithin2Days, 0)
              }
            ]}
          >
            <div className="text-right">
              <div className={KPI_VALUE}>
                {lt === null ? "—" : fmt(lt, 1)}
                <small className="text-[13px] font-medium tracking-normal text-muted-foreground">
                  {" "}
                  {tc("daysUnit")}
                </small>
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {tc("leadTimeCaption")}
                {isFinite(delta) && Math.abs(delta) >= 0.05 && (
                  <>
                    {" · "}
                    <span className={TONE_TEXT[delta <= 0 ? "ok" : "crit"]}>
                      {tc("vsPrevious", {
                        delta: (delta > 0 ? "+" : "-") + fmt(Math.abs(delta), 1)
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </TowerTooltip>
        </div>
      </div>

      <AgingBar
        height={10}
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
                { key: "v", color: serie.color, label: tc("value"), value: money(seg.value) },
                {
                  key: "p",
                  color: serie.color,
                  label: tc("ofCollected"),
                  value: pct(seg.value / total)
                }
              ]}
            >
              {node}
            </TowerTooltip>
          );
        }}
      />

      <div className="flex flex-wrap items-center gap-3 self-start text-[13px] text-muted-foreground">
        <LegendItem mark={<Swatch color={as.color} />} label={as.label} value={money(applied)} />
        <LegendItem mark={<Swatch color={us.color} />} label={us.label} value={money(unapplied)} />
        {aged.length > 0 && (
          <TowerTooltip
            title={tc("pendingTitle")}
            rows={[
              {
                key: "v",
                color: us.color,
                label: tc("olderThan", { days: PNA_DAYS_WARN }),
                value: money(sumBy(aged, (p) => p.amount))
              },
              { key: "n", label: tc("payments"), value: String(aged.length) }
            ]}
          >
            <span className="ml-auto">
              <StatusChip sev="warn" className="rounded tabular-nums">
                {tc("agedChip", { count: aged.length, days: PNA_DAYS_WARN })}
              </StatusChip>
            </span>
          </TowerTooltip>
        )}
      </div>
    </div>
  );
}
