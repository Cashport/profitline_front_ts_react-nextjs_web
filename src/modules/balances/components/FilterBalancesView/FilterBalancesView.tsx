"use client";

import React, { useState } from "react";
import { Filter, X, Check, Search, ChevronRight, Calendar, ChevronDown } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import {
  IBalancesFilter,
  IBalancesFilterUser,
  IBalancesFilterClient
} from "@/types/financialDiscounts/IFinancialDiscounts";

type FilterOption = { id: string; name: string };

type FilterCategory = {
  key: string;
  label: string;
};

const FILTER_CATEGORIES: FilterCategory[] = [
  { key: "kam", label: "KAM" },
  { key: "cliente", label: "Cliente" },
  { key: "motivo", label: "Motivo" },
  { key: "fecha", label: "Fecha" }
];

const DATE_PRESETS = [
  { id: "mes_actual", name: "Mes actual" },
  { id: "ultimo_mes", name: "Último mes" },
  { id: "ultimo_trimestre", name: "Último trimestre" },
  { id: "ytd", name: "YTD" },
  { id: "ultimos_12_meses", name: "Últimos 12 meses" }
];

interface FiltersBarProps {
  users: IBalancesFilterUser[];
  clients: IBalancesFilterClient[];
  motives: { id: number; name: string }[];
  value: IBalancesFilter;
  onChange: (next: IBalancesFilter) => void;
  isLoading?: boolean;
}

