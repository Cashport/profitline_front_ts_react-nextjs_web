"use client";

import { useId, useState } from "react";
import { Segmented } from "antd";

import PanelCard from "@/components/ui/panel-card/panel-card";
import { cn } from "@/utils/utils";
import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { CURVE_REFERENCES } from "../../constants";
import { useContainerSize } from "../../hooks/use-container-size";
import type { CurveReference } from "../../types";
import { linePath, nice, niceFine, range, withAlpha } from "../../utils/chart";
import { diaLabel, fechaCorta, isWeekend, money, weekdayOf } from "../../utils/format";
import {
  AXIS,
  AXIS_TODAY,
  AXIS_WEEKEND,
  CHART_HEIGHT,
  CHART_MARGIN as M,
  FOREGROUND,
  GRID,
  MUTED,
  PANEL_TITLE,
  PREVIOUS,
  TODAY_LABEL,
  TODAY_LINE,
  WEEK_LINE,
  WEEK_TICK
} from "../shared/chart-styles";
import { LegendItem, LineSwatch, Swatch } from "../shared/legend";
import TowerTooltip, { TipContentProps, TipRow } from "../shared/tower-tooltip";

const axisMoney = (v: number) => (v === 0 ? "$0" : money(v));

interface ChartProps {
  data: ICollectionTower;
  reference: CurveReference;
  width: number;
}

/**
 * Barras diarias apiladas (aplicado + PNA) en el eje derecho y recaudo
 * acumulado contra la meta en el izquierdo, con la proyección punteada hasta
 * el forecast y la referencia histórica (mediana de 6 meses y/o mes anterior).
 * Port del gráfico SVG del prototipo.
 */
