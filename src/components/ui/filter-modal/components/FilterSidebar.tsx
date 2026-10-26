import React from "react";

import { cn } from "@/utils/utils";
import type { FilterCategoryConfig, FilterSelection } from "../FilterModal.types";

interface FilterSidebarProps {
  categories: FilterCategoryConfig[];
  activeTab: string;
  draft: FilterSelection;
  onSelect: (key: string) => void;
}

const countFor = (cat: FilterCategoryConfig, draft: FilterSelection) =>
  cat.kind === "custom" ? cat.draftCount ?? 0 : (draft[cat.key] || []).length;

/** Categorías del modal (docs/DESIGN.md §6): activa en negrita, fondo gris y barra lima. */
export default function FilterSidebar({
  categories,
  activeTab,
  draft,
  onSelect
}: FilterSidebarProps) {
  return (
    <div className="w-[120px] shrink-0 overflow-y-auto border-r border-cp-line py-2 sm:w-[240px]">
      {categories.map((cat) => {
        const selectedCount = countFor(cat, draft);
        const isActive = activeTab === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelect(cat.key)}
            className={cn(
              "relative flex h-11 w-full cursor-pointer items-center border-0 pl-[22px] pr-[18px] text-left text-sm",
              isActive ? "bg-cp-bg font-semibold text-cp-ink" : "bg-transparent text-cp-ink-2"
            )}
          >
            <span
              className={cn(
                "absolute bottom-2 left-0 top-2 w-[3px] rounded-r-[3px]",
                isActive ? "bg-cp-lime" : "bg-transparent"
              )}
            />
            <span className="flex-1 truncate">{cat.label}</span>
            <span className="mr-2 text-[11px] font-normal text-cp-ink-4">
              {selectedCount || ""}
            </span>
            <span className={isActive ? "text-cp-ink" : "text-transparent"}>&gt;</span>
          </button>
        );
      })}
    </div>
  );
}
