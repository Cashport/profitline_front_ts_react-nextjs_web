"use client";

import { Button } from "antd";
import { BarChart3 } from "lucide-react";

import PanelCard from "@/components/ui/panel-card/panel-card";
import { cn } from "@/utils/utils";
import type {
  AgreementStatus,
  ICollectionTower,
  ITowerAgreementSegment
} from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { useContainerSize } from "../../hooks/use-container-size";
import { nice } from "../../utils/chart";
import { diaLabel, fechaCorta, isWeekend, money, pct, weekdayOf } from "../../utils/format";
import { sumBy } from "../../utils/rows";
import {
  AXIS,
  AXIS_TODAY,
  AXIS_WEEKEND,
  CHART_HEIGHT,
  CHART_MARGIN as M,
  GRID,
  MUTED,
  PANEL_TITLE,
  TODAY_LABEL,
  TODAY_LINE,
  WEEK_LINE,
  WEEK_TICK
} from "../shared/chart-styles";
import { LegendItem, Swatch } from "../shared/legend";
import TowerTooltip, { TipContentProps, TipRow } from "../shared/tower-tooltip";

/** Las líneas guía van cada $500 M cuando el máximo lo permite. */
const GUIDE_STEP = 5e8;

/**
 * Barras apiladas por estado en cada día de compromiso del mes. Clic en un
 * segmento (o en el día) filtra todo el tablero; Shift + clic suma segmentos.
 * Las barras salen sin el filtro de segmentos: las no elegidas se atenúan.
 */
function Chart({ data, width }: { data: ICollectionTower; width: number }) {
  const { filters, patch } = useTowerFilters();
  const { period, agreementStatuses } = data;
  const sel = filters.segments;
  const W = Math.max(300, width);
  const H = CHART_HEIGHT;
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;

  const valuesByDate = new Map(data.agreementsByDay.map((d) => [d.date, d.values]));
  const days = data.daily.map(({ date }) => {
    const values = valuesByDate.get(date) ?? {};
    const parts = Object.values(values);
    return {
      date,
      values,
      count: sumBy(parts, (x) => x?.count ?? 0),
      total: sumBy(parts, (x) => x?.amount ?? 0)
    };
  });

  const bw = iw / days.length;
  const X = (i: number) => M.l + (i + 0.5) * bw;
  const mx = Math.max(1, ...days.map((d) => d.total));
  const step = mx >= GUIDE_STEP ? GUIDE_STEP : nice(mx / 4);
  const ymax = Math.ceil((mx * 1.04) / step) * step;
  const Y = (v: number) => M.t + ih - (v / ymax) * ih;
  const guides: number[] = [];
  for (let v = 0; v <= ymax + 1; v += step) guides.push(v);
  // El corte del mes en curso; en un mes cerrado coincide con el último día y no se marca.
  const iToday = period.open ? period.cutoffDay - 1 : -1;
  const barW = Math.max(2, bw * 0.62);
  const every = bw >= 15 ? 1 : 2;
  const labelY = M.t + ih + 13;
  const lineX = (i: number) => M.l + (i + 1) * bw;

  const inSelection = (date: string, status: AgreementStatus) =>
    sel.some((x) => x.date === date && (!x.status || x.status === status));

  /** Clic: elige el segmento (o el día) y filtra el tablero. Shift + clic suma o quita. */
  const select = (e: React.MouseEvent, i: number, status: AgreementStatus | null) => {
    const day = days[i];
    if (!day.count) return;
    const idx = sel.findIndex((x) => x.date === day.date && x.status === status);
    let next: ITowerAgreementSegment[];
    if (e.shiftKey) {
      next = idx >= 0 ? sel.filter((_, j) => j !== idx) : [...sel, { date: day.date, status }];
    } else {
      next = idx >= 0 && sel.length === 1 ? [] : [{ date: day.date, status }];
    }
    patch({ segments: next });
  };

  const tipFor = (day: (typeof days)[number]): TipContentProps => {
    const rows: TipRow[] = agreementStatuses
      .filter((s) => day.values[s.key])
      .map((s) => ({
        key: s.key,
        color: s.color,
        label: `${s.label}s (${day.values[s.key]?.count ?? 0})`,
        value: money(day.values[s.key]?.amount ?? 0)
      }));
    if (!rows.length) rows.push({ key: "none", label: "Sin compromisos", value: "—" });
    return {
      title: diaLabel(day.date),
      rows,
      total: day.count ? { label: `Total (${day.count})`, value: money(day.total) } : undefined
    };
  };

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Acuerdos de pago por día de compromiso"
      className="block select-none"
    >
      <text x="4" y="14" className={PANEL_TITLE}>
        COMPROMETIDO
      </text>
      {days.map(
        (day, i) =>
          weekdayOf(day.date) === 1 && (
            <g key={`w${day.date}`}>
              <line x1={M.l + i * bw} x2={M.l + i * bw} y1={M.t} y2={M.t + ih} className={WEEK_LINE} />
              <line
                x1={M.l + i * bw}
                x2={M.l + i * bw}
                y1={M.t + ih}
                y2={M.t + ih + 5}
                className={WEEK_TICK}
              />
            </g>
          )
      )}
      {guides.map((v) => (
        <g key={`y${v}`}>
          <line x1={M.l} x2={M.l + iw} y1={Y(v)} y2={Y(v)} className={GRID} />
          <text x={M.l - 8} y={Y(v) + 3.5} textAnchor="end" className={AXIS}>
            {v ? money(v) : "$0"}
          </text>
        </g>
      ))}
      {iToday >= 0 && (
        <>
          <line
            x1={lineX(iToday)}
            x2={lineX(iToday)}
            y1={M.t - 4}
            y2={M.t + ih}
            className={TODAY_LINE}
            strokeDasharray="2 3"
          />
          <text x={lineX(iToday)} y={M.t - 9} textAnchor="middle" className={TODAY_LABEL}>
            Hoy {fechaCorta(days[iToday].date)}
          </text>
        </>
      )}

      {days.map((day, i) => {
        let base = 0;
        const dayNumber = i + 1;
        const wholeDaySelected = sel.some((x) => x.date === day.date && !x.status);
        return (
          <TowerTooltip key={day.date} placement="right" delay={0} {...tipFor(day)}>
            <g className="group">
              {wholeDaySelected && (
                <rect
                  x={M.l + i * bw + 1}
                  y={M.t}
                  width={bw - 2}
                  height={ih}
                  rx={3}
                  className="fill-wallet-accent-soft stroke-wallet-accent"
                />
              )}
              <rect
                x={M.l + i * bw}
                y={M.t}
                width={bw}
                height={H - M.t}
                className={cn("fill-transparent", day.count && "cursor-pointer")}
                onClick={(e) => select(e, i, null)}
              />
              <rect
                x={M.l + i * bw}
                y={M.t}
                width={bw}
                height={ih}
                pointerEvents="none"
                className="fill-foreground opacity-0 group-hover:opacity-[0.06]"
              />
              {agreementStatuses.map((s) => {
                const v = day.values[s.key]?.amount ?? 0;
                if (v <= 0) return null;
                const ya = Y(base + v);
                const yb = Y(base);
                base += v;
                const chosen = sel.some((x) => x.date === day.date && x.status === s.key);
                return (
                  <rect
                    key={s.key}
                    x={X(i) - barW / 2}
                    y={ya}
                    width={barW}
                    height={Math.max(1, yb - ya)}
                    fill={s.color}
                    opacity={!sel.length || inSelection(day.date, s.key) ? 1 : 0.22}
                    strokeWidth={chosen ? 1.5 : 0}
                    className={cn("cursor-pointer hover:brightness-110", chosen && "stroke-foreground")}
                    onClick={(e) => {
                      e.stopPropagation();
                      select(e, i, s.key);
                    }}
                  />
                );
              })}
              {(every === 1 || dayNumber % 2 === 1 || i === iToday) && (
                <text
                  x={X(i)}
                  y={labelY}
                  textAnchor="middle"
                  className={cn(
                    AXIS,
                    isWeekend(day.date) && AXIS_WEEKEND,
                    i === iToday && AXIS_TODAY
                  )}
                >
                  {dayNumber}
                </text>
              )}
            </g>
          </TowerTooltip>
        );
      })}
    </svg>
  );
}

