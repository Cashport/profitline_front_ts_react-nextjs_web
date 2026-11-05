"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AGING_BUCKETS, type IClosingHistoryRow } from "@/types/closings/IClosings";

import { AGING_LABELS } from "../../constants";
import { formatAmount, formatPct, periodLabel } from "../../utils/format";
import ChartCard from "../chart-card/chart-card";
import { axisProps, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";

/** Del cierre más viejo al actual: neutros y el actual en naranja Cashport. */
const PERIOD_COLORS = ["#c9d3da", "#6f8ea3", "#ff5500"];
const SHOWN = 3;

const billions = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const mm = (v: number) => `${billions.format(v / 1e9)} mM`;

interface Props {
  /** Cierres en orden cronológico. */
  periods: string[];
  history: IClosingHistoryRow[];
}

/**
 * Aging al cierre de mes: cada tramo con los últimos tres cierres lado a lado, para ver si
 * lo vencido crece o se recupera. Escala real desde cero.
 */
export default function AgingComparison({ periods, history }: Props) {
  const shown = periods.slice(-SHOWN);
  const colors = PERIOD_COLORS.slice(-shown.length);

  const data = useMemo(() => {
    const totals = new Map<string, Record<string, number>>();
    history.forEach((h) => {
      if (!shown.includes(h.period)) return;
      const t = totals.get(h.period) ?? {};
      AGING_BUCKETS.forEach((b) => (t[b] = (t[b] ?? 0) + h.buckets[b]));
      totals.set(h.period, t);
    });
    return AGING_BUCKETS.map((b) => ({
      bucket: AGING_LABELS[b],
      ...Object.fromEntries(shown.map((p) => [p, totals.get(p)?.[b] ?? 0]))
    }));
  }, [history, shown]);

  const totalOf = (period: string) =>
    data.reduce((acc, row) => acc + Number((row as Record<string, unknown>)[period] ?? 0), 0);

  return (
    <ChartCard
      title="Aging al cierre de mes"
      help="Cartera de cada tramo en los últimos cierres, con escala real desde cero (miles de millones). El cierre más reciente va en naranja."
      legend={shown.map((p, i) => ({ label: periodLabel(p).split(" ")[0], color: colors[i] }))}
      className="h-full"
    >
      <div className="h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 64, right: 4, left: 0, bottom: 0 }} barGap={3}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="bucket" {...axisProps} />
            <YAxis {...axisProps} width={64} tickFormatter={(v) => mm(v)} />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Record<string, number | string>;
                return (
                  <ChartTooltipBox
                    title={`Tramo ${row.bucket}`}
                    rows={shown.map((p, i) => ({
                      label: periodLabel(p),
                      value: `${formatAmount(Number(row[p]))} · ${formatPct(totalOf(p) ? Number(row[p]) / totalOf(p) : 0)}`,
                      color: colors[i]
                    }))}
                  />
                );
              }}
            />
            {shown.map((p, i) => (
              <Bar
                key={p}
                dataKey={p}
                fill={colors[i]}
                radius={[3, 3, 0, 0]}
                maxBarSize={34}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={p}
                  content={(props) => {
                    const { x, y, width, value } = props as {
                      x: number;
                      y: number;
                      width: number;
                      value: number;
                    };
                    if (!value) return null;
                    const cx = x + width / 2;
                    const current = i === shown.length - 1;
                    return (
                      <text
                        x={cx}
                        y={y - 6}
                        transform={`rotate(-90 ${cx} ${y - 6})`}
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={current ? 700 : 600}
                        fill={current ? "#ff5500" : "#6b6b6b"}
                      >
                        {billions.format(value / 1e9)}
                      </text>
                    );
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
