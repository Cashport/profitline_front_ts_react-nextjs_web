import React from "react";
import { ChevronRight } from "lucide-react";

import type { FilterCategoryConfig, FilterSelection } from "../FilterModal.types";

interface FilterSidebarProps {
  categories: FilterCategoryConfig[];
  activeTab: string;
  draft: FilterSelection;
  onSelect: (key: string) => void;
}

const countFor = (cat: FilterCategoryConfig, draft: FilterSelection) =>
  cat.kind === "custom" ? cat.draftCount ?? 0 : (draft[cat.key] || []).length;

export default function FilterSidebar({
  categories,
  activeTab,
  draft,
  onSelect
}: FilterSidebarProps) {
  return (
    <div className="w-1/3 max-w-[240px] border-r border-border bg-card/30 overflow-y-auto py-2">
      {categories.map((cat) => {
        const selectedCount = countFor(cat, draft);
        const isActive = activeTab === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelect(cat.key)}
            className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-all border-l-2 ${
              isActive
                ? "bg-secondary/80 text-foreground font-bold border-primary shadow-sm"
                : "text-muted-foreground hover:bg-secondary/40 border-transparent hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{cat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
                  }`}
                >
                  {selectedCount}
                </span>
              )}
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? "text-foreground translate-x-0" : "opacity-0 -translate-x-2"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
