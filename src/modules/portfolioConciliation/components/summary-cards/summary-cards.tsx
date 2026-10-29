"use client";

import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import {
  ConciliationStatus,
  IConciliationSummary
} from "@/types/portfolioConciliation/IPortfolioConciliation";
import { CONCILIATION_STATUSES, STATUS_META } from "../../constants";

interface Props {
  summary: IConciliationSummary;
  selected: ConciliationStatus | null;
  onSelect: (status: ConciliationStatus | null) => void;
}

/** Totales por status_cashport; cada tarjeta filtra la tabla. */
const SummaryCards = ({ summary, selected, onSelect }: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const money = (amount: number) => formatMoney(amount, { hideDecimals: true });

  const cardClass = (active: boolean) =>
    cn(
      "flex min-w-0 flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
      active ? "border-foreground bg-white" : "border-[#ececec] bg-[#fafafa] hover:border-[#d6d6d6]"
    );

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
      <button type="button" onClick={() => onSelect(null)} className={cardClass(!selected)}>
        <span className="text-xs text-[#444]">Todos los documentos</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatNumber(summary.total.count)}
        </span>
        <span className="max-w-full truncate text-[11px] text-[#8a8a8a]">
          Cliente {money(summary.total.client_amount)}
        </span>
      </button>

      {CONCILIATION_STATUSES.map((status) => {
        const totals = summary.by_status[status];
        const meta = STATUS_META[status];
        return (
          <button
            key={status}
            type="button"
            onClick={() => onSelect(selected === status ? null : status)}
            className={cardClass(selected === status)}
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-[#444]">
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: meta.dot }}
              />
              {meta.plural}
            </span>
            <span className="text-lg font-semibold tabular-nums">{formatNumber(totals.count)}</span>
            <span className="max-w-full truncate text-[11px] text-[#8a8a8a]">
              {status === "NO_EXISTE"
                ? `Cliente ${money(totals.client_amount)} · ${meta.hint.toLowerCase()}`
                : `Cliente ${money(totals.client_amount)} · Cashport ${money(totals.cashport_amount)}`}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SummaryCards;
