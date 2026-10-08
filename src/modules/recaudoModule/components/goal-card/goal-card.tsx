"use client";

import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { TONE_TEXT } from "../../constants";
import { withAlpha } from "../../utils/chart";
import { money, pct, pp, splitUnit } from "../../utils/format";
import GoalBar from "../shared/goal-bar";
import { FOREGROUND, MUTED } from "../shared/chart-styles";
import { LegendItem, Swatch } from "../shared/legend";
import TowerTooltip, { TipRow } from "../shared/tower-tooltip";

interface GoalCardProps {
  data: ICollectionTower;
  className?: string;
}

/** Recaudo frente a la meta: recaudado, acuerdos pendientes e incumplidos, forecast y marca de meta. */
export default function GoalCard({ data, className }: GoalCardProps) {
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

  const forecastRows: TipRow[] = [
    { key: "rec", color: cs.color, label: "Recaudado", value: money(s.collected), tag: ofGoal(s.collected) },
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
      label: "Cierre estimado",
      value: money(s.forecast),
      tag: ofGoal(s.forecast),
      strong: true
    },
    {
      key: "dif",
      label: "Frente a la meta",
      value: money(s.forecast - s.goal, true),
      tone: s.forecast >= s.goal ? "pos" : "neg",
      tag: ""
    }
  ];

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-xl bg-card px-5 pb-3.5 pt-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-end gap-3.5">
        <div className="min-w-0">
          <div className="text-[12px] text-muted-foreground">Recaudo</div>
          <div className="whitespace-nowrap text-[36px] font-bold leading-[1.1] tracking-[-0.03em] tabular-nums text-foreground">
            {value}
            {unit && (
              <small className="ml-[5px] text-[14px] font-medium tracking-normal text-muted-foreground">
                {unit}
              </small>
            )}
          </div>
          <TowerTooltip
            title="vs promedio 3 meses"
            rows={[
              {
                key: "mes",
                color: cs.color,
                label: `Este mes al día ${period.cutoffDay}`,
                value: pct(compliance)
              },
              { key: "avg", color: MUTED, label: "Promedio 3 meses", value: pct(s.complianceAvg3) }
            ]}
          >
            <span
              className={cn(
                "mt-0.5 inline-block whitespace-nowrap text-[11px] font-semibold",
                isFinite(vsAvg3) && TONE_TEXT[vsAvg3 >= 0 ? "ok" : "crit"]
              )}
            >
              {pp(vsAvg3)} vs prom. 3M
            </span>
          </TowerTooltip>
        </div>

        <div className="ml-auto pb-0.5 text-right">
          <div className="text-[12px] text-muted-foreground">Meta</div>
          <div className="mt-1 flex items-center gap-2.5">
            {/* Fondo tenue del color del recaudo y texto del tema: el color del API
                es uno solo para los dos temas y no garantiza contraste como texto. */}
            <span
              className="rounded-md px-[9px] py-[3px] text-[11.5px] font-bold tabular-nums text-foreground"
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
              title: "Recaudo",
              rows: [
                { key: "v", color: cs.color, label: "Recaudado", value: money(s.collected) },
                { key: "p", color: cs.color, label: "De la meta", value: pct(compliance) }
              ]
            }
          },
          {
            key: "pen",
            value: s.pendingAgreements,
            color: ps.color,
            tip: {
              title: "Acuerdos",
              rows: [
                {
                  key: "v",
                  color: ps.color,
                  label: "Pendientes antes del cierre",
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
                { key: "v", color: bs.color, label: "Saldo vencido", value: money(s.brokenAgreements) }
              ]
            }
          }
        ]}
        forecast={
          open && s.forecast > s.collected
            ? {
                from: s.collected,
                to: s.forecast,
                color: cs.color,
                tip: { title: "Forecast", rows: forecastRows }
              }
            : null
        }
        goal={{
          value: s.goal,
          tip: {
            title: "Meta",
            rows: [
              { key: "meta", color: FOREGROUND, label: "Meta del mes", value: money(s.goal) },
              {
                key: "faltan",
                color: MUTED,
                label: "Faltan",
                value: money(Math.max(0, s.goal - s.collected))
              }
            ]
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-muted-foreground">
        <LegendItem mark={<Swatch color={cs.color} />} label={cs.label} value={money(s.collected)} />
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
        <span className="ml-auto inline-flex items-center gap-[5px] whitespace-nowrap">
          {open ? (
            <>
              <Swatch color={cs.color} outline />
              Forecast <b className="font-bold tabular-nums text-foreground">{money(s.forecast)}</b> ·{" "}
              {pct(forecastRatio)}
            </>
          ) : (
            <>Mes cerrado · {pct(compliance)}</>
          )}
        </span>
      </div>
    </div>
  );
}
