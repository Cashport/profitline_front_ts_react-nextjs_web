"use client";

import React, { useState } from "react";
import { Filter, X } from "lucide-react";

import type { FilterModalProps, FilterOptionItem, FilterSelection } from "./FilterModal.types";
import FilterTrigger from "./components/FilterTrigger";
import ActiveFilterTags from "./components/ActiveFilterTags";
import FilterSidebar from "./components/FilterSidebar";
import FilterOptionsList from "./components/FilterOptionsList";
import FilterModalFooter from "./components/FilterModalFooter";

const emptyOptionSelection = (categories: FilterModalProps["categories"]): FilterSelection => {
  const empty: FilterSelection = {};
  categories.forEach((c) => {
    if (c.kind !== "custom") empty[c.key] = [];
  });
  return empty;
};

export default function FilterModal({
  categories,
  value,
  onApply,
  onValueChange,
  onClearAll,
  onOpen,
  onClearDraft,
  onCategoryOpen,
  onRetryCategory,
  formatTagValue,
  isLoading,
  trigger,
  barEnd
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(categories[0]?.key ?? "");
  const [searchTerm, setSearchTerm] = useState("");
  const [draft, setDraft] = useState<FilterSelection>(value);

  const activeCategory = categories.find((c) => c.key === activeTab) ?? categories[0];

  const activeFiltersCount = categories.reduce(
    (acc, cat) =>
      acc + (cat.kind === "custom" ? (cat.renderTag?.() ? 1 : 0) : value[cat.key]?.length || 0),
    0
  );

  const openModal = () => {
    setDraft({ ...value });
    setSearchTerm("");
    const first = categories[0]?.key ?? "";
    setActiveTab(first);
    setIsOpen(true);
    onOpen?.();
    if (first) onCategoryOpen?.(first);
  };

  const selectTab = (key: string) => {
    setActiveTab(key);
    setSearchTerm("");
    onCategoryOpen?.(key);
  };

  const toggleOption = (item: FilterOptionItem) => {
    const isSingle = activeCategory?.selectMode === "single";
    setDraft((prev) => {
      const current = prev[activeTab] || [];
      if (isSingle) return { ...prev, [activeTab]: [item] };
      const exists = current.some((v) => v.id === item.id);
      return {
        ...prev,
        [activeTab]: exists ? current.filter((v) => v.id !== item.id) : [...current, item]
      };
    });
  };

  const toggleAll = (filtered: FilterOptionItem[], isAllSelected: boolean) => {
    setDraft((prev) => {
      const current = prev[activeTab] || [];
      if (isAllSelected) {
        const ids = new Set(filtered.map((o) => o.id));
        return { ...prev, [activeTab]: current.filter((v) => !ids.has(v.id)) };
      }
      const existing = new Set(current.map((o) => o.id));
      const toAdd = filtered.filter((o) => !existing.has(o.id));
      return { ...prev, [activeTab]: [...current, ...toAdd] };
    });
  };

  const clearDraft = () => {
    setDraft(emptyOptionSelection(categories));
    onClearDraft?.();
  };

  const applyFilters = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const clearCategoryCommitted = (key: string) => {
    onValueChange({ ...value, [key]: [] });
  };

  const clearAllCommitted = () => {
    if (onClearAll) onClearAll();
    else onValueChange(emptyOptionSelection(categories));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <FilterTrigger
          count={activeFiltersCount}
          onClick={openModal}
          disabled={isLoading}
          label={trigger?.label}
          className={trigger?.className}
          showChevron={trigger?.showChevron}
        />

        <ActiveFilterTags
          categories={categories}
          value={value}
          activeCount={activeFiltersCount}
          onClearCategory={clearCategoryCommitted}
          onClearAll={clearAllCommitted}
          formatTagValue={formatTagValue}
        />

        {barEnd}
      </div>

      {isOpen && activeCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-card border border-border w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    Filtros Avanzados
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Encuentra y selecciona múltiples opciones
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-1 min-h-0 bg-background/30">
              <FilterSidebar
                categories={categories}
                activeTab={activeTab}
                draft={draft}
                onSelect={selectTab}
              />

              <FilterOptionsList
                category={activeCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedItems={draft[activeTab] || []}
                onToggleOption={toggleOption}
                onToggleAll={toggleAll}
                onRetry={() => onRetryCategory?.(activeTab)}
              />
            </div>

            <FilterModalFooter
              onClearAll={clearDraft}
              onCancel={() => setIsOpen(false)}
              onApply={applyFilters}
            />
          </div>
        </div>
      )}
    </>
  );
}
