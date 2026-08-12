"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import { TIPO_APROBACION_OPTIONS } from "../../constants";
import { useProfit360Filters } from "../../contexts/Profit360FiltersContext";
import { IAprobacionesFilter } from "../../types";
import { FilterDateTab, DateDraft } from "../FilterDateTab/FilterDateTab";

interface FilterAprobacionesTabProps {
  value: IAprobacionesFilter;
  onChange: (next: IAprobacionesFilter) => void;
  // Distinct ciudades present in the loaded approvals — the endpoint has no
  // ciudad picklist, so the options are derived from the data itself.
  ciudadOptions: string[];
}

const TAG_PLURALS: Record<string, string> = {
  tipo: "Tipos",
  ciudad: "Ciudades"
};

export function FilterAprobacionesTab({
  value,
  onChange,
  ciudadOptions
}: FilterAprobacionesTabProps) {
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

  const tipoOptions: FilterOptionItem[] = TIPO_APROBACION_OPTIONS.map((t) => ({
    id: t.value,
    name: t.label
  }));

  const selection: FilterSelection = {
    cliente: value.clientId
      ? [
          {
            id: value.clientId,
            name: clienteOptions.find((c) => c.id === value.clientId)?.name ?? value.clientId
          }
        ]
      : [],
    tipo: value.tipos.map((t) => ({
      id: t,
      name: tipoOptions.find((o) => o.id === t)?.name ?? t
    })),
    ciudad: value.ciudades.map((c) => ({ id: c, name: c }))
  };

  const selectionToDomain = (sel: FilterSelection): Partial<IAprobacionesFilter> => ({
    clientId: sel.cliente?.[0]?.id ?? null,
    tipos: (sel.tipo || []).map((o) => o.id as TipoAprobacion),
    ciudades: (sel.ciudad || []).map((o) => o.id)
  });

  const hasCommittedDate = Boolean(value.fromDate || value.toDate);
  const dateTagValue =
    value.fromDate && value.toDate
      ? `${value.fromDate} - ${value.toDate}`
      : value.fromDate || value.toDate || "";

  const categories: FilterCategoryConfig[] = [
    { key: "cliente", label: "Cliente", selectMode: "single", options: clienteOptions },
    { key: "tipo", label: "Tipo de Aprobación", options: tipoOptions },
    {
      key: "ciudad",
      label: "Ciudad",
      options: ciudadOptions.map((c) => ({ id: c, name: c }))
    },
    {
      key: "fecha",
      label: "Fecha de registro",
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
      formatTagValue={(cat, items) =>
        items.length === 1 ? items[0].name : `${items.length} ${TAG_PLURALS[cat.key] ?? ""}`.trim()
      }
      onApply={(sel) =>
        onChange({
          ...value,
          ...selectionToDomain(sel),
          fromDate: dateDraft.from,
          toDate: dateDraft.to
        })
      }
      onValueChange={(sel) => onChange({ ...value, ...selectionToDomain(sel) })}
      onClearAll={() =>
        onChange({ clientId: null, fromDate: null, toDate: null, tipos: [], ciudades: [] })
      }
      onOpen={() => setDateDraft({ from: value.fromDate, to: value.toDate })}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
