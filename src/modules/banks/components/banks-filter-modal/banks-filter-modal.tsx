"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslations } from "use-intl";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal/FilterModal.types";
import {
  DateDraft,
  FilterDateTab,
  formatDateTagValue,
  resolveDatePreset
} from "@/modules/reverseLogistics/components/FilterDateTab/FilterDateTab";
import { DateFilterTag } from "@/modules/reverseLogistics/components/FilterDateTab/DateFilterTag";

/** Lo que esperan las pestañas de Bancos: rangos "YYYY-MM-DD|YYYY-MM-DD" y "1"/"0" de Activo. */
interface IBanksFilters {
  dates?: string[];
  active?: string[];
}

interface BanksFilterModalProps<T extends IBanksFilters> {
  setSelectedFilters: Dispatch<SetStateAction<T>>;
  /** Pagos activos filtra también por "Activo" (Sí / No). */
  withActive?: boolean;
  /** Arranca con "Últimos 30 días" (lo que hacía el filtro de Pagos activos). */
  defaultLast30?: boolean;
}

const EMPTY_DATE: DateDraft = { from: null, to: null };

/**
 * "Filtrar" de Bancos con el modal Filtros Avanzados (DESIGN.md §6), aunque la pestaña tenga
 * una sola categoría. Fechas usa el panel común de periodos + rango personalizado; entrega a la
 * pestaña el mismo formato que el filtro anterior, así que su consulta no cambia.
 */
export default function BanksFilterModal<T extends IBanksFilters>({
  setSelectedFilters,
  withActive,
  defaultLast30
}: BanksFilterModalProps<T>) {
  const t = useTranslations("banks.filters");
  const tCommon = useTranslations("common");
  const activeOptions: FilterOptionItem[] = [
    { id: "1", name: tCommon("status.yes") },
    { id: "0", name: tCommon("status.no") }
  ];
  const [date, setDate] = useState<DateDraft>(() =>
    defaultLast30 ? resolveDatePreset("ultimos_30") : EMPTY_DATE
  );
  // El draft de FilterModal solo cubre categorías de opciones: el de fechas va aquí.
  const [dateDraft, setDateDraft] = useState<DateDraft>(date);
  const [selection, setSelection] = useState<FilterSelection>({ activo: [] });

  useEffect(() => {
    setSelectedFilters((prev) => ({
      ...prev,
      dates: date.from && date.to ? [`${date.from}|${date.to}`] : [],
      ...(withActive && { active: (selection.activo ?? []).map((o) => o.id) })
    }));
  }, [date, selection, withActive, setSelectedFilters]);

  const hasDate = Boolean(date.from || date.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    {
      key: "fechas",
      label: t("dates"),
      kind: "custom",
      metaLabel: hasDraftDate
        ? t("periodValue", { period: formatDateTagValue(dateDraft) })
        : t("selectPeriod"),
      draftCount: hasDraftDate ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      // null (no un elemento vacío) para que el contador de filtros activos no lo cuente.
      renderTag: () =>
        hasDate ? (
          <DateFilterTag value={date} label={t("dates")} onClear={() => setDate(EMPTY_DATE)} />
        ) : null
    },
    ...(withActive
      ? [
          {
            key: "activo",
            label: t("active"),
            selectMode: "single" as const,
            options: activeOptions
          }
        ]
      : [])
  ];

  return (
    <FilterModal
      inHeader
      categories={categories}
      value={selection}
      formatTagValue={(_cat, items) => items[0]?.name ?? ""}
      onApply={(sel) => {
        setSelection(sel);
        setDate(dateDraft);
      }}
      onValueChange={setSelection}
      onClearAll={() => {
        setSelection({ activo: [] });
        setDate(EMPTY_DATE);
      }}
      onOpen={() => setDateDraft(date)}
      onClearDraft={() => setDateDraft(EMPTY_DATE)}
    />
  );
}
