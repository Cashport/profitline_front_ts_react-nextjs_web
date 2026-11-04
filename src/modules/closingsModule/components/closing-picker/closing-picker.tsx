"use client";

import { Dropdown } from "antd";
import { CaretDown, LockSimple } from "phosphor-react";

import type { IClosingInfo } from "@/types/closings/IClosings";
import { cn } from "@/utils/utils";

import { formatDate, periodLabel } from "../../utils/format";

interface Props {
  closings: IClosingInfo[];
  value: string;
  onChange: (period: string) => void;
}

/**
 * Chip del cierre junto al título (mismo lugar y medida que el corte de HeaderCutoff): el
 * candado dice que la cifra es fija al corte, no un dato en vivo.
 */
export default function ClosingPicker({ closings, value, onChange }: Props) {
  const selected = closings.find((c) => c.period === value) ?? closings[0];

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        selectable: true,
        selectedKeys: [value],
        onClick: ({ key }) => onChange(key),
        items: closings.map((c) => ({
          key: c.period,
          label: (
            <span className="flex min-w-[240px] items-center justify-between gap-4 py-0.5 text-[13px]">
              <span className="font-medium text-cp-ink">{periodLabel(c.period)}</span>
              <span className="text-cp-ink-3">Corte {formatDate(c.cutoffDate)}</span>
            </span>
          )
        }))
      }}
    >
      <button
        type="button"
        title={`Cargado el ${formatDate(selected.loadedAt)} por ${selected.loadedBy}`}
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg bg-cp-surface px-3 text-[13px] text-cp-ink-2",
          "hover:text-cp-ink"
        )}
      >
        <LockSimple size={14} weight="bold" className="text-cp-lime-dark" />
        <span>
          Cierre{" "}
          <span className="font-semibold text-cp-ink">
            {periodLabel(selected.period).toLowerCase()}
          </span>
        </span>
        <span className="h-4 w-px bg-cp-line" />
        <span className="text-cp-ink-3">Corte {formatDate(selected.cutoffDate)}</span>
        <CaretDown size={12} weight="bold" />
      </button>
    </Dropdown>
  );
}