/** "Acuerdos de pago por día": compromisos del mes por estado, con resumen. */
export default function AgreementsChart({ data }: { data: ICollectionTower }) {
  const [ref, { width }] = useContainerSize<HTMLDivElement>();
  const { period, agreements, agreementStatuses } = data;
  const month = period.label.split(" ")[0];
  const due = agreements.filter((a) => a.status !== "PENDING");
  const dueAgreed = sumBy(due, (a) => a.agreed);

  // Resumen de lo que hay en el tablero (con la selección del gráfico aplicada).
  const summaryRows: TipRow[] = [
    {
      key: "all",
      color: MUTED,
      label: `Cargados (${agreements.length})`,
      value: money(sumBy(agreements, (a) => a.agreed))
    },
    ...agreementStatuses.map((s) => {
      const group = agreements.filter((a) => a.status === s.key);
      const broken = s.key === "BROKEN";
      return {
        key: s.key,
        color: s.color,
        label: `${s.label}s${broken ? " · saldo" : ""} (${group.length})`,
        value: money(sumBy(group, (a) => (broken ? a.balance : a.agreed)))
      };
    })
  ];

  return (
    <PanelCard
      title="Acuerdos de pago por día"
      subtitle={period.label}
      hint="clic para filtrar · Shift + clic para sumar varios"
      flush
      actions={
        <TowerTooltip
          title={`Resumen · ${month}`}
          rows={summaryRows}
          total={{
            label: "Pagado de lo vencido",
            value: pct(dueAgreed ? sumBy(due, (a) => a.paid) / dueAgreed : NaN, 0)
          }}
        >
          <Button size="small" icon={<BarChart3 className="h-3.5 w-3.5" />}>
            Resumen
          </Button>
        </TowerTooltip>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-2.5 text-[10.5px] text-foreground/80">
        {agreementStatuses.map((s) => (
          <LegendItem key={s.key} mark={<Swatch color={s.color} />} label={s.label} />
        ))}
      </div>
      <div ref={ref} className="relative mx-1.5 mb-2" style={{ height: CHART_HEIGHT }}>
        {width > 0 && <Chart data={data} width={width} />}
      </div>
    </PanelCard>
  );
}
