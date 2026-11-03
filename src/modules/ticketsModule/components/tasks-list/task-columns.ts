import { useEffect, useState, type RefObject } from "react";

import type { ITaskConfig, ITaskFieldConfig, TaskFieldKey } from "@/types/tickets/ITickets";
import { TASK_COLUMN_LAYOUT } from "../../constants";

const ROW_PADDING_X = 32;
const COLUMN_GAP = 12;

/**
 * Columnas visibles: los campos del proyecto con `show_in_list`, sin el campo
 * por el que se agrupa (ya está en el encabezado del grupo, como en el
 * prototipo). Si no caben en el ancho, se esconden las de menor prioridad
 * (DESIGN.md §7: nunca scroll horizontal).
 */
export function visibleColumns(
  config: ITaskConfig,
  groupBy: TaskFieldKey | null,
  width: number
): ITaskFieldConfig[] {
  const columns = config.fields
    .filter((f) => f.show_in_list && f.key !== groupBy)
    .sort((a, b) => a.order - b.order);
  if (!width) return columns;

  const needed = (cols: ITaskFieldConfig[]) =>
    cols.reduce((acc, c) => acc + TASK_COLUMN_LAYOUT[c.key].min, 0) +
    COLUMN_GAP * Math.max(0, cols.length - 1) +
    ROW_PADDING_X;

  const kept = [...columns];
  while (kept.length > 1 && needed(kept) > width) {
    let lowest = -1;
    kept.forEach((c, i) => {
      const p = TASK_COLUMN_LAYOUT[c.key].priority;
      if (p !== Infinity && (lowest < 0 || p < TASK_COLUMN_LAYOUT[kept[lowest].key].priority)) {
        lowest = i;
      }
    });
    if (lowest < 0) break;
    kept.splice(lowest, 1);
  }
  return kept;
}

export const gridTemplate = (columns: ITaskFieldConfig[]) =>
  columns.map((c) => TASK_COLUMN_LAYOUT[c.key].width).join(" ");

/** Ancho del contenedor (ResizeObserver), para decidir qué columnas caben. */
export function useElementWidth(ref: RefObject<HTMLElement>) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
