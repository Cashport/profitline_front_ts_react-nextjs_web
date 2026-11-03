"use client";

import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { filterChips } from "../../utils/filters";

/**
 * Filtros activos como chips que se pueden quitar (mismo estilo que los del resto de Cashport),
 * más "Limpiar filtros" cuando hay varios. Alineados con el título del header; el pb compensa
 * el -mb-3.5 del header para dejar 12px antes del contenido.
 */
export default function FilterChips({ data }: { data?: ICollectionTower }) {
  const { filters, patch, clear } = useTowerFilters();
  const chips = filterChips(filters, data);
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-[26px] pl-[21px]">
      {chips.map((c) => (
        <span
          key={c.key}
          title={`${c.label}: ${c.value}`}
          className="box-border flex h-[var(--chip-h)] max-w-full items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-cp-line-2 bg-cp-surface pl-3 pr-1 text-[15px] text-cp-ink"
        >
          {c.label}: <b className="min-w-0 truncate font-semibold">{c.value}</b>
          <button
            type="button"
            aria-label={`Quitar ${c.label}`}
            onClick={() => patch(c.remove)}
            className="flex h-full shrink-0 cursor-pointer items-center border-0 bg-transparent px-1.5 text-[18px] leading-none text-cp-ink-4 hover:text-cp-ink"
          >
            ×
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clear}
          className="cursor-pointer border-0 bg-transparent px-2 text-[14px] font-semibold text-cp-ink-2 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
