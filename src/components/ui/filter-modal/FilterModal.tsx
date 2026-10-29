"use client";

import React, { useEffect, useState } from "react";

import type { FilterModalProps, FilterOptionItem, FilterSelection } from "./FilterModal.types";
import FilterTrigger from "./components/FilterTrigger";
import ActiveFilterTags from "./components/ActiveFilterTags";
import FilterSidebar from "./components/FilterSidebar";
import FilterOptionsList from "./components/FilterOptionsList";
import FilterModalFooter from "./components/FilterModalFooter";
import {
  FilterChips,
  type FilterChipItem
} from "@/components/ui/page-header-controls/page-header-controls";

const defaultTagValue = (_cat: unknown, items: FilterOptionItem[]) =>
  items.length === 1 ? items[0].name : `${items.length} seleccionados`;

const emptyOptionSelection = (categories: FilterModalProps["categories"]): FilterSelection => {
  const empty: FilterSelection = {};
  categories.forEach((c) => {
    if (c.kind !== "custom") empty[c.key] = [];
  });
  return empty;
};

/**
 * "Filtros Avanzados" (docs/DESIGN.md §6). Mismo diseño que el modal del Home de Clientes:
 * categorías a la izquierda, opciones con círculo de selección y se aplica con "Aplicar Filtros".
 */
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
  barEnd,
  hideTags,
  inHeader,
  onDraftChange
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

  useEffect(() => {
    if (isOpen) onDraftChange?.(draft);
  }, [draft, isOpen]);

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
      const exists = current.some((v) => v.id === item.id);
      if (isSingle) return { ...prev, [activeTab]: exists ? [] : [item] };
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

  const triggerNode = (
    <FilterTrigger
      count={activeFiltersCount}
      onClick={openModal}
      disabled={isLoading}
      label={trigger?.label}
      className={trigger?.className}
      showChevron={trigger?.showChevron}
    />
  );

  const headerChips: FilterChipItem[] = categories.flatMap((cat) => {
    const items = cat.kind === "custom" ? [] : value[cat.key] || [];
    if (!items.length) return [];
    return [
      {
        key: cat.key,
        label: cat.label,
        value: (formatTagValue ?? defaultTagValue)(cat, items),
        onRemove: () => clearCategoryCommitted(cat.key)
      }
    ];
  });

  return (
    <>
      {inHeader ? (
        <>
          {/* Las categorías custom (p. ej. Fecha) traen su propio chip: va antes que los demás. */}
          {!hideTags &&
            categories.map((cat) => {
              const node = cat.kind === "custom" ? cat.renderTag?.() : null;
              return node ? (
                <span key={cat.key} className="flex shrink-0 items-center">
                  {node}
                </span>
              ) : null;
            })}
          {!hideTags && <FilterChips chips={headerChips} />}
          {triggerNode}
          {barEnd}
        </>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {triggerNode}

          {!hideTags && (
            <ActiveFilterTags
              categories={categories}
              value={value}
              activeCount={activeFiltersCount}
              onClearCategory={clearCategoryCommitted}
              onClearAll={clearAllCommitted}
              formatTagValue={formatTagValue}
            />
          )}

          {barEnd}
        </div>
      )}

      {isOpen && activeCategory && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(20,20,20,.38)] p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[calc(100*var(--vh)-48px)] w-[900px] max-w-full flex-col overflow-hidden rounded-2xl bg-cp-surface text-cp-ink shadow-[0_24px_64px_rgba(0,0,0,.22)]"
          >
            <div className="flex items-center gap-3 border-b border-cp-line px-[22px] py-[18px]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cp-lime-tint">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="#cbe71e"
                  stroke="#9bb514"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                >
                  <path d="M3 5h18l-7 8v6l-4 2v-8z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-semibold">Filtros Avanzados</div>
                <div className="text-[13px] text-cp-ink-3">
                  Encuentra y selecciona múltiples opciones
                </div>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent text-xl text-cp-ink-2 hover:bg-cp-muted"
              >
                ×
              </button>
            </div>

            <div className="flex min-h-[380px] flex-1 overflow-hidden">
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
