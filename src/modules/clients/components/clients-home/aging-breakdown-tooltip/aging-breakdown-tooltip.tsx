"use client";

import { useTranslations } from "use-intl";

import type { ClientsHomeAgingAmounts, IClientsHomeRow } from "@/types/clients/IClientsHome";
import { AGING_BUCKETS } from "../../../constants/clients-home";
import { fmt } from "../../../utils/clients-home-format";
import { useClientsHomeLabels } from "../../../hooks/clients-home/use-clients-home-labels";

const sum = (a: ClientsHomeAgingAmounts) => AGING_BUCKETS.reduce((acc, b) => acc + a[b.key], 0);

/** Ancho y alto aproximado (con la fila PNA), para ubicarlo arriba o abajo de la celda. */
export const AGING_TIP_SIZE = { width: 760, height: 250 };

/**
 * Tooltip de la celda Cartera: Facturas, Saldos y Notas por edad, con su total.
 * Si el proyecto resta los PNA de la cartera, van en su propia fila (sin edad,
 * solo en la columna Total) para que el total cuadre con la columna Cartera.
 */
export default function AgingBreakdownTooltip({ row }: { row: IClientsHomeRow }) {
  const t = useTranslations("clients.home.agingTip");
  const labels = useClientsHomeLabels();
  const pna = row.breakdown.unappliedPayments ?? 0;
  const groups: {
    key: string;
    label: string;
    values: ClientsHomeAgingAmounts | null;
    extra: number;
    total: boolean;
  }[] = [
    {
      key: "invoices",
      label: t("invoices"),
      values: row.breakdown.invoices,
      extra: 0,
      total: false
    },
    {
      key: "balances",
      label: t("balances"),
      values: row.breakdown.balances,
      extra: 0,
      total: false
    },
    {
      key: "creditNotes",
      label: t("creditNotes"),
      values: row.breakdown.creditNotes,
      extra: 0,
      total: false
    },
    ...(pna
      ? [{ key: "pna", label: t("unappliedPayments"), values: null, extra: pna, total: false }]
      : []),
    { key: "total", label: t("total"), values: row.breakdown.total, extra: pna, total: true }
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
    <div className="box-border flex w-[760px] max-w-[calc(100*var(--vw)-16px)] flex-col gap-2 rounded-xl bg-[#141414] px-3.5 py-3 text-[13px] text-white shadow-[0_12px_32px_rgba(0,0,0,.22)]">
      <div className="truncate border-b border-[#2e2e2e] pb-2 text-[13px] font-semibold">
        {row.clientName}
      </div>
      <div
        className="grid items-center gap-x-2.5 gap-y-[7px] tabular-nums"
        style={{ gridTemplateColumns: `76px repeat(${AGING_BUCKETS.length + 1}, minmax(0,1fr))` }}
      >
        <span />
        {AGING_BUCKETS.map((b) => (
          <span
            key={b.key}
            className="flex items-center justify-end gap-[5px] whitespace-nowrap text-[#bdbdbd]"
          >
            <span className="h-1.5 w-1.5 rounded-sm" style={{ background: b.color }} />
            {labels.aging(b.key)}
          </span>
        ))}
        <span className="whitespace-nowrap text-right font-semibold">{t("total")}</span>
        {groups.map((g) => {
          const border = g.total ? "#5a5a5a" : "#2e2e2e";
          return [
            <span
              key={`${g.key}-label`}
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
              cell(g.values ? g.values[b.key] : 0, g.total, border, `${g.key}-${b.key}`)
            ),
            cell((g.values ? sum(g.values) : 0) + g.extra, true, border, `${g.key}-total`)
          ];
        })}
      </div>
    </div>
  );
}
