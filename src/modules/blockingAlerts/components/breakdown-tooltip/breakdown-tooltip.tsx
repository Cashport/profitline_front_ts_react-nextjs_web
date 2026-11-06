"use client";

import { useAppStore } from "@/lib/store/store";
import type {
  IBlockingAlertAging,
  IBlockingAlertBuckets
} from "@/types/blockingAlerts/IBlockingAlerts";

import { AGING_SEGMENTS } from "../../constants";

const SHORT_LABELS: Record<keyof IBlockingAlertBuckets, string> = {
  current: "Al día",
  pastDue1To60: "1–60",
  pastDueOver60: "+60"
};

const sum = (b: IBlockingAlertBuckets) => b.current + b.pastDue1To60 + b.pastDueOver60;

interface BreakdownTooltipProps {
  title: string;
  aging: IBlockingAlertAging;
}

/**
 * Lleva de la leyenda de la tarjeta a su total: facturas + saldos = subtotal por tramo
 * (la barra); menos notas y PNA = cartera. PNA y total no tienen tramo, solo columna Total.
 */
export default function BreakdownTooltip({ title, aging }: BreakdownTooltipProps) {
  const formatMoney = useAppStore((s) => s.formatMoney);
  const { invoices, balances, creditNotes, unappliedPayments } = aging.breakdown;
  const rows: {
    label: string;
    values: IBlockingAlertBuckets | null;
    total: number;
    strong: boolean;
  }[] = [
    { label: "Facturas", values: invoices, total: sum(invoices), strong: false },
    { label: "Saldos", values: balances, total: sum(balances), strong: false },
    { label: "Subtotal", values: aging, total: sum(aging), strong: true },
    { label: "Notas", values: creditNotes, total: sum(creditNotes), strong: false },
    ...(unappliedPayments
      ? [{ label: "PNA", values: null, total: unappliedPayments, strong: false }]
      : []),
    { label: "Total", values: null, total: aging.portfolio, strong: true }
  ];

  const cell = (v: number | null, bold: boolean, border: string, key: string) => (
    <span
      key={key}
      className="whitespace-nowrap pt-[7px] text-right"
      style={{
        borderTop: `1px solid ${border}`,
        fontWeight: bold ? 600 : 500,
        color: v !== null && v < 0 ? "#ff9a7a" : v ? "#fff" : "#6b6b6b"
      }}
    >
      {v === null ? " " : v ? formatMoney(v, { hideDecimals: true }) : "—"}
    </span>
  );

  return (
    <div className="max-w-[calc(100*var(--vw)-16px)] overflow-x-auto">
      <div className="box-border flex w-max min-w-full flex-col gap-2 px-3.5 py-3 text-[13px] text-white">
        <div className="w-0 min-w-full truncate border-b border-[#2e2e2e] pb-2 font-semibold">
          {title}
        </div>
        <div
          className="grid items-center gap-x-4 gap-y-[7px] tabular-nums"
          style={{ gridTemplateColumns: `auto repeat(${AGING_SEGMENTS.length + 1}, auto)` }}
        >
          <span />
          {AGING_SEGMENTS.map((s) => (
            <span
              key={s.key}
              className="flex items-center justify-end gap-[5px] whitespace-nowrap text-[#bdbdbd]"
            >
              <span className="h-1.5 w-1.5 rounded-sm" style={{ background: s.color }} />
              {SHORT_LABELS[s.key]}
            </span>
          ))}
          <span className="whitespace-nowrap text-right font-semibold">Total</span>
          {rows.map((r) => {
            const border = r.strong ? "#5a5a5a" : "#2e2e2e";
            return [
              <span
                key={`${r.label}-label`}
                className="whitespace-nowrap pt-[7px]"
                style={{
                  color: r.strong ? "#fff" : "#bdbdbd",
                  fontWeight: r.strong ? 600 : 400,
                  borderTop: `1px solid ${border}`
                }}
              >
                {r.label}
              </span>,
              ...AGING_SEGMENTS.map((s) =>
                cell(r.values ? r.values[s.key] : null, r.strong, border, `${r.label}-${s.key}`)
              ),
              cell(r.total, true, border, `${r.label}-total`)
            ];
          })}
        </div>
      </div>
    </div>
  );
}
