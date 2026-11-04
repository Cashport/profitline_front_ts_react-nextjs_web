"use client";

import { useMemo } from "react";
import { Tooltip } from "antd";
import { ChatCenteredText } from "phosphor-react";

import SortableTh from "@/modules/walletModule/components/shared/sortable-th";
import { AGING_BUCKETS, type AgingBucket } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { AGING_COLORS, AGING_LABELS, channelColor, HIGH_OVERDUE } from "../../constants";
import { useElementWidth, useTableSort } from "../../hooks/use-table-sort";
import { emptyBuckets, sumBy, type ClientRow } from "../../utils/aggregate";
import { formatAmount, formatPct, formatPp } from "../../utils/format";
import { Pill } from "../closing-kpis/closing-kpis";

interface Column {
  col: string;
  label: string;
  /** A menor número, más importante: se ocultan primero las de número alto. */
  priority: number;
  minWidth: number;
  value: (r: ClientRow) => number;
  render?: (r: ClientRow) => React.ReactNode;
}

const amountCell = (v: number) => (v ? formatAmount(v) : <span className="text-cp-ink-4">—</span>);

interface Props {
  rows: ClientRow[];
  /** NITs con comentario en este cierre. */
  commented: Set<string>;
  onOpen: (row: ClientRow) => void;
  /** Alto máximo del cuerpo con scroll; por defecto, lo que queda bajo el header y las pestañas. */
  maxHeight?: number | string;
}