export function FilterBalancesView({
  users,
  clients,
  motives,
  value,
  onChange,
  isLoading
}: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(FILTER_CATEGORIES[0].key);
  const [searchTerm, setSearchTerm] = useState("");

  const [localFilters, setLocalFilters] = useState<IBalancesFilter>(value);

  const openModal = () => {
    setLocalFilters(value);
    setSearchTerm("");
    setActiveTab(FILTER_CATEGORIES[0].key);
    setIsOpen(true);
  };

  const applyFilters = () => {
    onChange(localFilters);
    setIsOpen(false);
  };

  const clearAll = () => {
    setLocalFilters({
      users: [],
      clients: [],
      motive_ids: [],
      from_date: null,
      to_date: null
    });
  };

  const toggleSelection = (category: string, optionId: string) => {
    setLocalFilters((prev) => {
      if (category === "kam") {
        const id = Number(optionId);
        const current = prev.users || [];
        const updated = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        return { ...prev, users: updated };
      }
      if (category === "cliente") {
        const current = prev.clients || [];
        const updated = current.includes(optionId)
          ? current.filter((v) => v !== optionId)
          : [...current, optionId];
        return { ...prev, clients: updated };
      }
      if (category === "motivo") {
        const id = Number(optionId);
        const current = prev.motive_ids || [];
        const updated = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
        return { ...prev, motive_ids: updated };
      }
      return prev;
    });
  };

  const activeFiltersCount =
    (value.users?.length || 0) +
    (value.clients?.length || 0) +
    (value.motive_ids?.length || 0) +
    (value.from_date || value.to_date ? 1 : 0);

  const getOptionsForCategory = (category: string): FilterOption[] => {
    if (category === "kam") {
      return users.map((u) => ({ id: String(u.id), name: u.name }));
    }
    if (category === "cliente") {
      return clients.map((c) => ({ id: c.id, name: c.name }));
    }
    if (category === "motivo") {
      return motives.map((m) => ({ id: String(m.id), name: m.name }));
    }
    if (category === "fecha") {
      return DATE_PRESETS;
    }
    return [];
  };

  const getSelectedForCategory = (category: string): string[] => {
    if (category === "kam") {
      return (localFilters.users || []).map(String);
    }
    if (category === "cliente") {
      return localFilters.clients || [];
    }
    if (category === "motivo") {
      return (localFilters.motive_ids || []).map(String);
    }
    return [];
  };

  const currentCategory = FILTER_CATEGORIES.find((c) => c.key === activeTab)!;
  const currentOptions: FilterOption[] = getOptionsForCategory(activeTab);
  const filteredOptions = currentOptions.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedInCategory = getSelectedForCategory(activeTab);

  const isAllSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedInCategory.includes(opt.id));

  const toggleAll = () => {
    const filteredIds = new Set(filteredOptions.map((o) => o.id));
    setLocalFilters((prev) => {
      if (activeTab === "kam") {
        const current = prev.users || [];
        if (isAllSelected) {
          return { ...prev, users: current.filter((id) => !filteredIds.has(String(id))) };
        } else {
          const existingIds = new Set(current.map(String));
          const toAdd = filteredOptions
            .filter((o) => !existingIds.has(o.id))
            .map((o) => Number(o.id));
          return { ...prev, users: [...current, ...toAdd] };
        }
      }
      if (activeTab === "cliente") {
        const current = prev.clients || [];
        if (isAllSelected) {
          return { ...prev, clients: current.filter((id) => !filteredIds.has(id)) };
        } else {
          const existingIds = new Set(current);
          const toAdd = filteredOptions.filter((o) => !existingIds.has(o.id)).map((o) => o.id);
          return { ...prev, clients: [...current, ...toAdd] };
        }
      }
      if (activeTab === "motivo") {
        const current = prev.motive_ids || [];
        if (isAllSelected) {
          return { ...prev, motive_ids: current.filter((id) => !filteredIds.has(String(id))) };
        } else {
          const existingIds = new Set(current.map(String));
          const toAdd = filteredOptions
            .filter((o) => !existingIds.has(o.id))
            .map((o) => Number(o.id));
          return { ...prev, motive_ids: [...current, ...toAdd] };
        }
      }
      return prev;
    });
  };

  const applyDatePreset = (presetId: string) => {
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    if (presetId === "mes_actual") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = now;
    } else if (presetId === "ultimo_mes") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (presetId === "ultimo_trimestre") {
      from = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      to = now;
    } else if (presetId === "ytd") {
      from = new Date(now.getFullYear(), 0, 1);
      to = now;
    } else if (presetId === "ultimos_12_meses") {
      from = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      to = now;
    }

    setLocalFilters((prev) => ({
      ...prev,
      from_date: from ? from.toISOString().split("T")[0] : null,
      to_date: to ? to.toISOString().split("T")[0] : null
    }));
  };

  const renderActiveTags = () => {
    const tags: React.ReactNode[] = [];

    if (value.users?.length > 0) {
      const displayValue =
        value.users.length === 1
          ? users.find((u) => u.id === value.users[0])?.name || "1 KAM"
          : `${value.users.length} KAMs`;
      tags.push(
        <div
          key="kam"
          className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
        >
          <span className="text-muted-foreground font-medium">KAM:</span>
          <span className="font-bold text-foreground">{displayValue}</span>
          <button
            onClick={() => onChange({ ...value, users: [] })}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (value.clients?.length > 0) {
      const displayValue =
        value.clients.length === 1
          ? clients.find((c) => c.id === value.clients[0])?.name || "1 Cliente"
          : `${value.clients.length} Clientes`;
      tags.push(
        <div
          key="cliente"
          className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
        >
          <span className="text-muted-foreground font-medium">Cliente:</span>
          <span className="font-bold text-foreground">{displayValue}</span>
          <button
            onClick={() => onChange({ ...value, clients: [] })}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (value.motive_ids?.length && value.motive_ids.length > 0) {
      const displayValue =
        value.motive_ids.length === 1
          ? motives.find((m) => m.id === value.motive_ids![0])?.name || "1 Motivo"
          : `${value.motive_ids.length} Motivos`;
      tags.push(
        <div
          key="motivo"
          className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
        >
          <span className="text-muted-foreground font-medium">Motivo:</span>
          <span className="font-bold text-foreground">{displayValue}</span>
          <button
            onClick={() => onChange({ ...value, motive_ids: [] })}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (value.from_date || value.to_date) {
      const displayValue =
        value.from_date && value.to_date
          ? `${value.from_date} - ${value.to_date}`
          : value.from_date || value.to_date || "";
      tags.push(
        <div
          key="fecha"
          className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
        >
          <span className="text-muted-foreground font-medium">Fecha:</span>
          <span className="font-bold text-foreground">{displayValue}</span>
          <button
            onClick={() => onChange({ ...value, from_date: null, to_date: null })}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return tags;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative shrink-0">
          <Button
            variant="outline"
            onClick={openModal}
            disabled={isLoading}
            className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderActiveTags()}
          {activeFiltersCount > 0 && (
            <button
              onClick={() =>
                onChange({
                  users: [],
                  clients: [],
                  motive_ids: [],
                  from_date: null,
                  to_date: null
                })
              }
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline px-2"
            >
              Limpiar todos
            </button>
          )}
        </div>
      </div>

      {isOpen && (
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
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-1 min-h-0 bg-background/30">
              <div className="w-1/3 max-w-[240px] border-r border-border bg-card/30 overflow-y-auto py-2">
                {FILTER_CATEGORIES.map((cat) => {
                  const selectedCount = getSelectedForCategory(cat.key).length;
                  const isActive = activeTab === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => {
                        setActiveTab(cat.key);
                        setSearchTerm("");
                      }}
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
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/20 text-primary"
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

              <div className="flex-1 flex flex-col min-w-0 bg-card">
                <div className="p-4 border-b border-border bg-background/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`Buscar en ${currentCategory.label.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/70"
                    />
                  </div>
                </div>

                <div className="px-5 py-2.5 border-b border-border flex justify-between items-center bg-secondary/30">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                    {activeTab === "fecha"
                      ? "Selecciona un periodo"
                      : `${filteredOptions.length} resultados`}
                  </span>
                  {filteredOptions.length > 0 && activeTab !== "fecha" && (
                    <button
                      onClick={toggleAll}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      {isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {activeTab === "fecha" && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <p className="text-xs font-bold text-foreground mb-3">
                          Periodos Predefinidos
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {DATE_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => applyDatePreset(preset.id)}
                              className="px-3 py-2 text-sm bg-secondary/50 hover:bg-secondary border border-border rounded-lg transition-colors text-left"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Rango Personalizado
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Desde
                            </label>
                            <input
                              type="date"
                              value={localFilters.from_date || ""}
                              onChange={(e) =>
                                setLocalFilters({
                                  ...localFilters,
                                  from_date: e.target.value || null
                                })
                              }
                              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">
                              Hasta
                            </label>
                            <input
                              type="date"
                              value={localFilters.to_date || ""}
                              onChange={(e) =>
                                setLocalFilters({
                                  ...localFilters,
                                  to_date: e.target.value || null
                                })
                              }
                              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab !== "fecha" && filteredOptions.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-8 h-8 opacity-20 mb-3" />
                      <p className="text-sm">No se encontraron resultados</p>
                    </div>
                  )}

                  {activeTab !== "fecha" && filteredOptions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 auto-rows-max">
                      {filteredOptions.map((opt) => {
                        const isSelected = selectedInCategory.includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                              isSelected
                                ? "bg-primary/5 hover:bg-primary/10"
                                : "hover:bg-secondary/60"
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 transition-colors border rounded ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background group-hover:border-primary/50"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                            </div>
                            <span
                              className={`text-sm leading-tight select-none ${
                                isSelected
                                  ? "text-foreground font-bold"
                                  : "text-foreground/80 font-medium group-hover:text-foreground"
                              }`}
                              title={opt.name}
                            >
                              {opt.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(activeTab, opt.id)}
                              className="hidden"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between bg-card/80 backdrop-blur-sm relative z-10">
              <button
                onClick={clearAll}
                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary"
              >
                Limpiar todo
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyFilters}
                  className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
