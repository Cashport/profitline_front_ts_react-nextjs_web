"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  AGING_BUCKETS,
  type IClosingPaymentRow,
  type IClosingPortfolioRow
} from "@/types/closings/IClosings";

import { AGING_COLORS, AGING_LABELS, SERIES } from "../../constants";
import { portfolioTotals, sumBy } from "../../utils/aggregate";
import { formatAmount, formatPct, formatShort, periodLabel, periodShort } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import { axisProps, axisTick, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";

interface Props {
  history: { period: string; portfolio: IClosingPortfolioRow[]; payments: IClosingPaymentRow[] }[];
}

type View = "overdue" | "aging";

/** Evolución corte a corte: cartera, vencido, recaudo y % vencido; o la escalera por tramos. */
export default function ClosingsTrend({ history }: Props) {
  const [view, setView] = useState<View>("overdue");

  const data = useMemo(
    () =>
      history.map((h) => {
        const t = portfolioTotals(h.portfolio);
        return {
          period: h.period,
          label: periodShort(h.period),
          total: t.total,
          current: t.current,
          overdue: t.overdue,
          overduePct: t.overduePct,
          collected: sumBy(h.payments, (p) => p.amount),
          ...Object.fromEntries(AGING_BUCKETS.slice(1).map((b) => [b, t.buckets[b]]))
        };
      }),
    [history]
  );

  const legend =
    view === "overdue"
      ? [
          { label: "Corriente", color: SERIES.current },
          { label: "Vencido", color: SERIES.overdue },
          { label: "Recaudo", color: SERIES.collected, shape: "line" as const },
          { label: "% vencido", color: SERIES.pct, shape: "line" as const }
        ]
      : AGING_BUCKETS.slice(1).map((b) => ({ label: AGING_LABELS[b], color: AGING_COLORS[b] }));

  return (
    <ChartCard
      title="Evolución de los cierres"
      help="Cada barra es la foto de la cartera al cierre de ese mes, tal como la reportó la compañía. La escalera muestra cómo envejece lo vencido corte a corte."
      legend={legend}
      actions={
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "overdue", label: "Cartera y recaudo" },
            { value: "aging", label: "Escalera de vencidos" }
          ]}
        />
      }
      className="h-full"
    >
      <div className="min-h-[300px] min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {view === "overdue" ? (
            <ComposedChart data={data} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              {/* Las barras usan ~60% del alto y la línea de % va por encima, sin taparlas. */}
              <YAxis
                yAxisId="amount"
                {...axisProps}
                width={78}
                tickFormatter={formatShort}
                domain={[0, (max: number) => max * 1.6]}
              />
              <YAxis
                yAxisId="pct"
                orientation="right"
                {...axisProps}
                width={48}
                domain={[0, (max: number) => max * 1.12]}
                tickFormatter={(v) => `${Math.round(v * 100)} %`}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number];
                  return (
                    <ChartTooltipBox
                      title={`Cierre ${periodLabel(row.period).toLowerCase()}`}
                      rows={[
                        { label: "Cartera", value: formatAmount(row.total), strong: true },
                        {
                          label: "Corriente",
                          value: formatAmount(row.current),
                          color: SERIES.current
                        },
                        {
                          label: "Vencido",
                          value: formatAmount(row.overdue),
                          color: SERIES.overdue
                        },
                        {
                          label: "Recaudo del mes",
                          value: formatAmount(row.collected),
                          color: SERIES.collected,
                          shape: "line"
                        },
                        {
                          label: "% vencido",
                          value: formatPct(row.overduePct),
                          color: SERIES.pct,
                          shape: "line"
                        }
                      ]}
                    />
                  );
                }}
              />
              <Bar
                yAxisId="amount"
                dataKey="current"
                stackId="a"
                fill={SERIES.current}
                maxBarSize={52}
              />
              <Bar
                yAxisId="amount"
                dataKey="overdue"
                stackId="a"
                fill={SERIES.overdue}
                radius={[4, 4, 0, 0]}
                maxBarSize={52}
              />
              <Line
                yAxisId="amount"
                dataKey="collected"
                stroke={SERIES.collected}
                strokeWidth={2}
                dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
              />
              <Line
                yAxisId="pct"
                dataKey="overduePct"
                stroke={SERIES.pct}
                strokeWidth={2}
                dot={{ r: 3.5, fill: "#fff", strokeWidth: 2 }}
                label={{
                  position: "top",
                  ...axisTick,
                  fill: "#4a4a4a",
                  formatter: (v: number) => formatPct(v)
                }}
              />
            </ComposedChart>
          ) : (
            <BarChart data={data} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} width={78} tickFormatter={formatShort} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0].payload as (typeof data)[number] & Record<string, number>;
                  return (
                    <ChartTooltipBox
                      title={`Vencido al cierre de ${periodLabel(row.period).toLowerCase()}`}
                      rows={[
                        { label: "Total vencido", value: formatAmount(row.overdue), strong: true },
                        ...AGING_BUCKETS.slice(1).map((b) => ({
                          label: AGING_LABELS[b],
                          value: formatAmount(row[b] ?? 0),
                          color: AGING_COLORS[b]
                        }))
                      ]}
                    />
                  );
                }}
              />
              {AGING_BUCKETS.slice(1).map((b, i, arr) => (
                <Bar
                  key={b}
                  dataKey={b}
                  stackId="aging"
                  fill={AGING_COLORS[b]}
                  maxBarSize={52}
                  radius={i === arr.length - 1 ? [4, 4, 0, 0] : undefined}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