/** "Resultados del cierre por cliente": la tabla del comité, con el aging completo. */
export default function ClientsTable({
  rows,
  commented,
  onOpen,
  maxHeight = "calc(100 * var(--vh, 1vh) - 300px)"
}: Props) {
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const columns = useMemo<Column[]>(
    () => [
      {
        col: "total",
        label: "Cartera",
        priority: 0,
        minWidth: 120,
        value: (r) => r.total,
        render: (r) => <span className="font-semibold">{formatAmount(r.total)}</span>
      },
      { col: "collected", label: "Recaudo", priority: 2, minWidth: 120, value: (r) => r.collected },
      {
        col: "overduePct",
        label: "% vencido",
        priority: 0,
        minWidth: 112,
        value: (r) => r.overduePct,
        render: (r) => {
          const diff = r.prevOverduePct === null ? null : r.overduePct - r.prevOverduePct;
          return (
            <span className="inline-flex flex-col items-end">
              <Pill tone={r.overduePct > HIGH_OVERDUE ? "risk" : "neutral"}>
                {formatPct(r.overduePct)}
              </Pill>
              {diff !== null && Math.abs(diff) >= 0.001 && (
                <span
                  className={cn(
                    "mt-0.5 text-[13px]",
                    diff > 0 ? "text-cp-magenta" : "text-cp-lime-dark"
                  )}
                >
                  {formatPp(diff)}
                </span>
              )}
            </span>
          );
        }
      },
      { col: "current", label: "Corriente", priority: 3, minWidth: 120, value: (r) => r.current },
      {
        col: "overdue",
        label: "Vencida",
        priority: 1,
        minWidth: 120,
        value: (r) => r.overdue,
        render: (r) => (
          <span className="inline-flex flex-col items-end gap-1">
            <span>{amountCell(r.overdue)}</span>
            {r.total > 0 && (
              <span className="flex h-[3px] w-[90px] gap-px overflow-hidden rounded-full">
                {AGING_BUCKETS.map((b) =>
                  r.buckets[b] > 0 ? (
                    <span
                      key={b}
                      style={{ flexGrow: r.buckets[b], flexBasis: 0, background: AGING_COLORS[b] }}
                    />
                  ) : null
                )}
              </span>
            )}
          </span>
        )
      },
      ...AGING_BUCKETS.slice(1).map<Column>((b: AgingBucket, i) => ({
        col: b,
        label: AGING_LABELS[b],
        priority: 4 + (i === 0 ? 0 : i === 4 ? 1 : 2),
        minWidth: 108,
        value: (r) => r.buckets[b]
      }))
    ],
    []
  );

  const NAME_MIN = 260;
  const COMMENT_W = 44;
  const visible = useMemo(() => {
    if (!width) return columns.filter((c) => c.priority <= 3);
    let available = width - NAME_MIN - COMMENT_W;
    const keep = new Set<string>();
    [...columns]
      .sort((a, b) => a.priority - b.priority)
      .forEach((c) => {
        if (available >= c.minWidth) {
          keep.add(c.col);
          available -= c.minWidth;
        }
      });
    return columns.filter((c) => keep.has(c.col));
  }, [columns, width]);

  const { sort, onSort, sorted } = useTableSort(rows, { col: "total", dir: "desc" }, (r, col) =>
    col === "client" ? r.client : columns.find((c) => c.col === col)?.value(r) ?? 0
  );

  const totals = useMemo(() => {
    const buckets = emptyBuckets();
    rows.forEach((r) => AGING_BUCKETS.forEach((b) => (buckets[b] += r.buckets[b])));
    const total = sumBy(rows, (r) => r.total);
    const current = buckets.Corriente;
    return {
      total,
      collected: sumBy(rows, (r) => r.collected),
      current,
      overdue: total - current,
      overduePct: total ? (total - current) / total : 0,
      buckets
    };
  }, [rows]);

  const totalValue = (col: string) => {
    if (col === "overduePct") return <Pill>{formatPct(totals.overduePct)}</Pill>;
    if (col in totals.buckets && col !== "Corriente")
      return formatAmount(totals.buckets[col as AgingBucket]);
    return formatAmount((totals as unknown as Record<string, number>)[col] ?? 0);
  };

  return (
    <div ref={ref} className="flex min-w-0 flex-col">
      <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight }}>
        <table className="w-full table-fixed border-separate border-spacing-0 text-[13px] text-cp-ink">
          <colgroup>
            <col />
            {visible.map((c) => (
              <col key={c.col} style={{ width: c.minWidth }} />
            ))}
            <col style={{ width: COMMENT_W }} />
          </colgroup>
          <thead className="sticky top-0 z-[1]">
            <tr>
              <SortableTh
                col="client"
                label="Cliente"
                sort={sort}
                onSort={onSort}
                className="pl-0"
              />
              {visible.map((c) => (
                <SortableTh
                  key={c.col}
                  col={c.col}
                  label={c.label}
                  align="right"
                  sort={sort}
                  onSort={onSort}
                />
              ))}
              <th className="border-b border-cp-line bg-cp-surface" aria-label="Comentario" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.nit}
                onClick={() => onOpen(r)}
                className="cursor-pointer hover:bg-[#fafafa] [&>td]:border-b [&>td]:border-[#f2f2f2]"
              >
                <td className="h-[var(--table-row-h)] py-2 pr-3">
                  <span className="block truncate font-medium text-cp-blue hover:underline">
                    {r.client}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5 text-cp-ink-3">
                    <span className="truncate">{r.salesExecutive}</span>
                    <span>·</span>
                    <span
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{ background: channelColor(r.channel) }}
                    />
                    <span className="truncate">{r.channel}</span>
                  </span>
                </td>
                {visible.map((c) => (
                  <td key={c.col} className="px-3 py-2 text-right tabular-nums">
                    {c.render ? c.render(r) : amountCell(c.value(r))}
                  </td>
                ))}
                <td className="text-center">
                  {commented.has(r.nit) && (
                    <Tooltip title="Tiene comentario en este cierre">
                      <ChatCenteredText size={18} weight="fill" className="inline text-cp-orange" />
                    </Tooltip>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="sticky bottom-0">
              <tr className="bg-[#fafafa] font-semibold [&>td]:border-t [&>td]:border-cp-line">
                <td className="h-[var(--table-total-h)] pr-3">Total</td>
                {visible.map((c) => (
                  <td key={c.col} className="px-3 text-right tabular-nums">
                    {totalValue(c.col)}
                  </td>
                ))}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
        {rows.length === 0 && (
          <p className="py-10 text-center text-[13px] text-cp-ink-3">
            Ningún cliente coincide con los filtros.
          </p>
        )}
      </div>
      {rows.length > 0 && (
        <p className="pt-2 text-right text-[13px] text-cp-ink-3">
          {rows.length.toLocaleString("es-CO")} clientes
        </p>
      )}
    </div>
  );
}
