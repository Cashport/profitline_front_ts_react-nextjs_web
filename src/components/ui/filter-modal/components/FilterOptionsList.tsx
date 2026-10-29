import React from "react";
import { Loader2, Search, X } from "lucide-react";

import { cn } from "@/utils/utils";
import type { FilterCategoryConfig, FilterOptionItem } from "../FilterModal.types";
import SearchField from "@/components/ui/search-field/search-field";

interface FilterOptionsListProps {
  category: FilterCategoryConfig;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: FilterOptionItem[];
  onToggleOption: (item: FilterOptionItem) => void;
  onToggleAll: (filtered: FilterOptionItem[], isAllSelected: boolean) => void;
  onRetry: () => void;
}

const MetaBar = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2.5 flex items-center justify-between rounded-lg bg-cp-bg px-3 py-2">
    {children}
  </div>
);

const MetaLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[13px] font-semibold text-cp-ink-2">
    {children}
  </span>
);

const EmptyState = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-cp-ink-3">
    {icon}
    {children}
  </div>
);

/** Panel derecho del modal (docs/DESIGN.md §6): buscador, "N RESULTADOS" y opciones en círculo. */
export default function FilterOptionsList({
  category,
  searchTerm,
  onSearchChange,
  selectedItems,
  onToggleOption,
  onToggleAll,
  onRetry
}: FilterOptionsListProps) {
  const isCustom = category.kind === "custom";
  const isSingle = category.selectMode === "single";
  const options = category.options ?? [];
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isSelected = (id: string) => selectedItems.some((v) => v.id === id);
  const isAllSelected =
    filteredOptions.length > 0 && filteredOptions.every((opt) => isSelected(opt.id));

  const isLoading = category.status === "loading";
  const isError = category.status === "error";
  const canSelectAll = !isSingle && filteredOptions.length > 0;

  if (isCustom) {
    return (
      <div className="min-w-0 flex-1 overflow-auto px-[22px] py-[18px] text-cp-ink">
        {category.metaLabel && (
          <MetaBar>
            <MetaLabel>{category.metaLabel}</MetaLabel>
          </MetaBar>
        )}
        {category.renderPanel?.()}
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 overflow-auto px-[22px] py-[18px] text-cp-ink">
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder={`Buscar en ${category.label.toLowerCase()}...`}
        className="mb-3"
      />

      <MetaBar>
        <MetaLabel>{category.metaLabel ?? `${filteredOptions.length} resultados`}</MetaLabel>
        {canSelectAll && (
          <button
            type="button"
            onClick={() => onToggleAll(filteredOptions, isAllSelected)}
            className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#8aa30f]"
          >
            {isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>
        )}
      </MetaBar>

      {category.renderAboveOptions?.()}

      {isLoading ? (
        <EmptyState icon={<Loader2 className="h-7 w-7 animate-spin opacity-60" />}>
          <p className="text-[13px]">Cargando opciones...</p>
        </EmptyState>
      ) : isError ? (
        <EmptyState icon={<X className="h-7 w-7 opacity-30" />}>
          <p className="text-[13px]">No se pudieron cargar las opciones</p>
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#8aa30f]"
          >
            Reintentar
          </button>
        </EmptyState>
      ) : filteredOptions.length === 0 ? (
        <EmptyState icon={<Search className="h-7 w-7 opacity-30" />}>
          <p className="text-[13px]">No se encontraron resultados</p>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3 gap-y-1">
          {filteredOptions.map((opt) => {
            const on = isSelected(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggleOption(opt)}
                title={opt.name}
                className="flex h-10 min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 text-left text-[13px] text-cp-ink hover:bg-cp-subtle"
              >
                <span
                  className={cn(
                    "box-border flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]",
                    on ? "border-[#9bb514] bg-cp-lime-tint" : "border-[#cfcfcf] bg-cp-surface"
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", on ? "bg-[#9bb514]" : "bg-transparent")}
                  />
                </span>
                <span className="truncate">{opt.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
