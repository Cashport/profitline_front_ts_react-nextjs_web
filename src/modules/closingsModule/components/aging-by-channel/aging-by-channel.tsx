"use client";

import { useMemo } from "react";
import { Tooltip } from "antd";

import { AGING_BUCKETS, type IClosingPortfolioRow } from "@/types/closings/IClosings";

import { AGING_COLORS, AGING_LABELS, channelColor, HIGH_OVERDUE } from "../../constants";
import { groupPortfolio, portfolioTotals } from "../../utils/aggregate";
import { formatAmount, formatMillions, formatPct } from "../../utils/format";
import ChartCard from "../chart-card/chart-card";
import { ChartTooltipBox } from "../chart-card/chart-theme";
import { Pill } from "../closing-kpis/closing-kpis";

interface Props {
  rows: IClosingPortfolioRow[];
  onSelectChannel?: (channel: string) => void;
}

/**
 * Distribución por edades y canal: cada canal es una barra al 100% por tramo, con su peso en
 * la cartera. Reemplaza el treemap del Power BI, que no deja leer los tramos pequeños.
 */
export default function AgingByChannel({ rows, onSelectChannel }: Props) {
  const { channels, total } = useMemo(() => {
    const totals = portfolioTotals(rows);
    return {
      channels: [
        ...groupPortfolio(rows, "channel"),
        { name: "Total", ...totals, clients: totals.clients }
      ],
      total: totals.total
    };
  }, [rows]);

  return (
    <ChartCard
      title="Edades por canal"
      help="Reparto de la cartera de cada canal por tramo de vencimiento. El ancho es el 100% del canal; a la derecha, su peso en la cartera total."
      legend={AGING_BUCKETS.map((b) => ({ label: AGING_LABELS[b], color: AGING_COLORS[b] }))}
      className="h-full"
    >
      <div className="flex flex-col">
        <div className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)_72px_64px] items-center gap-3 border-b border-cp-line pb-2 text-[13.5px] font-semibold text-cp-ink">
          <span>Canal</span>
          <span>Tramos</span>
          <span className="text-right">Cartera</span>
          <span className="text-right">Vencido</span>
        </div>
        {channels.map((c) => {
          const isTotal = c.name === "Total";
          return (
            <button
              key={c.name}
              type="button"
              disabled={isTotal || !onSelectChannel}
              onClick={() => onSelectChannel?.(c.name)}
              className={`grid grid-cols-[minmax(0,160px)_minmax(0,1fr)_72px_64px] items-center gap-3 border-b border-[#f2f2f2] py-2 text-left text-[13px] ${
                isTotal ? "mt-1 border-b-0 bg-[#fafafa] font-semibold" : "hover:bg-[#fafafa]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {!isTotal && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: channelColor(c.name) }}
                  />
                )}
                <span className="truncate text-cp-ink" title={c.name}>
                  {c.name}
                </span>
              </span>
              <Tooltip
                color="transparent"
                overlayInnerStyle={{ padding: 0, boxShadow: "none" }}
                title={
                  <ChartTooltipBox
                    title={c.name}
                    rows={AGING_BUCKETS.map((b) => ({
                      label: AGING_LABELS[b],
                      value: `${formatAmount(c.buckets[b])} · ${formatPct(c.total ? c.buckets[b] / c.total : 0)}`,
                      color: AGING_COLORS[b]
                    }))}
                  />
                }
              >
                <span className="flex h-[14px] min-w-0 gap-[2px] overflow-hidden rounded">
                  {AGING_BUCKETS.map((b) =>
                    c.buckets[b] > 0 ? (
                      <span
                        key={b}
                        className="h-full"
                        style={{
                          flexGrow: c.buckets[b],
                          flexBasis: 0,
                          background: AGING_COLORS[b]
                        }}
                      />
                    ) : null
                  )}
                </span>
              </Tooltip>
              <span className="text-right">
                <span className="font-semibold text-cp-ink">{formatMillions(c.total)}</span>
                <span className="block text-cp-ink-3">
                  {isTotal ? "M" : formatPct(total ? c.total / total : 0)}
                </span>
              </span>
              <span className="flex justify-end">
                <Pill tone={c.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                  {formatPct(c.overduePct).replace(" %", "%")}
                </Pill>
              </span>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}
