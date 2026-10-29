"use client";

import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
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

/** Encabezado ordenable con el estilo de Clientes (docs/DESIGN.md §7): fondo blanco,
    13.5px/600 #141414 y los triángulos de orden de `SortArrows`. */
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
        "cursor-pointer select-none whitespace-nowrap border-b border-cp-line bg-cp-surface px-3 py-3 text-[13.5px] font-semibold text-cp-ink",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      <span
        className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}
      >
        {label}
        <SortArrows dir={active ? sort.dir : null} />
      </span>
    </th>
  );
}
