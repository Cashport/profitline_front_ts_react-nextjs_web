import React from "react";

import type { FilterCategoryConfig, FilterOptionItem, FilterSelection } from "../FilterModal.types";

interface ActiveFilterTagsProps {
  categories: FilterCategoryConfig[];
  value: FilterSelection;
  activeCount: number;
  onClearCategory: (key: string) => void;
  onClearAll: () => void;
  formatTagValue?: (cat: FilterCategoryConfig, items: FilterOptionItem[]) => string;
}

const defaultFormat = (_cat: FilterCategoryConfig, items: FilterOptionItem[]) =>
  items.length === 1 ? items[0].name : `${items.length} seleccionados`;

/** Chips de filtros aplicados, con el mismo estilo que los del header (docs/DESIGN.md §8). */
export default function ActiveFilterTags({
  categories,
  value,
  activeCount,
  onClearCategory,
  onClearAll,
  formatTagValue = defaultFormat
}: ActiveFilterTagsProps) {
  const tags: React.ReactNode[] = [];

  categories.forEach((cat) => {
    if (cat.kind === "custom") {
      const node = cat.renderTag?.();
      if (node) tags.push(<React.Fragment key={cat.key}>{node}</React.Fragment>);
      return;
    }

    const items = value[cat.key] || [];
    if (items.length === 0) return;
    const text = formatTagValue(cat, items);

    tags.push(
      <span
        key={cat.key}
        title={`${cat.label}: ${text}`}
        className="box-border flex h-[var(--chip-h)] max-w-full items-center gap-1.5 whitespace-nowrap rounded-[9px] border border-cp-line-2 bg-cp-surface pl-3 pr-1 text-[15px] text-cp-ink"
      >
        <b className="shrink-0 font-semibold">{cat.label}:</b>
        <span className="min-w-0 truncate">{text}</span>
        <button
          type="button"
          onClick={() => onClearCategory(cat.key)}
          aria-label={`Quitar ${cat.label}`}
          className="flex h-full shrink-0 cursor-pointer items-center border-0 bg-transparent px-1.5 text-[18px] leading-none text-cp-ink-4 hover:text-cp-ink"
        >
          ×
        </button>
      </span>
    );
  });

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {tags}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="cursor-pointer border-0 bg-transparent px-2 text-[14px] font-semibold text-cp-ink-2 hover:underline"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
}
