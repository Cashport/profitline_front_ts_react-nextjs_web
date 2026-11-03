"use client";

import { useTranslations } from "use-intl";

import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { TONE_TEXT } from "../../constants";
import { withAlpha } from "../../utils/chart";
import { money, pct, pp, splitUnit } from "../../utils/format";
import GoalBar from "../shared/goal-bar";
import { FORECAST, FOREGROUND, MUTED } from "../shared/chart-styles";
import { LegendItem, Swatch } from "../shared/legend";
import { KPI_LABEL } from "../shared/styles";
import TowerTooltip, { TipRow } from "../shared/tower-tooltip";

interface GoalCardProps {
  data: ICollectionTower;
  className?: string;
}

/** Recaudo frente a la meta: recaudado, acuerdos pendientes e incumplidos, forecast y marca de meta. */
export default function GoalCard({ data, className }: GoalCardProps) {
  const tc = useTranslations("collections.goalCard");
  const { summary: s, period } = data;
  const { collected: cs, pendingAgreements: ps, brokenAgreements: bs } = s.series;
  const open = period.open;
  const compliance = s.goal ? s.collected / s.goal : 0;
  const forecastRatio = s.goal ? s.forecast / s.goal : 0;
  const vsAvg3 = s.complianceAvg3 === null ? NaN : compliance - s.complianceAvg3;
  const ofGoal = (v: number) => (s.goal ? pct(v / s.goal) : "—");
  const scale =
    Math.max(
      s.goal,
      s.collected + s.pendingAgreements + s.brokenAgreements,
      open ? s.forecast : 0
    ) * 1.02 || 1;
  const [value, unit] = splitUnit(money(s.collected));
  // Ritmo esperado a hoy: lo que un mes típico ya llevaría de la meta al día del
  // corte. El ritmo total es el de los clientes ponderado por su meta.
  const goalOfClients = data.clients.reduce((acc, c) => acc + c.goal, 0);
  const pace = goalOfClients
    ? data.clients.reduce((acc, c) => acc + c.pace * c.goal, 0) / goalOfClients
    : 0;
  const expected = open && pace > 0 ? s.goal * pace : null;

  const forecastRows: TipRow[] = [
    {
      key: "rec",
      color: cs.color,
      label: tc("collected"),
      value: money(s.collected),
      tag: ofGoal(s.collected)
    },
    {
      key: "pen",
      color: ps.color,
      label: ps.label,
      value: money(s.pendingAgreements),
      tag: ofGoal(s.pendingAgreements)
    },
    { key: "sep", separator: true },
    {
      key: "fc",
      label: tc("estimatedClose"),
      value: money(s.forecast),
      tag: ofGoal(s.forecast),
      strong: true
    },
    {
      key: "dif",
      label: tc("vsTarget"),
      value: money(s.forecast - s.goal, true),
      tone: s.forecast >= s.goal ? "pos" : "neg",
      tag: ""
    }
  ];

  return (
    <div className={cn("cp-card flex min-w-0 flex-col px-[18px] py-[14px]", className)}>
      <div className="flex items-end gap-3.5">
        <div className="min-w-0">
          <div className={KPI_LABEL}>{tc("title")}</div>
          <div className="whitespace-nowrap text-[36px] font-bold leading-[1.1] tracking-[-0.03em] tabular-nums text-foreground">
            {value}
            {unit && (
              <small className="ml-[5px] text-[14px] font-medium tracking-normal text-muted-foreground">
                {unit}
              </small>
            )}
          </div>
          <TowerTooltip
            title={tc("vsAvgTitle")}
            rows={[
              {
                key: "mes",
                color: cs.color,
                label: tc("thisMonthAtDay", { day: period.cutoffDay }),
                value: pct(compliance)
              },
              { key: "avg", color: MUTED, label: tc("avg3"), value: pct(s.complianceAvg3) }
            ]}
          >
            <span
              className={cn(
                "mt-0.5 inline-block whitespace-nowrap text-[13px] font-semibold",
                isFinite(vsAvg3) && TONE_TEXT[vsAvg3 >= 0 ? "ok" : "crit"]
              )}
            >
              {tc("vsAvgShort", { value: pp(vsAvg3) })}
            </span>
          </TowerTooltip>
        </div>

        <div className="ml-auto pb-0.5 text-right">
          <div className={KPI_LABEL}>{tc("target")}</div>
          <div className="mt-1 flex items-center gap-2.5">
            {/* Fondo tenue del color del recaudo y texto del tema: el color del API
                es uno solo para los dos temas y no garantiza contraste como texto. */}
            <span
              className="rounded-md px-[9px] py-[3px] text-[13px] font-bold tabular-nums text-foreground"
              style={{ background: withAlpha(cs.color, 0.16) }}
            >
              {pct(compliance)}
            </span>
            <b className="whitespace-nowrap text-[17px] font-bold tabular-nums text-foreground">
              {money(s.goal)}
            </b>
          </div>
        </div>
      </div>

      <GoalBar
        className="my-3"
        height={10}
        goalOverhang={5}
        scale={scale}
        segments={[
          {
            key: "rec",
            value: s.collected,
            color: cs.color,
            tip: {
              title: tc("title"),
              rows: [
                { key: "v", color: cs.color, label: tc("collected"), value: money(s.collected) },
                { key: "p", color: cs.color, label: tc("ofTarget"), value: pct(compliance) }
              ]
            }
          },
          {
            key: "pen",
            value: s.pendingAgreements,
            color: ps.color,
            tip: {
              title: tc("agreements"),
              rows: [
                {
                  key: "v",
                  color: ps.color,
                  label: tc("pendingBeforeClose"),
                  value: money(s.pendingAgreements)
                }
              ]
            }
          },
          {
            key: "inc",
            value: s.brokenAgreements,
            color: bs.color,
            tip: {
              title: bs.label,
              rows: [
                {
                  key: "v",
                  color: bs.color,
                  label: tc("overdueBalance"),
                  value: money(s.brokenAgreements)
                }
              ]
            }
          }
        ]}
        forecast={
          open && s.forecast > s.collected
            ? {
                from: s.collected,
                to: s.forecast,
                color: FORECAST,
                tip: { title: tc("forecast"), rows: forecastRows }
              }
            : null
        }
        pace={
          expected === null
            ? null
            : {
                value: expected,
                tip: {
                  title: tc("paceTitle"),
                  rows: [
                    {
                      key: "esp",
                      color: MUTED,
                      label: tc("expectedAtDay", { day: period.cutoffDay }),
                      value: money(expected)
                    },
                    {
                      key: "rec",
                      color: cs.color,
                      label: tc("collected"),
                      value: money(s.collected)
                    },
                    {
                      key: "dif",
                      label: tc("difference"),
                      value: money(s.collected - expected, true),
                      tone: s.collected >= expected ? "pos" : "neg"
                    }
                  ]
                }
              }
        }
        goal={{
          value: s.goal,
          tip: {
            title: tc("target"),
            rows: [
              { key: "meta", color: FOREGROUND, label: tc("monthlyTarget"), value: money(s.goal) },
              {
                key: "faltan",
                color: MUTED,
                label: tc("remaining"),
                value: money(Math.max(0, s.goal - s.collected))
              }
            ]
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
        <LegendItem
          mark={<Swatch color={cs.color} />}
          label={cs.label}
          value={money(s.collected)}
        />
        <LegendItem
          mark={<Swatch color={ps.color} />}
          label={ps.label}
          value={money(s.pendingAgreements)}
        />
        <LegendItem
          mark={<Swatch color={bs.color} />}
          label={bs.label}
          value={money(s.brokenAgreements)}
        />
        {expected !== null && (
          <span className="inline-flex items-center gap-[5px] whitespace-nowrap">
            <i className="inline-block h-[9px] w-0 border-l-2 border-dotted border-muted-foreground" />
            {tc.rich("paceLegend", {
              value: money(expected),
              b: (chunks) => <b className="font-bold tabular-nums text-foreground">{chunks}</b>
            })}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-[5px] whitespace-nowrap">
          {open ? (
            <>
              <Swatch color={FORECAST} outline />
              {tc.rich("forecastLegend", {
                value: money(s.forecast),
                pct: pct(forecastRatio),
                b: (chunks) => <b className="font-bold tabular-nums text-foreground">{chunks}</b>
              })}
            </>
          ) : (
            <>{tc("monthClosed", { pct: pct(compliance) })}</>
          )}
        </span>
      </div>
    </div>
  );
}
