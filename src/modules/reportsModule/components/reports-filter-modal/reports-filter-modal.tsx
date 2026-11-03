"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";

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

interface ReportsFilterModalProps {
  value: IReportsFilters;
  onChange: (next: IReportsFilters) => void;
  types: IReportType[];
  /** Pinta botón y chips como hijos directos del header compartido. */
  inHeader?: boolean;
}

const toIds = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));

/**
 * Botón "Filtrar" de Informes sobre el FilterModal compartido: tipo de informe
 * (multi) y fecha de publicación (periodo o rango).
 */
export default function ReportsFilterModal({
  value,
  onChange,
  types,
  inHeader
}: ReportsFilterModalProps) {
  const t = useTranslations("reports.filters");
  // El draft interno de FilterModal sólo cubre categorías de opciones, así que
  // el rango de fechas se borra aquí y se confirma al aplicar.
  const [dateDraft, setDateDraft] = useState<DateDraft>({ from: value.from, to: value.to });

  const typeOptions: FilterOptionItem[] = types.map((type) => ({
    id: String(type.id),
    name: type.name
  }));

  const selection: FilterSelection = {
    tipo: value.report_type_ids.map((id) => ({
      id: String(id),
      name: types.find((type) => type.id === id)?.name ?? String(id)
    }))
  };

  const committedDate: DateDraft = { from: value.from, to: value.to };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    { key: "tipo", label: t("type"), options: typeOptions },
    {
      key: "fecha",
      label: t("publishedAt"),
      kind: "custom",
      metaLabel: hasDraftDate
        ? t("period", { value: formatDateTagValue(dateDraft) })
        : t("selectPeriod"),
      draftCount: hasDraftDate ? 1 : 0,
      renderPanel: () => <FilterDateTab value={dateDraft} onChange={setDateDraft} />,
      // Debe ser null (no un elemento vacío) para que FilterModal no lo cuente como activo.
      renderTag: () =>
        hasCommittedDate ? (
          <DateFilterTag
            value={committedDate}
            label={t("dateTag")}
            onClear={() => onChange({ ...value, from: null, to: null })}
          />
        ) : null
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      inHeader={inHeader}
      formatTagValue={(_cat, items) => items.map((i) => i.name).join(", ")}
      onApply={(sel) => onChange({ report_type_ids: toIds(sel.tipo), ...dateDraft })}
      onValueChange={(sel) => onChange({ ...value, report_type_ids: toIds(sel.tipo) })}
      onClearAll={() => onChange(EMPTY_REPORTS_FILTERS)}
      onOpen={() => setDateDraft(committedDate)}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
