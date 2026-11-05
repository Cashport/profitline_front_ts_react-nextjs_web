"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type {
  IClosingClientInfo,
  IClosingHistoryRow,
  IClosingPaymentRow,
  IClosingPortfolioRow,
  IClosingUnappliedPayment
} from "@/types/closings/IClosings";
import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import { cn } from "@/utils/utils";

import { marketColor } from "../../constants";
import { isCompensated } from "../../hooks/use-closings";
import useIsMobile from "../../hooks/use-is-mobile";
import { useTableSort } from "../../hooks/use-table-sort";
import { collectionDeltas, sumBy, type CollectionDelta } from "../../utils/aggregate";
import {
  formatAmount,
  formatMillions,
  formatPct,
  formatShort,
  periodLabel,
  periodShort
} from "../../utils/format";
import ChartCard, { Segmented } from "../chart-card/chart-card";
import { axisProps, ChartTooltipBox, gridProps } from "../chart-card/chart-theme";
import ClosingKpis, { Delta, Pill } from "../closing-kpis/closing-kpis";
import UnappliedEvolution from "../unapplied-evolution/unapplied-evolution";

interface Props {
  period: string;
  prevPeriod: string | null;
  payments: IClosingPaymentRow[];
  prevPayments: IClosingPaymentRow[];
  portfolio: IClosingPortfolioRow[];
  history: IClosingHistoryRow[];
  periods: string[];
  clientOf: (nit: string) => IClosingClientInfo;
  unapplied: IClosingUnappliedPayment[];
  onOpenClient: (nit: string) => void;
}

