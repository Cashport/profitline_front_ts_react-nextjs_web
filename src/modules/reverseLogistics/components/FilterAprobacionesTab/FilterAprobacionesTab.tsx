"use client";

import { useState } from "react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { TipoAprobacion } from "@/types/reverseLogistics/IReverseLogistics";
import {
  ESTADO_PENDIENTE_APROBACION_ID,
  ESTADO_PENDIENTE_APROBACION_NOMBRE,
  TIPO_APROBACION_OPTIONS
} from "../../constants";
import { useProfit360Filters } from "../../contexts/Profit360FiltersContext";
import { IAprobacionesFilter } from "../../types";
import { FilterDateTab, DateDraft, formatDateTagValue } from "../FilterDateTab/FilterDateTab";
import { DateFilterTag } from "../FilterDateTab/DateFilterTag";

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
  const { clientes, estados, isLoading } = useProfit360Filters();

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

  const estadoOptions: FilterOptionItem[] = estados.map((e) => ({ id: e.codigo, name: e.nombre }));

  // Resolve the committed estado back to its picklist entry. Matching is
  // case-insensitive because Profit360 doesn't guarantee GUID casing — an exact
  // match would leave the option unhighlighted in the list. Until the picklist
  // resolves, the seeded default falls back to its known label so the tag never
  // renders a bare GUID.
  const estadoItem = (id: string): FilterOptionItem =>
    estadoOptions.find((o) => o.id.toUpperCase() === id.toUpperCase()) ?? {
      id,
      name:
        id.toUpperCase() === ESTADO_PENDIENTE_APROBACION_ID
          ? ESTADO_PENDIENTE_APROBACION_NOMBRE
          : id
    };

  const selection: FilterSelection = {
    cliente: value.clientId
      ? [
          {
            id: value.clientId,
            name: clienteOptions.find((c) => c.id === value.clientId)?.name ?? value.clientId
          }
        ]
      : [],
    estado: value.status ? [estadoItem(value.status)] : [],
    tipo: value.tipos.map((t) => ({
      id: t,
      name: tipoOptions.find((o) => o.id === t)?.name ?? t
    })),
    ciudad: value.ciudades.map((c) => ({ id: c, name: c }))
  };

  const selectionToDomain = (sel: FilterSelection): Partial<IAprobacionesFilter> => ({
    clientId: sel.cliente?.[0]?.id ?? null,
    status: sel.estado?.[0]?.id ?? null,
    tipos: (sel.tipo || []).map((o) => o.id as TipoAprobacion),
    ciudades: (sel.ciudad || []).map((o) => o.id)
  });

  const committedDate: DateDraft = { from: value.fromDate, to: value.toDate };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    { key: "cliente", label: "Cliente", selectMode: "single", options: clienteOptions },
    { key: "estado", label: "Estado", selectMode: "single", options: estadoOptions },
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
        onChange({
          clientId: null,
          status: null,
          fromDate: null,
          toDate: null,
          tipos: [],
          ciudades: []
        })
      }
      onOpen={() => setDateDraft({ from: value.fromDate, to: value.toDate })}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