function Chart({ data, reference, width }: ChartProps) {
  const gradientId = `recaudo-area-${useId().replace(/:/g, "")}`;
  const { daily, period, summary } = data;
  const collected = summary.series.collected.color;
  const { applied, unapplied } = data.application.series;
  const W = Math.max(300, width);
  const H = CHART_HEIGHT;
  const dim = period.days;
  const D = period.cutoffDay;
  const open = period.open;
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const y0 = M.t;
  const y1 = M.t + ih;
  const bw = iw / dim;
  const X = (t: number) => M.l + (t - 0.5) * bw;
  const at = (t: number) => daily[t - 1];
  const showPrev = reference !== "median" && daily.some((p) => p.previousMonth !== null);
  const showMedian = reference !== "previous" && daily.some((p) => p.median6m !== null);

  // Eje izquierdo: acumulado.
  let top = Math.max(summary.goal, open ? summary.forecast : 0, summary.collected, 1);
  if (showPrev) top = Math.max(top, at(dim)?.previousMonth ?? 0);
  if (showMedian) top = Math.max(top, at(dim)?.median6m ?? 0);
  const step = nice(top / 4);
  const ticks = Math.ceil((top * 1.04) / step);
  const ymax = ticks * step;
  const Y = (v: number) => y1 - (v / ymax) * ih;

  // Lo esperado por día después del corte: lo que sube la proyección de un día al siguiente.
  const projected = daily.filter((p) => p.projected !== null);
  const expected = new Map<number, number>();
  if (open) {
    for (let i = 1; i < projected.length; i++) {
      expected.set(projected[i].day, (projected[i].projected ?? 0) - (projected[i - 1].projected ?? 0));
    }
  }

  // Eje derecho: recaudo del día con las mismas divisiones; la barra más alta ronda el 15% del alto.
  const dayTotal = (t: number) => (at(t).applied ?? 0) + (at(t).unapplied ?? 0);
  const barMax = Math.max(1, ...range(D).map(dayTotal), ...Array.from(expected.values()));
  const stepRight = niceFine(barMax / 0.15 / ticks);
  const YB = (v: number) => y1 - (v / (stepRight * ticks)) * ih;

  const barW = Math.max(2, bw * 0.62);
  const every = bw >= 15 ? 1 : 2;
  const actual = range(D).map((t): [number, number] => [X(t), Y(at(t).cumulative ?? 0)]);
  const prevAt = (t: number) => at(t).previousMonth ?? 0;

  const tipFor = (t: number): TipContentProps => {
    const p = at(t);
    const rows: TipRow[] = [];
    let total: TipContentProps["total"];
    if (t <= D) {
      rows.push(
        { key: "apl", color: applied.color, label: applied.label, value: money(p.applied ?? 0) },
        { key: "pna", color: unapplied.color, label: unapplied.label, value: money(p.unapplied ?? 0) },
        { key: "acu", color: collected, label: "Acumulado", value: money(p.cumulative ?? 0) }
      );
      total = { label: "Recaudo del día", value: money(dayTotal(t)) };
    } else if (open) {
      const e = expected.get(t);
      if (e !== undefined) {
        rows.push({ key: "esp", color: withAlpha(collected, 0.16), label: "Esperado del día", value: money(e) });
      }
      if (p.projected !== null) {
        rows.push({ key: "proy", color: collected, label: "Acumulado proyectado", value: money(p.projected) });
      }
    }
    if (showPrev) rows.push({ key: "prev", color: PREVIOUS, label: "Mes anterior", value: money(prevAt(t)) });
    if (showMedian) {
      rows.push({ key: "med", color: MUTED, label: "Mediana 6M", value: money(p.median6m ?? 0) });
    }
    rows.push({ key: "meta", color: FOREGROUND, label: "Meta", value: money(summary.goal) });
    return { title: diaLabel(p.date), rows, total };
  };

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Recaudo acumulado y recaudo diario del mes"
      className="block select-none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={collected} stopOpacity={0.22} />
          <stop offset="1" stopColor={collected} stopOpacity={0} />
        </linearGradient>
      </defs>

      {range(ticks + 1).map((i) => {
        const yy = Y((i - 1) * step);
        return (
          <g key={`g${i}`}>
            <line x1={M.l} x2={M.l + iw} y1={yy} y2={yy} className={GRID} />
            <text x={M.l - 8} y={yy + 3.5} textAnchor="end" className={AXIS}>
              {axisMoney((i - 1) * step)}
            </text>
            <text x={M.l + iw + 8} y={yy + 3.5} className={AXIS}>
              {axisMoney((i - 1) * stepRight)}
            </text>
          </g>
        );
      })}
      <text x="4" y="14" className={PANEL_TITLE}>
        ACUMULADO
      </text>
      <text x={M.l + iw + 8} y="14" className={PANEL_TITLE}>
        POR DÍA
      </text>

      {/* Una marca por semana, los lunes. */}
      {range(dim)
        .filter((t) => weekdayOf(at(t).date) === 1)
        .map((t) => {
          const xx = M.l + (t - 1) * bw;
          return (
            <g key={`w${t}`}>
              <line x1={xx} x2={xx} y1={y0} y2={y1} className={WEEK_LINE} />
              <line x1={xx} x2={xx} y1={y1} y2={y1 + 5} className={WEEK_TICK} />
            </g>
          );
        })}
      {range(dim).map((t) =>
        every > 1 && t % 2 === 0 && t !== dim ? null : (
          <text
            key={`d${t}`}
            x={X(t)}
            y={H - 6}
            textAnchor="middle"
            className={cn(
              AXIS,
              isWeekend(at(t).date) && AXIS_WEEKEND,
              t === D && open && AXIS_TODAY
            )}
          >
            {t}
          </text>
        )
      )}

      {/* Barras por día, detrás de las líneas. */}
      {range(D).map((t) => {
        const a = at(t).applied ?? 0;
        const u = at(t).unapplied ?? 0;
        const ya = YB(a);
        const yb = YB(a + u);
        return (
          <g key={`b${t}`}>
            {a > 0 && (
              <rect x={X(t) - barW / 2} y={ya} width={barW} height={Math.max(0, y1 - ya)} fill={applied.color} />
            )}
            {u > 0 && (
              <rect x={X(t) - barW / 2} y={yb} width={barW} height={Math.max(0, ya - yb)} fill={unapplied.color} />
            )}
          </g>
        );
      })}
      {Array.from(expected).map(([t, v]) => (
        <rect
          key={`e${t}`}
          x={X(t) - barW / 2}
          y={YB(v)}
          width={barW}
          height={Math.max(0, y1 - YB(v))}
          fill={withAlpha(collected, 0.16)}
          stroke={collected}
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      ))}

      <rect x={M.l} y={Y(summary.goal) - 5} width={iw} height={10} className="fill-muted opacity-60" />
      <line
        x1={M.l}
        x2={M.l + iw}
        y1={Y(summary.goal)}
        y2={Y(summary.goal)}
        className="stroke-foreground"
        strokeWidth={1.4}
        strokeDasharray="6 4"
      />
      {showPrev && (
        <path
          d={linePath(range(dim).map((t): [number, number] => [X(t), Y(prevAt(t))]))}
          fill="none"
          className="stroke-muted-foreground/60"
          strokeWidth={1.6}
        />
      )}
      {showMedian && (
        <path
          d={linePath(range(dim).map((t): [number, number] => [X(t), Y(at(t).median6m ?? 0)]))}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth={1.6}
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
        />
      )}

      {open && (
        <>
          <line
            x1={M.l + D * bw}
            x2={M.l + D * bw}
            y1={y0 - 4}
            y2={y1}
            className={TODAY_LINE}
            strokeDasharray="2 3"
          />
          <text x={M.l + D * bw} y={y0 - 9} textAnchor="middle" className={TODAY_LABEL}>
            Hoy {fechaCorta(at(D).date)}
          </text>
        </>
      )}

      <path d={`${linePath(actual)}L${X(D)},${y1}L${X(1)},${y1}Z`} fill={`url(#${gradientId})`} />
      <path
        d={linePath(actual)}
        fill="none"
        stroke={collected}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {open && projected.length > 0 && (
        <>
          <path
            d={linePath(projected.map((p): [number, number] => [X(p.day), Y(p.projected ?? 0)]))}
            fill="none"
            stroke={collected}
            strokeWidth={2.2}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <circle
            cx={X(dim)}
            cy={Y(summary.forecast)}
            r={4.5}
            className="fill-card"
            stroke={collected}
            strokeWidth={2}
          />
        </>
      )}
      <circle
        cx={X(D)}
        cy={Y(summary.collected)}
        r={4.5}
        fill={collected}
        className="stroke-card"
        strokeWidth={2}
      />

      {/* Una franja por día, encima de todo: resalta el día y abre su tooltip. */}
      {range(dim).map((t) => (
        <TowerTooltip key={`h${t}`} placement="right" delay={0} {...tipFor(t)}>
          <g className="group">
            <rect
              x={M.l + (t - 1) * bw}
              y={y0}
              width={bw}
              height={ih}
              className="fill-foreground opacity-0 group-hover:opacity-5"
            />
          </g>
        </TowerTooltip>
      ))}
    </svg>
  );
}

