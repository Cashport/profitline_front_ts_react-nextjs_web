"use client";

import { useState } from "react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useProfit360Filters } from "../../contexts/Profit360FiltersContext";
import { IDevolucionesFilter } from "../../types";
import { FilterDateTab, DateDraft, formatDateTagValue } from "../FilterDateTab/FilterDateTab";
import { DateFilterTag } from "../FilterDateTab/DateFilterTag";

interface FilterDevolucionesTabProps {
  value: IDevolucionesFilter;
  onChange: (next: IDevolucionesFilter) => void;
}

export function FilterDevolucionesTab({ value, onChange }: FilterDevolucionesTabProps) {
  const { clientes, isLoading } = useProfit360Filters();

  // FilterModal's internal draft only holds option categories, so the date
  // range is drafted here and committed on apply.
  const [dateDraft, setDateDraft] = useState<DateDraft>({
    from: value.fromDate,
    to: value.toDate
  });

  const clienteOptions: FilterOptionItem[] = clientes.map((c) => ({
    id: c.codigo,
    name: c.nombre
  }));
  const selection: FilterSelection = {
    cliente: value.clientId
      ? [
          {
            id: value.clientId,
            name: clienteOptions.find((c) => c.id === value.clientId)?.name ?? value.clientId
          }
        ]
      : []
  };

  const selectionToDomain = (sel: FilterSelection): Partial<IDevolucionesFilter> => ({
    clientId: sel.cliente?.[0]?.id ?? null
  });

  const committedDate: DateDraft = { from: value.fromDate, to: value.toDate };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    {
      key: "cliente",
      label: "Cliente",
      selectMode: "single",
      options: clienteOptions
    },
    {
      key: "fecha",
      label: "Fecha",
      kind: "custom",
      metaLabel: hasDraftDate
        ? `Periodo: ${formatDateTagValue(dateDraft)}`
        : "Selecciona un periodo",
      draftCount: hasDraftDate ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      // Must be null (not an element that renders nothing) so FilterModal's
      // active-filter count stays accurate.
      renderTag: () =>
        hasCommittedDate ? (
          <DateFilterTag
            value={committedDate}
            onClear={() => onChange({ ...value, fromDate: null, toDate: null })}
          />
        ) : null
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      isLoading={isLoading}
      trigger={{
        className:
          "h-12 flex items-center gap-2 border border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent px-4 rounded-md",
        showChevron: true
      }}
      formatTagValue={(_cat, items) => items[0]?.name ?? ""}
      onApply={(sel) =>
        onChange({
          ...value,
          ...selectionToDomain(sel),
          fromDate: dateDraft.from,
          toDate: dateDraft.to
        })
      }
      onValueChange={(sel) => onChange({ ...value, ...selectionToDomain(sel) })}
      onClearAll={() => onChange({ clientId: null, fromDate: null, toDate: null })}
      onOpen={() => setDateDraft({ from: value.fromDate, to: value.toDate })}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
