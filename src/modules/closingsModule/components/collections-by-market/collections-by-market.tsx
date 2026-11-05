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

import type { IClosingClientInfo, IClosingHistoryRow } from "@/types/closings/IClosings";

import { marketColor, textOn } from "../../constants";
import { formatAmount, formatPct, periodLabel, periodShort } from "../../utils/format";
import { zoomedDomain } from "../../utils/trends";
import ChartCard from "../chart-card/chart-card";
import { axisProps, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";

interface Props {
  /** Cierres en orden cronológico. */
  periods: string[];
  history: IClosingHistoryRow[];
  clientOf: (nit: string) => IClosingClientInfo;
  /** Mercados filtrados (chips del tablero). */
  selected: string[];
  /** Todos los mercados del cierre, sin filtrar: la leyenda siempre los muestra para poder
      sumar o quitar varios. */
  allMarkets?: string[];
  onToggleMarket: (market: string) => void;
}

const billions = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
/** Miles de millones con un decimal: 70.412.000.000 → "70,4". */
const mm = (v: number) => billions.format(v / 1e9);

/** Segmentos más bajos que esto no llevan número (no cabe). */
const MIN_LABEL_HEIGHT = 16;

/**
 * Recaudo de cada cierre apilado por mercado: el número dentro de cada tramo es lo que aportó
 * ese mercado y el de arriba el total del mes (miles de millones). La leyenda filtra el tablero.
 */
export default function CollectionsByMarket({
  periods,
  history,
  clientOf,
  selected,
  allMarkets,
  onToggleMarket
}: Props) {
  const { data, markets } = useMemo(() => {
    const byPeriod = new Map<string, Map<string, number>>();
    const totals = new Map<string, number>();
    history.forEach((h) => {
      if (!h.collected) return;
      const market = clientOf(h.nit).market;
      const row = byPeriod.get(h.period) ?? new Map<string, number>();
      row.set(market, (row.get(market) ?? 0) + h.collected);
      byPeriod.set(h.period, row);
      totals.set(market, (totals.get(market) ?? 0) + h.collected);
    });
    const names = Array.from(totals.keys()).sort((a, b) => totals.get(b)! - totals.get(a)!);
    return {
      markets: names,
      data: periods.map((p) => {
        const row = byPeriod.get(p);
        const values = Object.fromEntries(names.map((n) => [n, row?.get(n) ?? 0]));
        return {
          period: p,
          label: periodShort(p),
          total: names.reduce((acc, n) => acc + (row?.get(n) ?? 0), 0),
          ...values
        };
      })
    };
  }, [history, periods, clientOf]);

  const any = selected.length > 0;
  const top = markets[markets.length - 1];
  // Eje Y dinámico: zoom sobre la parte de arriba según el menor y el mayor total visibles.
  const domain = useMemo(() => {
    const base = markets[0];
    const baseValues = data
      .map((d) => Number((d as Record<string, unknown>)[base] ?? 0))
      .filter((v) => v > 0);
    return zoomedDomain(
      data.map((d) => d.total),
      baseValues.length ? Math.min(...baseValues) : undefined
    );
  }, [data, markets]);

  return (
    <ChartCard
      title="Recaudo por mercado"
      help="Recaudo de cada cierre apilado por mercado, en miles de millones. Dentro de cada barra lo que aportó cada mercado; arriba, el total del mes. El eje no arranca en cero: hace zoom entre el mes más bajo y el más alto para que se note si el recaudo subió o bajó. Clic en un mercado (en la barra o en la leyenda) para filtrar todo el tablero."
      className="h-full"
    >
      <div className="h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 22, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis
              {...axisProps}
              width={56}
              domain={[domain.min, domain.max]}
              allowDataOverflow
              tickCount={5}
              tickFormatter={(v) => `${mm(v).replace(",0", "")} mM`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as Record<string, number | string>;
                const total = Number(row.total);
                return (
                  <ChartTooltipBox
                    title={`Recaudo ${periodLabel(String(row.period)).toLowerCase()}`}
                    rows={[
                      { label: "Total", value: formatAmount(total), strong: true },
                      ...markets
                        .filter((m) => Number(row[m]))
                        .map((m) => ({
                          label: m,
                          value: `${formatAmount(Number(row[m]))} · ${formatPct(total ? Number(row[m]) / total : 0)}`,
                          color: marketColor(m)
                        }))
                    ]}
                  />
                );
              }}
            />
            {markets.map((m) => (
              <Bar
                key={m}
                dataKey={m}
                stackId="markets"
                fill={marketColor(m)}
                fillOpacity={any && !selected.includes(m) ? 0.35 : 1}
                maxBarSize={72}
                cursor="pointer"
                onClick={() => onToggleMarket(m)}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={m}
                  content={(props) => {
                    const { x, y, width, height, value, index } = props as {
                      x: number;
                      y: number;
                      width: number;
                      height: number;
                      value: number;
                      index: number;
                    };
                    if (!value || height <= 0 || width < 34) return null;
                    // Con zoom, la parte del segmento por debajo del piso del eje queda cortada:
                    // el número va en el centro de lo que sí se ve.
                    const row = data[index] as unknown as Record<string, number>;
                    const base = markets
                      .slice(0, markets.indexOf(m))
                      .reduce((acc, k) => acc + (row[k] ?? 0), 0);
                    const hidden = Math.min(value, Math.max(0, domain.min - base));
                    const visible = height * (1 - hidden / value);
                    if (visible < MIN_LABEL_HEIGHT) return null;
                    return (
                      <text
                        x={x + width / 2}
                        y={y + visible / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={600}
                        fill={textOn(marketColor(m))}
                      >
                        {mm(value)}
                      </text>
                    );
                  }}
                />
                {m === top && (
                  <LabelList
                    dataKey="total"
                    content={(props) => {
                      const { x, width, index } = props as {
                        x: number;
                        width: number;
                        index: number;
                      };
                      const row = data[index];
                      if (!row?.total) return null;
                      // Arriba de la pila: el y del último segmento puede ser 0 de alto.
                      const stackTop = (props as { y: number }).y;
                      return (
                        <text
                          x={x + width / 2}
                          y={stackTop - 8}
                          textAnchor="middle"
                          fontSize={13}
                          fontWeight={700}
                          className="fill-cp-ink"
                        >
                          {mm(row.total)}
                        </text>
                      );
                    }}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {(allMarkets?.length ? allMarkets : markets).map((m) => {
          const on = selected.includes(m);
          return (
            <button
              key={m}
              type="button"
              onClick={() => onToggleMarket(m)}
              className="flex h-6 items-center gap-1.5 whitespace-nowrap rounded-[7px] px-[7px] text-[13px] font-medium"
              style={{
                border: `1px solid ${on ? "#cbe71e" : "transparent"}`,
                background: on ? "rgb(var(--cp-bg))" : "transparent",
                color: on
                  ? "rgb(var(--cp-ink))"
                  : any
                    ? "rgb(var(--cp-ink-4))"
                    : "rgb(var(--cp-ink-2))"
              }}
            >
              <span
                className="h-2.5 w-2.5 rounded-[3px]"
                style={{ background: marketColor(m), opacity: on || !any ? 1 : 0.45 }}
              />
              {m}
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}
