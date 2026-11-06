"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterSelection
} from "@/components/ui/filter-modal/FilterModal.types";
import { ICountryClientsFilters } from "@/types/dataQuality/IDataQuality";
import { TIER_CODES, TIER_META, TierFilterCode, useTierFilter } from "../../tiers";
import { PERIODICITY_LABEL } from "../../utils/periodicity";

export interface ClientsFilterValues {
  status: string | null;
  periodicity: string | null;
  fileType: string | null;
  intakeType: string | null;
}

interface ClientsFilterModalProps {
  options?: ICountryClientsFilters;
  value: ClientsFilterValues;
  onChange: (next: ClientsFilterValues) => void;
}

const SINGLE_KEYS: Array<keyof ClientsFilterValues> = [
  "status",
  "periodicity",
  "fileType",
  "intakeType"
];

/** Data Quality clients filters with the shared "Filtros Avanzados" modal, in the page header. */
export function ClientsFilterModal({ options, value, onChange }: ClientsFilterModalProps) {
  const selectedTiers = useTierFilter((s) => s.selected);
  const setSelectedTiers = useTierFilter((s) => s.setSelected);

  const tierOptions = (
    options?.tiers?.length ? options.tiers.map((t) => t.code) : [...TIER_CODES, "NONE" as const]
  ).map((code) => {
    const count = options?.tiers?.find((t) => t.code === code)?.count;
    return { id: code, name: TIER_META[code].label, count };
  });

  const categories: FilterCategoryConfig[] = [
    { key: "tier", label: "Tier", options: tierOptions },
    {
      key: "status",
      label: "Estado",
      selectMode: "single",
      options: (options?.status ?? []).map((s) => ({ id: s, name: s }))
    },
    {
      key: "periodicity",
      label: "Periodicidad",
      selectMode: "single",
      options: (options?.periodicity ?? []).map((p) => ({
        id: p,
        name: PERIODICITY_LABEL[p] ?? p
      }))
    },
    {
      key: "fileType",
      label: "Tipo de archivo",
      selectMode: "single",
      options: (options?.archive_types ?? []).map((a) => ({
        id: String(a.id),
        name: a.description
      }))
    },
    {
      key: "intakeType",
      label: "Tipo de ingesta",
      selectMode: "single",
      options: (options?.intake_types ?? []).map((i) => ({
        id: String(i.id),
        name: i.description
      }))
    }
  ];

  const nameOf = (key: string, id: string) =>
    categories.find((c) => c.key === key)?.options?.find((o) => o.id === id)?.name ?? id;

  const selection: FilterSelection = {
    tier: selectedTiers.map((code) => ({ id: code, name: TIER_META[code].label })),
    ...Object.fromEntries(
      SINGLE_KEYS.map((key) => [
        key,
        value[key] ? [{ id: value[key] as string, name: nameOf(key, value[key] as string) }] : []
      ])
    )
  };

  const commit = (next: FilterSelection) => {
    setSelectedTiers((next.tier ?? []).map((o) => o.id as TierFilterCode));
    onChange(
      Object.fromEntries(
        SINGLE_KEYS.map((key) => [key, next[key]?.[0]?.id ?? null])
      ) as unknown as ClientsFilterValues
    );
  };

  return (
    <FilterModal
      inHeader
      categories={categories}
      value={selection}
      onApply={commit}
      onValueChange={commit}
    />
  );
}
