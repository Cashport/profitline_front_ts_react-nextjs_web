import React from "react";
import { X } from "lucide-react";

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

    tags.push(
      <div
        key={cat.key}
        className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
      >
        <span className="text-muted-foreground font-medium">{cat.label}:</span>
        <span className="font-bold text-foreground">{formatTagValue(cat, items)}</span>
        <button
          type="button"
          onClick={() => onClearCategory(cat.key)}
          className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline px-2"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
}
