"use client";

import React, { useState } from "react";
import { Filter, X, Check, Search, ChevronRight } from "lucide-react";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import ThemeToggle from "@/modules/commerce/components/revenue-tracking/theme-toggle/theme-toggle";

const generateOptions = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);

const FILTER_CATEGORIES = [
  {
    key: "fecha",
    label: "Fecha",
    options: [
      "Hoy",
      "Ayer",
      "Últimos 7 días",
      "Mes actual",
      "Mes anterior",
      "YTD",
      "Q1",
      "Q2",
      "Q3",
      "Q4"
    ]
  },
  {
    key: "frecuencia",
    label: "Frecuencia",
    options: ["Diario", "Semanal", "Mensual", "Trimestral", "Anual"]
  },
  {
    key: "producto",
    label: "Producto",
    options: [
      "Cetaphil Limpiadora",
      "Toallitas Cetaphil",
      "Sun Oil Color",
      "Loción Hidratante",
      "Ceta HA Serum",
      "Shampoo suave",
      "Eucerin pH5",
      ...generateOptions("Producto", 193)
    ]
  },
  {
    key: "vendedor",
    label: "Vendedor",
    options: [
      "Cashport AI",
      "Juan Pérez",
      "María Gómez",
      "Carlos Ruiz",
      ...generateOptions("Vendedor", 46)
    ]
  },
  {
    key: "cliente",
    label: "Cliente",
    options: [
      "Farmasanitas",
      "Cruz Verde",
      "Vidamedical",
      "Farmacias del Ahorro",
      "Droguerías Médicas",
      ...generateOptions("Cliente", 995)
    ]
  },
  {
    key: "ciudad",
    label: "Ciudad",
    options: [
      "Bogotá",
      "Medellín",
      "Cali",
      "Barranquilla",
      "Cartagena",
      "Bucaramanga",
      ...generateOptions("Ciudad", 24)
    ]
  },
  {
    key: "lineaNegocio",
    label: "Línea de negocio",
    options: ["Dermatología", "Pediatría", "Cuidado Facial", "Corporal", "Solar"]
  },
  {
    key: "canalVenta",
    label: "Canal de venta",
    options: ["Farmacia", "Marketplace", "Directo", "Distribuidores", "Institucional"]
  }
];

export default function FiltersBar() {
  const { filters, setFilters } = useRevenueTracking();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(FILTER_CATEGORIES[0].key);
  const [searchTerm, setSearchTerm] = useState("");

  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>(filters);

  const openModal = () => {
    setLocalFilters(filters);
    setSearchTerm("");
    setActiveTab(FILTER_CATEGORIES[0].key);
    setIsOpen(true);
  };

  const applyFilters = () => {
    setFilters(localFilters);
    setIsOpen(false);
  };

  const clearAll = () => {
    const empty: Record<string, string[]> = {};
    FILTER_CATEGORIES.forEach((c) => (empty[c.key] = []));
    setLocalFilters(empty);
  };

  const toggleSelection = (category: string, value: string) => {
    setLocalFilters((prev) => {
      const current = prev[category] || [];
      const isSingleSelect = ["fecha", "frecuencia"].includes(category);

      if (isSingleSelect) {
        return { ...prev, [category]: [value] };
      }

      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const activeFiltersCount = Object.values(filters).reduce(
    (acc, curr) => acc + (curr?.length || 0),
    0
  );

  const currentCategory = FILTER_CATEGORIES.find((c) => c.key === activeTab)!;
  const filteredOptions = currentCategory.options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedInCategory = localFilters[activeTab] || [];

  const isAllSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) => selectedInCategory.includes(opt));

  const toggleAll = () => {
    if (isAllSelected) {
      setLocalFilters((prev) => ({
        ...prev,
        [activeTab]: (prev[activeTab] || []).filter((v) => !filteredOptions.includes(v))
      }));
    } else {
      setLocalFilters((prev) => {
        const newValues = new Set([...(prev[activeTab] || []), ...filteredOptions]);
        return {
          ...prev,
          [activeTab]: Array.from(newValues)
        };
      });
    }
  };

  const renderActiveTags = () => {
    const tags: React.ReactNode[] = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (!values || values.length === 0) return;

      const categoryLabel = FILTER_CATEGORIES.find((c) => c.key === key)?.label || key;
      const displayValue =
        values.length === 1 ? values[0] : `${values.length} seleccionados`;

      tags.push(
        <div
          key={key}
          className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs"
        >
          <span className="text-muted-foreground font-medium">{categoryLabel}:</span>
          <span className="font-bold text-foreground">{displayValue}</span>
          <button
            onClick={() => {
              setFilters({ ...filters, [key]: [] });
            }}
            className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    });
    return tags;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={openModal}
          className="shrink-0 flex items-center justify-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-foreground hover:bg-secondary transition-colors relative shadow-sm"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-bold">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {renderActiveTags()}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                const empty: Record<string, string[]> = {};
                FILTER_CATEGORIES.forEach((c) => (empty[c.key] = []));
                setFilters(empty);
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline px-2"
            >
              Limpiar todos
            </button>
          )}
        </div>

        <div className="shrink-0 sm:ml-auto">
          <ThemeToggle />
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
                  const selectedCount = (localFilters[cat.key] || []).length;
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
                            isActive
                              ? "text-foreground translate-x-0"
                              : "opacity-0 -translate-x-2"
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
                  {filteredOptions.length > 0 &&
                    !["fecha", "frecuencia"].includes(activeTab) && (
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
                    <div className="mb-4 p-4 bg-secondary/20 rounded-2xl border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-foreground">
                          Rango Personalizado (Próximamente)
                        </span>
                        <div className="w-8 h-4 bg-secondary rounded-full relative">
                          <div className="absolute left-1 top-1 w-2 h-2 bg-muted-foreground rounded-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                        <div className="bg-background border border-border p-2 rounded-lg text-[10px]">
                          Desde: 01/05/2026
                        </div>
                        <div className="bg-background border border-border p-2 rounded-lg text-[10px]">
                          Hasta: 12/05/2026
                        </div>
                      </div>
                    </div>
                  )}
                  {filteredOptions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-8 h-8 opacity-20 mb-3" />
                      <p className="text-sm">No se encontraron resultados</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 auto-rows-max">
                      {filteredOptions.map((opt) => {
                        const isSelected = selectedInCategory.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                              isSelected
                                ? "bg-primary/5 hover:bg-primary/10"
                                : "hover:bg-secondary/60"
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 transition-colors border ${
                                ["fecha", "frecuencia"].includes(activeTab)
                                  ? "rounded-full"
                                  : "rounded"
                              } ${
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/40 bg-background group-hover:border-primary/50"
                              }`}
                            >
                              {isSelected &&
                                (["fecha", "frecuencia"].includes(activeTab) ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                                ) : (
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                ))}
                            </div>
                            <span
                              className={`text-sm leading-tight select-none ${
                                isSelected
                                  ? "text-foreground font-bold"
                                  : "text-foreground/80 font-medium group-hover:text-foreground"
                              }`}
                              title={opt}
                            >
                              {opt}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(activeTab, opt)}
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