function DeltaTable({
  rows,
  onOpenClient
}: {
  rows: CollectionDelta[];
  onOpenClient: (nit: string) => void;
}) {
  const isMobile = useIsMobile();
  const { sort, onSort, sorted } = useTableSort(
    rows,
    { col: "delta", dir: rows[0]?.delta < 0 ? "asc" : "desc" },
    (r, col) => (col === "client" ? r.client : (r[col as keyof CollectionDelta] as number) ?? 0)
  );
  return (
    <div className="max-h-[420px] overflow-y-auto overflow-x-hidden">
      <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] text-cp-ink">
        <colgroup>
          <col />
          {!isMobile && <col style={{ width: 104 }} />}
          <col style={{ width: isMobile ? 72 : 104 }} />
          <col style={{ width: isMobile ? 84 : 112 }} />
          {!isMobile && <col style={{ width: 76 }} />}
        </colgroup>
        <thead className="sticky top-0 z-[1]">
          <tr>
            <SortableTh col="client" label="Cliente" sort={sort} onSort={onSort} className="pl-0" />
            {!isMobile && (
              <SortableTh
                col="previous"
                label="Anterior"
                align="right"
                sort={sort}
                onSort={onSort}
              />
            )}
            <SortableTh col="current" label="Actual" align="right" sort={sort} onSort={onSort} />
            <SortableTh col="delta" label="Variación" align="right" sort={sort} onSort={onSort} />
            {!isMobile && (
              <SortableTh col="pct" label="%" align="right" sort={sort} onSort={onSort} />
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.nit}
              onClick={() => onOpenClient(r.nit)}
              className="cursor-pointer hover:bg-cp-bg [&>td]:border-b [&>td]:border-cp-line"
            >
              <td className="h-[var(--table-row-h-single)] pr-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-[2px]"
                    style={{ background: marketColor(r.market) }}
                  />
                  <span className="truncate font-medium text-cp-blue">{r.client}</span>
                </span>
              </td>
              {!isMobile && (
                <td className="px-3 text-right tabular-nums">{formatMillions(r.previous)}</td>
              )}
              <td className="px-3 text-right tabular-nums">{formatMillions(r.current)}</td>
              <td
                className={cn(
                  "px-3 text-right font-semibold tabular-nums",
                  r.delta >= 0 ? "text-cp-lime-dark" : "text-[#d11a2a] dark:text-[#ff6b6b]"
                )}
              >
                {r.delta > 0 ? "+" : ""}
                {formatMillions(r.delta)}
              </td>
              {!isMobile && (
                <td className="px-3 text-right tabular-nums text-cp-ink-3">
                  {r.pct === null ? "Nuevo" : formatPct(r.pct).replace(",0", "")}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pt-2 text-right text-[13px] text-cp-ink-3">
        {rows.length} clientes · cifras en millones
      </p>
    </div>
  );
}

/** Recaudo del cierre: lo compensado por la compañía frente a lo que quedó sin aplicar. */
export default function CollectionsTab({
  period,
  prevPeriod,
  payments,
  prevPayments,
  portfolio,
  history,
  periods,
  clientOf,
  unapplied,
  onOpenClient
}: Props) {
  const [side, setSide] = useState<"up" | "down">("down");

  const kpis = useMemo(() => {
    const total = sumBy(payments, (p) => p.amount);
    const prev = sumBy(prevPayments, (p) => p.amount);
    const applied = sumBy(
      payments.filter((p) => isCompensated(p.status)),
      (p) => p.amount
    );
    const unapplied = total - applied;
    const portfolioTotal = sumBy(portfolio, (r) => r.amount);
    return { total, prev, applied, unapplied, portfolioTotal };
  }, [payments, prevPayments, portfolio]);

  const unappliedDetail = useMemo(() => {
    const map = new Map<
      string,
      { status: string; amount: number; count: number; clients: Set<string> }
    >();
    payments
      .filter((p) => !isCompensated(p.status))
      .forEach((p) => {
        const e = map.get(p.status) ?? {
          status: p.status,
          amount: 0,
          count: 0,
          clients: new Set()
        };
        e.amount += p.amount;
        e.count += p.payments;
        e.clients.add(p.nit);
        map.set(p.status, e);
      });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [payments]);

  const { markets, marketNames } = useMemo(() => {
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
      marketNames: names,
      markets: periods.map((p) => ({
        period: p,
        label: periodShort(p),
        ...Object.fromEntries(names.map((n) => [n, byPeriod.get(p)?.get(n) ?? 0]))
      }))
    };
  }, [history, periods, clientOf]);

  const deltas = useMemo(() => collectionDeltas(payments, prevPayments), [payments, prevPayments]);
  const improved = deltas.filter((d) => d.delta > 0);
  const worsened = deltas.filter((d) => d.delta < 0);
  const diff = kpis.prev ? (kpis.total - kpis.prev) / kpis.prev : 0;

  return (
    <div className="flex flex-col gap-[var(--section-gap)]">
      <ClosingKpis
        items={[
          {
            key: "prev",
            label: prevPeriod
              ? `Recaudo ${periodLabel(prevPeriod).toLowerCase()}`
              : "Recaudo anterior",
            value: formatMillions(kpis.prev),
            unit: "M",
            caption: "Cierre anterior"
          },
          {
            key: "current",
            label: `Recaudo ${periodLabel(period).toLowerCase()}`,
            value: formatMillions(kpis.total),
            unit: "M",
            aside: {
              label: "Sobre cartera",
              value: "",
              pill: (
                <Pill>{formatPct(kpis.portfolioTotal ? kpis.total / kpis.portfolioTotal : 0)}</Pill>
              )
            },
            caption: (
              <>
                <Delta
                  text={formatPct(Math.abs(diff))}
                  direction={diff > 0.0005 ? "up" : diff < -0.0005 ? "down" : "flat"}
                  goodWhenUp
                />{" "}
                vs cierre anterior
              </>
            )
          },
          {
            key: "applied",
            label: "Compensado al cierre",
            value: formatMillions(kpis.applied),
            unit: "M",
            bar: { value: kpis.total ? kpis.applied / kpis.total : 0, color: "#cbe71e" },
            caption: `${formatPct(kpis.total ? kpis.applied / kpis.total : 0)} del recaudo`
          },
          {
            key: "unapplied",
            label: "Recaudo sin aplicar al cierre",
            value: formatMillions(kpis.unapplied),
            unit: "M",
            bar: { value: kpis.total ? kpis.unapplied / kpis.total : 0, color: "#ff6a13" },
            caption: `${unappliedDetail.reduce((acc, d) => acc + d.count, 0)} pagos pendientes de compensar`
          }
        ]}
      />

      <div className="grid grid-cols-1 gap-[var(--card-gap)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ChartCard
          title="Recaudo por mercado"
          help="Recaudo de cada mercado en los últimos cierres, según la hoja Pagos de la plantilla."
          legend={marketNames.map((n) => ({ label: n, color: marketColor(n) }))}
        >
          <div className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={markets} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={78} tickFormatter={formatShort} />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,.04)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as Record<string, number | string>;
                    return (
                      <ChartTooltipBox
                        title={`Recaudo ${periodLabel(String(row.period)).toLowerCase()}`}
                        rows={marketNames.map((n) => ({
                          label: n,
                          value: formatAmount(Number(row[n] ?? 0)),
                          color: marketColor(n)
                        }))}
                      />
                    );
                  }}
                />
                {marketNames.map((n, i) => (
                  <Bar
                    key={n}
                    dataKey={n}
                    stackId="c"
                    fill={marketColor(n)}
                    maxBarSize={52}
                    radius={i === marketNames.length - 1 ? [4, 4, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <UnappliedEvolution periods={periods} period={period} unapplied={unapplied} />
      </div>

      <ChartCard
        title="Clientes que cambiaron su recaudo"
        help="Recaudo de cada cliente frente al cierre anterior. Clic en un cliente para ver su ficha y comentarios."
        actions={
          <Segmented
            value={side}
            onChange={setSide}
            options={[
              { value: "down", label: `Empeoraron (${worsened.length})` },
              { value: "up", label: `Mejoraron (${improved.length})` }
            ]}
          />
        }
      >
        <DeltaTable
          key={side}
          rows={side === "up" ? improved : worsened}
          onOpenClient={onOpenClient}
        />
      </ChartCard>
    </div>
  );
}
