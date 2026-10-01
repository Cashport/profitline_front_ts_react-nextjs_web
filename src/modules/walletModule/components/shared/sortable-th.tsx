"use client";

import { cn } from "@/utils/utils";
import type { SortState } from "../../types";

interface SortableThProps {
  col: string;
  label: string;
  align?: "left" | "right";
  sort: SortState;
  onSort: (col: string) => void;
  className?: string;
}

/** Encabezado ordenable: ↕ inactivo, ▲/▼ según la dirección activa. */
export default function SortableTh({
  col,
  label,
  align = "left",
  sort,
  onSort,
  className
}: SortableThProps) {
  const active = sort.col === col;

  return (
    <th
      scope="col"
      onClick={() => onSort(col)}
      className={cn(
        "cursor-pointer select-none whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors",
        align === "right" ? "text-right" : "text-left",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {label}
      <span className={cn("ml-1 text-[8px]", active ? "text-primary" : "opacity-35")}>
        {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );
}
