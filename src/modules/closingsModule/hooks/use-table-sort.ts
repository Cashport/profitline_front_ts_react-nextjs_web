import { useEffect, useMemo, useRef, useState } from "react";

import type { SortState } from "@/modules/walletModule/types";

/** Orden de una tabla hecha a mano: clic en la misma columna alterna desc → asc. */
export function useTableSort<T>(
  rows: T[],
  initial: SortState,
  getValue: (row: T, col: string) => number | string
) {
  const [sort, setSort] = useState<SortState>(initial);
  const onSort = (col: string) =>
    setSort((prev) =>
      prev.col === col ? { col, dir: prev.dir === "desc" ? "asc" : "desc" } : { col, dir: "desc" }
    );
  const sorted = useMemo(() => {
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = getValue(a, sort.col);
      const vb = getValue(b, sort.col);
      if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb)) * factor;
      }
      return (va - vb) * factor;
    });
    // getValue es estable por tabla; no se incluye para no recalcular en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);
  return { sort, onSort, sorted };
}

/** Ancho del contenedor, para ocultar columnas secundarias por prioridad (DESIGN.md §7). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}
