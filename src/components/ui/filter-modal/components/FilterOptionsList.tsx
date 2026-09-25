import React from "react";
import { Search, Check, Loader2, X } from "lucide-react";

import type { FilterCategoryConfig, FilterOptionItem } from "../FilterModal.types";

interface FilterOptionsListProps {
  category: FilterCategoryConfig;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedItems: FilterOptionItem[];
  onToggleOption: (item: FilterOptionItem) => void;
  onToggleAll: (filtered: FilterOptionItem[], isAllSelected: boolean) => void;
  onRetry: () => void;
}

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
  const showMeta = !isCustom || !!category.metaLabel;
  const canSelectAll = !isCustom && !isSingle && filteredOptions.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-card">
      <div className="p-4 border-b border-border bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Buscar en ${category.label.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {showMeta && (
        <div className="px-5 py-2.5 border-b border-border flex justify-between items-center bg-secondary/30">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            {category.metaLabel ?? `${filteredOptions.length} resultados`}
          </span>
          {canSelectAll && (
            <button
              type="button"
              onClick={() => onToggleAll(filteredOptions, isAllSelected)}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {isCustom ? (
          category.renderPanel?.()
        ) : (
          <>
            {category.renderAboveOptions?.()}
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-8 h-8 mb-3 animate-spin opacity-60" />
                <p className="text-sm">Cargando opciones...</p>
              </div>
            ) : isError ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <X className="w-8 h-8 opacity-20 mb-3" />
                <p className="text-sm mb-3">No se pudieron cargar las opciones</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Search className="w-8 h-8 opacity-20 mb-3" />
                <p className="text-sm">No se encontraron resultados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 auto-rows-max">
                {filteredOptions.map((opt) => {
                  const selected = isSelected(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                        selected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/60"
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 transition-colors border ${
                          isSingle ? "rounded-full" : "rounded"
                        } ${
                          selected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background group-hover:border-primary/50"
                        }`}
                      >
                        {selected &&
                          (isSingle ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                          ) : (
                            <Check className="w-3 h-3" strokeWidth={3} />
                          ))}
                      </div>
                      <span
                        className={`text-sm leading-tight select-none ${
                          selected
                            ? "text-foreground font-bold"
                            : "text-foreground/80 font-medium group-hover:text-foreground"
                        }`}
                        title={opt.name}
                      >
                        {opt.name}
                      </span>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleOption(opt)}
                        className="hidden"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
