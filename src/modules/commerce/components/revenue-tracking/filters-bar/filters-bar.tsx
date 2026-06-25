"use client";

import React, { useState } from "react";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import ThemeToggle from "@/modules/commerce/components/revenue-tracking/theme-toggle/theme-toggle";
import { getDashboardSalesFilters } from "@/services/dashboardSales/dashboardSales";
import type { IDashboardSalesFilter } from "@/types/dashboardSales/IDashboardSales";
import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterCategoryStatus,
  FilterOptionItem
} from "@/components/ui/filter-modal";

const FECHA_OPTIONS: FilterOptionItem[] = [
  { id: "mes_actual", name: "Mes actual" },
  { id: "ultimo_mes", name: "Último mes" },
  { id: "ultimo_trimestre", name: "Último trimestre" },
  { id: "ytd", name: "YTD" },
  { id: "ultimos_12_meses", name: "Últimos 12 meses" }
];

const FRECUENCIA_OPTIONS: FilterOptionItem[] = [
  { id: "diaria", name: "Diaria" },
  { id: "semanal", name: "Semanal" },
  { id: "mensual", name: "Mensual" },
  { id: "trimestral", name: "Trimestral" },
  { id: "anual", name: "Anual" }
];

const ENTITY_CATEGORIES: { key: string; label: string; entity: string }[] = [
  { key: "productIds", label: "Producto", entity: "producto" },
  { key: "sellerIds", label: "Vendedor", entity: "vendedor" },
  { key: "clientIds", label: "Cliente", entity: "cliente" },
  { key: "cityIds", label: "Ciudad", entity: "ciudad" },
  { key: "lineIds", label: "Línea de negocio", entity: "linea" },
  { key: "channelIds", label: "Canal de venta", entity: "canal" }
];

const ENTITY_BY_KEY: Record<string, string> = Object.fromEntries(
  ENTITY_CATEGORIES.map((c) => [c.key, c.entity])
);

const normalizeOptions = (data: unknown): FilterOptionItem[] => {
  const items = (data as IDashboardSalesFilter | undefined)?.items;
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({ id: String(it.id ?? ""), name: String(it.name ?? "") }))
    .filter((o) => o.name !== "");
};

function DateRangePlaceholder() {
  return (
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
  );
}

export default function FiltersBar() {
  const { filters, setFilters } = useRevenueTracking();
  const [optionsByEntity, setOptionsByEntity] = useState<Record<string, FilterOptionItem[]>>({});
  const [statusByEntity, setStatusByEntity] = useState<Record<string, FilterCategoryStatus>>({});

  const loadEntity = (entity: string, force = false) => {
    if (!force && statusByEntity[entity]) return;
    setStatusByEntity((prev) => ({ ...prev, [entity]: "loading" }));
    getDashboardSalesFilters(entity)
      .then((data) => {
        setOptionsByEntity((prev) => ({ ...prev, [entity]: normalizeOptions(data) }));
        setStatusByEntity((prev) => ({ ...prev, [entity]: "loaded" }));
      })
      .catch(() => setStatusByEntity((prev) => ({ ...prev, [entity]: "error" })));
  };

  const categories: FilterCategoryConfig[] = [
    {
      key: "fecha",
      label: "Fecha",
      selectMode: "single",
      metaLabel: "Selecciona un periodo",
      options: FECHA_OPTIONS,
      renderAboveOptions: () => <DateRangePlaceholder />
    },
    { key: "frecuencia", label: "Frecuencia", selectMode: "single", options: FRECUENCIA_OPTIONS },
    ...ENTITY_CATEGORIES.map(({ key, label, entity }) => ({
      key,
      label,
      options: optionsByEntity[entity] ?? [],
      status: statusByEntity[entity]
    }))
  ];

  return (
    <FilterModal
      categories={categories}
      value={filters}
      onApply={setFilters}
      onValueChange={setFilters}
      onCategoryOpen={(key) => ENTITY_BY_KEY[key] && loadEntity(ENTITY_BY_KEY[key])}
      onRetryCategory={(key) => ENTITY_BY_KEY[key] && loadEntity(ENTITY_BY_KEY[key], true)}
      barEnd={
        <div className="shrink-0 sm:ml-auto">
          <ThemeToggle />
        </div>
      }
    />
  );
}
