"use client";

import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { IClosingUnappliedPayment } from "@/types/closings/IClosings";

import { SERIES } from "../../constants";
import {
  formatAmount,
  formatDate,
  formatShort,
  periodLabel,
  periodShort
} from "../../utils/format";
import ChartCard from "../chart-card/chart-card";
import { axisProps, axisTick, gridProps } from "../chart-card/chart-theme";

const COUNT_COLOR = "#2b4a5f";
const TIP_ROWS = 8;

interface Props {
  /** Cierres en orden cronológico. */
  periods: string[];
  /** Cierre elegido: su barra va resaltada. */
  period: string;
  unapplied: IClosingUnappliedPayment[];
}

/**
 * Recaudo que no quedó compensado al cierre, corte a corte: plata (barras) y cantidad de pagos
 * (línea). El tooltip lista los pagos de ese cierre, que son los que explican la diferencia.
 */
export default function UnappliedEvolution({ periods, period, unapplied }: Props) {
  const data = useMemo(
    () =>
      periods.map((p) => {
        const items = unapplied.filter((u) => u.period === p).sort((a, b) => b.amount - a.amount);
        return {
          period: p,
          label: periodShort(p),
          amount: items.reduce((acc, u) => acc + u.amount, 0),
          count: items.length,
          items
        };
      }),
    [periods, unapplied]
  );

  return (
    <ChartCard
      title="Recaudo sin aplicar al cierre"
      help="Pagos que entraron en el mes pero la compañía no alcanzó a compensar en su ERP antes del corte. Pasa el mouse por un cierre para ver los pagos."
      legend={[
        { label: "Monto", color: SERIES.overdue },
        { label: "Cantidad de pagos", color: COUNT_COLOR, shape: "line" }
      ]}
      className="h-full"
    >
      <div className="h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis yAxisId="amount" {...axisProps} width={70} tickFormatter={formatShort} />
            <YAxis
              yAxisId="count"
              orientation="right"
              {...axisProps}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,.04)" }}
              wrapperStyle={{ zIndex: 20 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div className="w-[380px] rounded-xl bg-cp-surface px-3.5 py-3 text-[13px] shadow-[0_12px_32px_rgba(0,0,0,.16)]">
                    <p className="font-semibold text-cp-ink">
                      Cierre {periodLabel(row.period).toLowerCase()}
                    </p>
                    <p className="mb-2 text-cp-ink-3">
                      {row.count} pagos sin aplicar · {formatAmount(row.amount)}
                    </p>
                    {row.items.length === 0 && (
                      <p className="text-cp-ink-3">Todo el recaudo quedó compensado.</p>
                    )}
                    <div className="flex flex-col">
                      {row.items.slice(0, TIP_ROWS).map((u, i) => (
                        <div
                          key={`${u.nit}-${u.erpId ?? i}`}
                          className="flex items-center justify-between gap-3 border-t border-cp-line py-1.5"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-cp-ink">
                              {u.client}
                            </span>
                            <span className="block truncate text-cp-ink-3">
                              {u.status}
                              {u.paymentDate ? ` · pagó ${formatDate(u.paymentDate)}` : ""}
                              {u.erpId ? ` · ${u.erpId}` : ""}
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-cp-ink">
                            {formatAmount(u.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {row.items.length > TIP_ROWS && (
                      <p className="mt-1 text-cp-ink-3">
                        y {row.items.length - TIP_ROWS} pagos más
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar yAxisId="amount" dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={44}>
              {data.map((d) => (
                <Cell
                  key={d.period}
                  fill={SERIES.overdue}
                  fillOpacity={d.period === period ? 1 : 0.55}
                />
              ))}
            </Bar>
            <Line
              yAxisId="count"
              dataKey="count"
              stroke={COUNT_COLOR}
              strokeWidth={2}
              dot={{ r: 3.5, fill: "#fff", strokeWidth: 2 }}
              label={{ position: "top", ...axisTick, fill: "#4a4a4a" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
