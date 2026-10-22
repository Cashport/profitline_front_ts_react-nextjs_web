"use client";

import { useState } from "react";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import {
  DateDraft,
  FilterDateTab,
  formatDateTagValue
} from "@/modules/reverseLogistics/components/FilterDateTab/FilterDateTab";
import { DateFilterTag } from "@/modules/reverseLogistics/components/FilterDateTab/DateFilterTag";
import type { IReportsFilters, IReportType } from "@/types/reports/IReports";

import { EMPTY_REPORTS_FILTERS } from "../../constants";

/** Misma altura y superficie que el buscador y el botón de tema. */
const TRIGGER_CLASS =
  "flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 text-foreground transition-colors hover:bg-secondary";

interface ReportsFilterModalProps {
  value: IReportsFilters;
  onChange: (next: IReportsFilters) => void;
  types: IReportType[];
}

const toIds = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));

/**
 * Botón "Filtrar" de Informes sobre el FilterModal compartido: tipo de informe
 * (multi) y fecha de publicación (periodo o rango).
 */
export default function ReportsFilterModal({ value, onChange, types }: ReportsFilterModalProps) {
  // El draft interno de FilterModal sólo cubre categorías de opciones, así que
  // el rango de fechas se borra aquí y se confirma al aplicar.
  const [dateDraft, setDateDraft] = useState<DateDraft>({ from: value.from, to: value.to });

  const typeOptions: FilterOptionItem[] = types.map((t) => ({ id: String(t.id), name: t.name }));

  const selection: FilterSelection = {
    tipo: value.report_type_ids.map((id) => ({
      id: String(id),
      name: types.find((t) => t.id === id)?.name ?? String(id)
    }))
  };

  const committedDate: DateDraft = { from: value.from, to: value.to };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    { key: "tipo", label: "Tipo de informe", options: typeOptions },
    {
      key: "fecha",
      label: "Fecha de publicación",
      kind: "custom",
      metaLabel: hasDraftDate
        ? `Periodo: ${formatDateTagValue(dateDraft)}`
        : "Selecciona un periodo",
      draftCount: hasDraftDate ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      // Debe ser null (no un elemento vacío) para que FilterModal no lo cuente como activo.
      renderTag: () =>
        hasCommittedDate ? (
          <DateFilterTag
            value={committedDate}
            label="Fecha"
            onClear={() => onChange({ ...value, from: null, to: null })}
          />
        ) : null
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ label: "Filtrar", className: TRIGGER_CLASS, showChevron: true }}
      formatTagValue={(_cat, items) => items.map((i) => i.name).join(", ")}
      onApply={(sel) => onChange({ report_type_ids: toIds(sel.tipo), ...dateDraft })}
      onValueChange={(sel) => onChange({ ...value, report_type_ids: toIds(sel.tipo) })}
      onClearAll={() => onChange(EMPTY_REPORTS_FILTERS)}
      onOpen={() => setDateDraft(committedDate)}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
