"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { IClosingPortfolioRow } from "@/types/closings/IClosings";

import { HIGH_OVERDUE, SERIES } from "../../constants";
import { groupPortfolio, type PortfolioDimension } from "../../utils/aggregate";
import { formatAmount, formatPct, formatShort } from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import { axisProps, axisTick, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";

const DIMENSIONS: { value: PortfolioDimension; label: string }[] = [
  { value: "channel", label: "Canal" },
  { value: "manager", label: "Gerente" },
  { value: "salesExecutive", label: "Ejecutivo comercial" },
  { value: "collectionExecutive", label: "Ejecutivo de cartera" }
];

const MAX_BARS = 14;

/** Corta etiquetas largas del eje ("MODELOS ALTERNATIVOS DE VENTA" → "MODELOS ALTER…"). */
const shorten = (value: string) => (value.length > 14 ? `${value.slice(0, 13)}…` : value);

interface Props {
  rows: IClosingPortfolioRow[];
  onSelect?: (dimension: PortfolioDimension, value: string) => void;
}

/** "Estado de la cartera por canal / ejecutivo": corriente y vencido apilados + % vencido. */
export default function PortfolioByDimension({ rows, onSelect }: Props) {
  const [selected, setSelected] = useState<PortfolioDimension>("channel");
  // Con un solo canal (filtrado), una barra no dice nada: se baja a ejecutivos comerciales.
  const singleChannel = useMemo(() => new Set(rows.map((r) => r.channel)).size === 1, [rows]);
  const dimension = selected === "channel" && singleChannel ? "salesExecutive" : selected;
  const setDimension = setSelected;
  const data = useMemo(() => groupPortfolio(rows, dimension).slice(0, MAX_BARS), [rows, dimension]);

  return (
    <ChartCard
      title="Estado de la cartera"
      help="Corriente y vencido de cada grupo al corte, con su % vencido. Clic en una barra para filtrar el tablero."
      legend={[
        { label: "Corriente", color: SERIES.current },
        { label: "Vencido", color: SERIES.overdue },
        { label: "% vencido", color: SERIES.pct, shape: "line" }
      ]}
      actions={<Segmented value={dimension} options={DIMENSIONS} onChange={setDimension} />}
      className="h-full"
    >
      <div className="min-h-[300px] min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="name"
              {...axisProps}
              interval={0}
              tickFormatter={shorten}
              angle={data.length > 7 ? -30 : 0}
              textAnchor={data.length > 7 ? "end" : "middle"}
              height={data.length > 7 ? 74 : 30}
            />
            <YAxis yAxisId="amount" {...axisProps} width={78} tickFormatter={formatShort} />
            <YAxis
              yAxisId="pct"
              orientation="right"
              {...axisProps}
              width={48}
              tickFormatter={(v) => `${Math.round(v * 100)} %`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <ChartTooltipBox
                    title={row.name}
                    rows={[
                      { label: "Cartera", value: formatAmount(row.total), strong: true },
                      {
                        label: "Corriente",
                        value: formatAmount(row.current),
                        color: SERIES.current
                      },
                      { label: "Vencido", value: formatAmount(row.overdue), color: SERIES.overdue },
                      {
                        label: "% vencido",
                        value: formatPct(row.overduePct),
                        color: SERIES.pct,
                        shape: "line"
                      },
                      { label: "Clientes", value: String(row.clients) }
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
              maxBarSize={44}
              cursor={onSelect ? "pointer" : undefined}
              onClick={(d: { name?: string }) => d.name && onSelect?.(dimension, d.name)}
            />
            <Bar
              yAxisId="amount"
              dataKey="overdue"
              stackId="a"
              fill={SERIES.overdue}
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
              cursor={onSelect ? "pointer" : undefined}
              onClick={(d: { name?: string }) => d.name && onSelect?.(dimension, d.name)}
            />
            <Line
              yAxisId="pct"
              dataKey="overduePct"
              stroke={SERIES.pct}
              strokeWidth={2}
              dot={(props: {
                cx?: number;
                cy?: number;
                payload?: { overduePct: number };
                index?: number;
              }) => (
                <circle
                  key={props.index}
                  cx={props.cx}
                  cy={props.cy}
                  r={3.5}
                  fill={(props.payload?.overduePct ?? 0) > HIGH_OVERDUE ? SERIES.pct : "#fff"}
                  stroke={SERIES.pct}
                  strokeWidth={2}
                />
              )}
              label={{
                position: "top",
                ...axisTick,
                fill: "#4a4a4a",
                formatter: (v: number) => formatPct(v)
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
