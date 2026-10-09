"use client";

import { useState } from "react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useInvoiceIncidentMotives } from "@/hooks/useInvoiceIncidentMotives";
import {
  DateDraft,
  FilterDateTab,
  formatDateTagValue
} from "@/modules/reverseLogistics/components/FilterDateTab/FilterDateTab";
import { DateFilterTag } from "@/modules/reverseLogistics/components/FilterDateTab/DateFilterTag";

import { EMPTY_NOVELTIES_FILTERS, NOVELTY_STATUS_FUSIONADA_ID } from "../../constants";
import { useIncidentListFilters } from "../../hooks/useIncidentListFilters";
import { useNoveltyStatuses } from "../../hooks/useNoveltyStatuses";
import type { INoveltiesFilters } from "../../types";

/** Misma altura y superficie que los demás controles de la barra. */
const TRIGGER_CLASS =
  "flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 text-foreground transition-colors hover:bg-secondary";

interface NoveltiesFilterModalProps {
  value: INoveltiesFilters;
  onChange: (next: INoveltiesFilters) => void;
}

/** Selección de una categoría "single" a partir del valor confirmado. */
const single = (id: string | number | null, options: FilterOptionItem[]): FilterOptionItem[] => {
  if (id === null || id === undefined) return [];
  const key = String(id);
  return [{ id: key, name: options.find((o) => o.id === key)?.name ?? key }];
};

const toNumber = (items?: FilterOptionItem[]) => (items?.[0] ? Number(items[0].id) : null);
const toText = (items?: FilterOptionItem[]) => items?.[0]?.id ?? null;

/**
 * Botón "Filtros" de la bandeja. Cada categoría es de una sola opción porque
 * el listado recibe un id por parámetro. Coordinador, KAM y mercado envían el
 * valor canónico del catálogo, que es lo que el listado espera de vuelta.
 */
export default function NoveltiesFilterModal({ value, onChange }: NoveltiesFilterModalProps) {
  const { statuses, isLoading: isLoadingStatuses } = useNoveltyStatuses();
  const { data: motives, isLoading: isLoadingMotives } = useInvoiceIncidentMotives();
  const { filters, isLoading: isLoadingFilters } = useIncidentListFilters();

  // El draft interno de FilterModal sólo cubre categorías de opciones, así que
  // el rango de fechas se borra aquí y se confirma al aplicar.
  const [dateDraft, setDateDraft] = useState<DateDraft>({
    from: value.date_from,
    to: value.date_to
  });

  const estadoOptions: FilterOptionItem[] = statuses
    .filter((s) => s.id !== NOVELTY_STATUS_FUSIONADA_ID)
    .map((s) => ({ id: String(s.id), name: s.description }));
  const motivoOptions: FilterOptionItem[] = (motives ?? []).map((m) => ({
    id: String(m.id),
    name: m.name
  }));
  const canonicalOptions = (items?: { canonical: string }[]): FilterOptionItem[] =>
    (items ?? []).map((c) => ({ id: c.canonical, name: c.canonical }));
  const coordinadorOptions = canonicalOptions(filters?.coordinator);
  const kamOptions = canonicalOptions(filters?.kam);
  const mercadoOptions = canonicalOptions(filters?.market);
  const ejecutivoOptions: FilterOptionItem[] = (filters?.executive ?? []).map((e) => ({
    id: String(e.id),
    name: e.name
  }));

  const selection: FilterSelection = {
    estado: single(value.novelty_status_id, estadoOptions),
    motivo: single(value.motive_id, motivoOptions),
    coordinador: single(value.coordinator, coordinadorOptions),
    kam: single(value.kam, kamOptions),
    mercado: single(value.market, mercadoOptions),
    ejecutivo: single(value.executive_id, ejecutivoOptions)
  };

  const selectionToDomain = (sel: FilterSelection): Partial<INoveltiesFilters> => ({
    novelty_status_id: toNumber(sel.estado),
    motive_id: toNumber(sel.motivo),
    coordinator: toText(sel.coordinador),
    kam: toText(sel.kam),
    market: toText(sel.mercado),
    executive_id: toNumber(sel.ejecutivo)
  });

  const committedDate: DateDraft = { from: value.date_from, to: value.date_to };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const filtersStatus = isLoadingFilters ? "loading" : undefined;

  const categories: FilterCategoryConfig[] = [
    {
      key: "estado",
      label: "Estado",
      selectMode: "single",
      options: estadoOptions,
      status: isLoadingStatuses ? "loading" : undefined
    },
    {
      key: "motivo",
      label: "Tipo de novedad",
      selectMode: "single",
      options: motivoOptions,
      status: isLoadingMotives ? "loading" : undefined
    },
    {
      key: "coordinador",
      label: "Coordinador",
      selectMode: "single",
      options: coordinadorOptions,
      status: filtersStatus
    },
    { key: "kam", label: "KAM", selectMode: "single", options: kamOptions, status: filtersStatus },
    {
      key: "mercado",
      label: "Mercado",
      selectMode: "single",
      options: mercadoOptions,
      status: filtersStatus
    },
    {
      key: "ejecutivo",
      label: "Ejecutivo",
      selectMode: "single",
      options: ejecutivoOptions,
      status: filtersStatus
    },
    {
      key: "fechas",
      label: "Fechas",
      kind: "custom",
      metaLabel: hasDraftDate
        ? `Periodo: ${formatDateTagValue(dateDraft)}`
        : "Selecciona un periodo",
      draftCount: hasDraftDate ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      // Debe ser null (no un elemento vacío) para que el contador de filtros
      // activos de FilterModal no lo cuente.
      renderTag: () =>
        hasCommittedDate ? (
          <DateFilterTag
            value={committedDate}
            label="Fechas"
            onClear={() => onChange({ ...value, date_from: null, date_to: null })}
          />
        ) : null
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ className: TRIGGER_CLASS }}
      formatTagValue={(_cat, items) => items[0]?.name ?? ""}
      onApply={(sel) =>
        onChange({
          ...value,
          ...selectionToDomain(sel),
          date_from: dateDraft.from,
          date_to: dateDraft.to
        })
      }
      onValueChange={(sel) => onChange({ ...value, ...selectionToDomain(sel) })}
      onClearAll={() => onChange(EMPTY_NOVELTIES_FILTERS)}
      onOpen={() => setDateDraft({ from: value.date_from, to: value.date_to })}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
