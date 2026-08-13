"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useProfit360Filters } from "../../contexts/Profit360FiltersContext";
import { IDevolucionesFilter } from "../../types";
import { FilterDateTab, DateDraft } from "../FilterDateTab/FilterDateTab";

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

  const hasCommittedDate = Boolean(value.fromDate || value.toDate);
  const dateTagValue =
    value.fromDate && value.toDate
      ? `${value.fromDate} - ${value.toDate}`
      : value.fromDate || value.toDate || "";

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
      metaLabel: "Selecciona un periodo",
      draftCount: dateDraft.from || dateDraft.to ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      renderTag: () =>
        hasCommittedDate ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs">
            <span className="text-muted-foreground font-medium">Fecha:</span>
            <span className="font-bold text-foreground">{dateTagValue}</span>
            <button
              type="button"
              onClick={() => onChange({ ...value, fromDate: null, toDate: null })}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
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
