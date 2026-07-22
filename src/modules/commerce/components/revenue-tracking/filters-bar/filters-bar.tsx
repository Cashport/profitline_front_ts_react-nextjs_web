"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

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
import DateRangeTab, {
  type FechaDraft,
  fechaDraftFromOption,
  fechaDraftToOption
} from "./DateRangeTab";

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

export default function FiltersBar() {
  const { filters, setFilters } = useRevenueTracking();
  const [optionsByEntity, setOptionsByEntity] = useState<Record<string, FilterOptionItem[]>>({});
  const [statusByEntity, setStatusByEntity] = useState<Record<string, FilterCategoryStatus>>({});
  const [fechaDraft, setFechaDraft] = useState<FechaDraft>(
    fechaDraftFromOption(filters.fecha?.[0])
  );

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
      kind: "custom",
      metaLabel: "Selecciona un periodo",
      draftCount: fechaDraftToOption(fechaDraft) ? 1 : 0,
      renderPanel: () => <DateRangeTab value={fechaDraft} onChange={setFechaDraft} />,
      renderTag: () =>
        filters.fecha?.[0] ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs">
            <span className="text-muted-foreground font-medium">Fecha:</span>
            <span className="font-bold text-foreground">{filters.fecha[0].name}</span>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, fecha: [] })}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null
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
      onApply={(sel) => {
        const opt = fechaDraftToOption(fechaDraft);
        setFilters({ ...sel, fecha: opt ? [opt] : [] });
      }}
      onValueChange={setFilters}
      onOpen={() => setFechaDraft(fechaDraftFromOption(filters.fecha?.[0]))}
      onClearDraft={() => setFechaDraft(null)}
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
