"use client";

import type { ClientsHomeAgingAmounts, IClientsHomeRow } from "@/types/clients/IClientsHome";
import { AGING_BUCKETS } from "../../../constants/clients-home";
import { fmt } from "../../../utils/clients-home-format";

const sum = (a: ClientsHomeAgingAmounts) => AGING_BUCKETS.reduce((acc, b) => acc + a[b.key], 0);

/** Ancho y alto aproximado, para ubicarlo arriba o abajo de la celda. */
export const AGING_TIP_SIZE = { width: 760, height: 210 };

/** Tooltip de la celda Cartera: Facturas, Saldos y Notas por edad, con su total. */
export default function AgingBreakdownTooltip({ row }: { row: IClientsHomeRow }) {
  const groups = [
    { label: "Facturas", values: row.breakdown.invoices, total: false },
    { label: "Saldos", values: row.breakdown.balances, total: false },
    { label: "Notas", values: row.breakdown.creditNotes, total: false },
    { label: "Total", values: row.breakdown.total, total: true }
  ];

  const cell = (v: number, bold: boolean, border: string, key: string) => (
    <span
      key={key}
      className="whitespace-nowrap pt-[7px] text-right"
      style={{
        borderTop: `1px solid ${border}`,
        fontWeight: bold ? 600 : 500,
        color: v < 0 ? "#ff9a7a" : v ? "#fff" : "#6b6b6b"
      }}
    >
      {v ? fmt(v) : "—"}
    </span>
  );

  return (
    <div className="box-border flex w-[760px] max-w-[calc(100vw-16px)] flex-col gap-2 rounded-xl bg-[#141414] px-3.5 py-3 text-xs text-white shadow-[0_12px_32px_rgba(0,0,0,.22)]">
      <div className="truncate border-b border-[#2e2e2e] pb-2 text-[12.5px] font-semibold">
        {row.clientName}
      </div>
      <div
        className="grid items-center gap-x-2.5 gap-y-[7px] tabular-nums"
        style={{ gridTemplateColumns: `62px repeat(${AGING_BUCKETS.length + 1}, minmax(0,1fr))` }}
      >
        <span />
        {AGING_BUCKETS.map((b) => (
          <span
            key={b.key}
            className="flex items-center justify-end gap-[5px] whitespace-nowrap text-[#bdbdbd]"
          >
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
        <span className="whitespace-nowrap text-right font-semibold">Total</span>
        {groups.map((g) => {
          const border = g.total ? "#5a5a5a" : "#2e2e2e";
          return [
            <span
              key={`${g.label}-label`}
              className="whitespace-nowrap pt-[7px]"
              style={{
                color: g.total ? "#fff" : "#bdbdbd",
                fontWeight: g.total ? 600 : 400,
                borderTop: `1px solid ${border}`
              }}
            >
              {g.label}
            </span>,
            ...AGING_BUCKETS.map((b) =>
              cell(g.values[b.key], g.total, border, `${g.label}-${b.key}`)
            ),
            cell(sum(g.values), true, border, `${g.label}-total`)
          ];
        })}
      </div>
    </div>
  );
}
