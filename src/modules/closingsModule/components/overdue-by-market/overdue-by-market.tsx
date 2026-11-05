"use client";

import { useEffect, useMemo, useState } from "react";
import { InputNumber } from "antd";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { IClosingClientInfo, IClosingHistoryRow } from "@/types/closings/IClosings";

import { formatPct, periodLabel } from "../../utils/format";
import ChartCard from "../chart-card/chart-card";
import { axisProps, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";

/** Cierres anteriores en azules neutros (del más viejo al más reciente). */
const PAST_COLORS = ["#e3e8ec", "#c9d3da", "#9fb3c2"];
const SHOWN = 4;
const META_KEY = "closings-overdue-target";
const DEFAULT_META = 0.14;

/** Desempeño del último cierre de cada mercado. */
const STATUS = {
  meta: { label: "En meta", color: "#9bb514" },
  better: { label: "Mejora, aún sobre la meta", color: "#011722" },
  worse: { label: "Retrocede", color: "#ff9a66" },
  worst: { label: "Peor mes del mercado", color: "#ff5500" }
} as const;
type Status = keyof typeof STATUS;

interface Props {
  /** Cierres en orden cronológico. */
  periods: string[];
  history: IClosingHistoryRow[];
  clientOf: (nit: string) => IClosingClientInfo;
}

const short = (p: string) => periodLabel(p).split(" ")[0].toLowerCase();

/**
 * % vencido de cada mercado en los últimos cierres. Los anteriores van en tonos neutros y el
 * actual se colorea según su desempeño frente a la meta y frente a su propia historia.
 */
export default function OverdueByMarket({ periods, history, clientOf }: Props) {
  const shown = periods.slice(-SHOWN);
  const current = shown[shown.length - 1];
  const past = shown.slice(0, -1);
  const pastColors = PAST_COLORS.slice(-past.length);

  const [meta, setMeta] = useState(DEFAULT_META);
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(META_KEY));
      if (stored > 0 && stored < 1) setMeta(stored);
    } catch {
      /* sin almacenamiento: queda la meta por defecto */
    }
  }, []);
  const saveMeta = (value: number | null) => {
    const next = value === null ? DEFAULT_META : value / 100;
    setMeta(next);
    try {
      window.localStorage.setItem(META_KEY, String(next));
    } catch {
      /* no se guarda; la meta aplica en esta sesión */
    }
  };

  const data = useMemo(() => {
    const acc = new Map<string, Map<string, { total: number; current: number }>>();
    const weight = new Map<string, number>();
    history.forEach((h) => {
      if (!shown.includes(h.period)) return;
      const market = clientOf(h.nit).market;
      const byPeriod = acc.get(market) ?? new Map();
      const e = byPeriod.get(h.period) ?? { total: 0, current: 0 };
      e.total += h.total;
      e.current += h.buckets.Corriente;
      byPeriod.set(h.period, e);
      acc.set(market, byPeriod);
      if (h.period === current) weight.set(market, (weight.get(market) ?? 0) + h.total);
    });
    return Array.from(acc.entries())
      .sort((a, b) => (weight.get(b[0]) ?? 0) - (weight.get(a[0]) ?? 0))
      .map(([market, byPeriod]) => {
        const values = Object.fromEntries(
          shown.map((p) => {
            const e = byPeriod.get(p);
            return [p, e && e.total > 0 ? (e.total - e.current) / e.total : null];
          })
        ) as Record<string, number | null>;
        const now = values[current];
        const prev = past.length ? values[past[past.length - 1]] : null;
        const worst = Math.max(...shown.map((p) => values[p] ?? -1));
        let status: Status = "better";
        if (now !== null && now <= meta) status = "meta";
        else if (now !== null && now >= worst && shown.length > 1) status = "worst";
        else if (now !== null && prev !== null && now > prev) status = "worse";
        return { market, status, ...values };
      });
  }, [history, shown, current, past, clientOf, meta]);

  const label = (isCurrent: boolean) =>
    function BarLabel(props: unknown) {
      const { x, y, width, value } = props as {
        x: number;
        y: number;
        width: number;
        value: number;
      };
      if (value === null || value === undefined) return null;
      const cx = x + width / 2;
      return (
        <text
          x={cx}
          y={y - 6}
          transform={`rotate(-90 ${cx} ${y - 6})`}
          dominantBaseline="central"
          fontSize={13}
          fontWeight={isCurrent ? 700 : 600}
          fill={isCurrent ? "#4a4a4a" : "#8a8a8a"}
        >
          {formatPct(value).replace(" %", "%")}
        </text>
      );
    };

  return (
    <ChartCard
      title="% vencido por mercado"
      help={`Cada mercado muestra ${past.map(short).join(" · ")} en tonos neutros y destaca ${short(current)} según su desempeño. La línea punteada es la meta de % vencido.`}
      legend={(Object.keys(STATUS) as Status[]).map((k) => ({
        label: STATUS[k].label,
        color: STATUS[k].color
      }))}
      actions={
        <label className="flex items-center gap-2 text-[13px] text-cp-ink-3">
          Meta
          <InputNumber
            min={1}
            max={99}
            step={1}
            value={Math.round(meta * 100)}
            onChange={saveMeta}
            addonAfter="%"
            variant="filled"
            className="w-[96px]"
            aria-label="Meta de % vencido"
          />
        </label>
      }
      className="h-full"
    >
      <div className="min-h-[260px] min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 58, right: 8, left: 0, bottom: 0 }} barGap={3}>
            <CartesianGrid {...gridProps} />
            <XAxis
              dataKey="market"
              {...axisProps}
              interval={0}
              tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
            />
            <YAxis {...axisProps} width={44} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
            <ReferenceLine
              y={meta}
              stroke="#9bb514"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Meta ${Math.round(meta * 100)}%`,
                position: "insideTopRight",
                fill: "#9bb514",
                fontSize: 13,
                fontWeight: 700
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Record<string, number | string | null>;
                const status = STATUS[row.status as Status];
                return (
                  <ChartTooltipBox
                    title={String(row.market)}
                    rows={[
                      ...shown.map((p, i) => ({
                        label: periodLabel(p),
                        value: row[p] === null ? "—" : formatPct(Number(row[p])),
                        color: p === current ? status.color : pastColors[i],
                        strong: p === current
                      })),
                      { label: "Estado", value: status.label }
                    ]}
                  />
                );
              }}
            />
            {past.map((p, i) => (
              <Bar
                key={p}
                dataKey={p}
                fill={pastColors[i]}
                radius={[3, 3, 0, 0]}
                maxBarSize={26}
                isAnimationActive={false}
              >
                <LabelList dataKey={p} content={label(false)} />
              </Bar>
            ))}
            <Bar dataKey={current} radius={[3, 3, 0, 0]} maxBarSize={26} isAnimationActive={false}>
              {data.map((d) => (
                <Cell key={d.market} fill={STATUS[d.status].color} />
              ))}
              <LabelList dataKey={current} content={label(true)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
