"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "use-intl";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";
import IvaToggle from "@/modules/commerce/components/revenue-tracking/iva-toggle/iva-toggle";
import { getDashboardSalesFilters } from "@/services/dashboardSales/dashboardSales";
import type { IDashboardSalesFilter } from "@/types/dashboardSales/IDashboardSales";
import { FilterModal } from "@/components/ui/filter-modal";
import {
  FilterChips,
  type FilterChipItem
} from "@/components/ui/page-header-controls/page-header-controls";
import type {
  FilterCategoryConfig,
  FilterCategoryStatus,
  FilterOptionItem
} from "@/components/ui/filter-modal";
import DateRangeTab, {
  FECHA_PRESET_IDS,
  type FechaDraft,
  fechaDraftFromOption,
  fechaDraftToOption
} from "./DateRangeTab";

// Los ids son los valores del filtro; el texto sale de commerce.dashboard.filters.frequency.<id>.
const FRECUENCIA_IDS = ["diaria", "semanal", "mensual", "trimestral", "anual"] as const;

// `key` es también la clave del texto en commerce.dashboard.filters.categories.<key>.
const ENTITY_CATEGORIES = [
  { key: "channelIds", entity: "canal" },
  { key: "productIds", entity: "producto" },
  { key: "productTypes", entity: "tipo_producto" },
  { key: "sellerIds", entity: "vendedor" },
  { key: "clientIds", entity: "cliente" },
  { key: "cityIds", entity: "ciudad" },
  { key: "lineIds", entity: "linea" }
] as const;

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
  const t = useTranslations("commerce.dashboard.filters");
  const frecuenciaOptions: FilterOptionItem[] = FRECUENCIA_IDS.map((id) => ({
    id,
    name: t(`frequency.${id}`)
  }));
  // Las fechas predefinidas se guardan con el nombre del idioma en que se eligieron; se
  // vuelven a traducir por id para que el chip siga el idioma actual.
  const fechaName = (opt: { id: string; name: string }) =>
    (FECHA_PRESET_IDS as readonly string[]).includes(opt.id)
      ? t(`datePresets.${opt.id as (typeof FECHA_PRESET_IDS)[number]}`)
      : opt.name;
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

  const toEntityCategory = ({ key, entity }: (typeof ENTITY_CATEGORIES)[number]) => ({
    key,
    label: t(`categories.${key}`),
    options: optionsByEntity[entity] ?? [],
    status: statusByEntity[entity]
  });

  const categories: FilterCategoryConfig[] = [
    {
      key: "fecha",
      label: t("date"),
      kind: "custom",
      metaLabel: t("selectPeriod"),
      draftCount: fechaDraftToOption(fechaDraft) ? 1 : 0,
      renderPanel: () => <DateRangeTab value={fechaDraft} onChange={setFechaDraft} />,
      renderTag: () =>
        filters.fecha?.[0] ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-[13px]">
            <span className="text-muted-foreground font-medium">{t("dateLabel")}</span>
            <span className="font-bold text-foreground">{fechaName(filters.fecha[0])}</span>
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
    toEntityCategory(ENTITY_CATEGORIES[0]),
    {
      key: "frecuencia",
      label: t("frequencyLabel"),
      selectMode: "single",
      options: frecuenciaOptions
    },
    ...ENTITY_CATEGORIES.slice(1).map(toEntityCategory)
  ];

  // En el header el FilterModal no pinta chips de categorías custom (Fecha), así que los
  // chips se arman aquí, con la fecha primero, y el modal va con hideTags.
  const chips: FilterChipItem[] = [
    ...(filters.fecha?.[0]
      ? [
          {
            key: "fecha",
            label: t("date"),
            value: fechaName(filters.fecha[0]),
            onRemove: () => setFilters({ ...filters, fecha: [] })
          }
        ]
      : []),
    ...categories.flatMap((cat) => {
      const items = cat.kind === "custom" ? [] : filters[cat.key] || [];
      if (!items.length) return [];
      return [
        {
          key: cat.key,
          label: cat.label,
          value:
            items.length === 1
              ? cat.key === "frecuencia"
                ? t(`frequency.${items[0].id as (typeof FRECUENCIA_IDS)[number]}`)
                : items[0].name
              : t("selectedCount", { count: items.length }),
          onRemove: () => setFilters({ ...filters, [cat.key]: [] })
        }
      ];
    })
  ];

  return (
    <>
      <FilterChips chips={chips} />
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
        inHeader
        hideTags
        barEnd={
          <>
            <IvaToggle />
          </>
        }
      />
    </>
  );
}
