"use client";

import { cn } from "@/utils/utils";

import { STATUS_LABELS, STATUS_ORDER } from "../../constants";
import type { AdvisorStatus, IVisitsPalette } from "../../types";

interface StatusChipsProps {
  counts: Partial<Record<AdvisorStatus, number>>;
  /** Comparte la selección con la categoría Estado de "Filtrar". */
  selected: AdvisorStatus[];
  onToggle: (status: AdvisorStatus) => void;
  palette: IVisitsPalette;
}

/** Filtro rápido por estado; sólo aparecen los estados con asesores (o ya elegidos). */
export default function StatusChips({ counts, selected, onToggle, palette }: StatusChipsProps) {
  const statuses = STATUS_ORDER.filter((s) => counts[s] || selected.includes(s));

  return (
    <div
      role="group"
      aria-label="Filtrar por estado"
      className="flex min-w-0 items-center gap-1.5 overflow-x-auto pr-[18px] [mask-image:linear-gradient(90deg,#000_88%,transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {statuses.map((s) => {
        const active = selected.includes(s);
        return (
          <button
            key={s}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(s)}
            className={cn(
              "flex h-[30px] shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card px-[11px] text-xs font-medium text-muted-foreground transition-colors hover:text-foreground max-[1200px]:px-2",
              active && "border-wallet-accent bg-wallet-accent-soft text-foreground"
            )}
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: palette.status[s] }} />
            {STATUS_LABELS[s]}
            <span className="text-[10px] text-muted-foreground max-[1200px]:hidden">
              {counts[s] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