/** "Recaudo por día": acumulado contra la meta y recaudo de cada día. */
export default function DailyCollectionChart({ data }: { data: ICollectionTower }) {
  const [reference, setReference] = useState<CurveReference>("median");
  const [ref, { width }] = useContainerSize<HTMLDivElement>();
  const { period, summary, daily } = data;
  const collected = summary.series.collected.color;
  const { applied, unapplied } = data.application.series;
  const hasPrev = daily.some((p) => p.previousMonth !== null);
  const hasMedian = daily.some((p) => p.median6m !== null);

  return (
    <PanelCard
      title="Recaudo por día"
      subtitle={`${period.label} · acumulado y recaudo de cada día`}
      flush
      actions={
        <Segmented
          size="small"
          aria-label="Referencia"
          value={reference}
          options={CURVE_REFERENCES}
          onChange={(value) => setReference(value as CurveReference)}
        />
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 pt-3 text-[10.5px] text-foreground/80">
        <LegendItem mark={<LineSwatch color={collected} width={2.6} />} label="Acumulado" />
        {period.open && (
          <LegendItem mark={<LineSwatch color={collected} dash="4 3" />} label="Proyección" />
        )}
        <LegendItem
          mark={<LineSwatch className="stroke-foreground" dash="5 3" width={1.4} />}
          label="Meta"
        />
        {reference !== "median" && hasPrev && (
          <LegendItem
            mark={<LineSwatch className="stroke-muted-foreground/60" width={1.6} />}
            label="Mes anterior"
          />
        )}
        {reference !== "previous" && hasMedian && (
          <LegendItem
            mark={<LineSwatch className="stroke-muted-foreground" dash="1.5 3" width={1.6} />}
            label="Mediana 6 meses"
          />
        )}
        <LegendItem mark={<Swatch color={applied.color} />} label={applied.label} />
        <LegendItem
          mark={<Swatch color={unapplied.color} />}
          label={<b className="font-semibold text-foreground">{unapplied.label}</b>}
        />
        {period.open && (
          <LegendItem
            mark={<Swatch color={collected} outline fill={withAlpha(collected, 0.16)} />}
            label="Esperado"
          />
        )}
      </div>
      <div ref={ref} className="relative mx-1.5 mb-2" style={{ height: CHART_HEIGHT }}>
        {width > 0 && <Chart data={data} reference={reference} width={width} />}
      </div>
    </PanelCard>
  );
}
