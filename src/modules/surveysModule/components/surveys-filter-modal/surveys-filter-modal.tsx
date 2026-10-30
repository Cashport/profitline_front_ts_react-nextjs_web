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
import type { IVisitFormStatus, IVisitFormsFilters } from "@/types/surveys/ISurveys";

import { EMPTY_VISIT_FORMS_FILTERS } from "../../constants";
import { useVisitFormCreators, useVisitFormStatuses } from "../../hooks/useVisitFormCatalogs";

interface SurveysFilterModalProps {
  value: IVisitFormsFilters;
  onChange: (next: IVisitFormsFilters) => void;
  /** En el header compartido: chips a la izquierda de Filtrar (DESIGN.md §6). */
  inHeader?: boolean;
}

const toStatuses = (items?: FilterOptionItem[]) =>
  (items ?? []).map((o) => o.id as IVisitFormStatus);
const toIds = (items?: FilterOptionItem[]) => (items ?? []).map((o) => Number(o.id));

/**
 * Botón "Filtrar" de Encuestas sobre el FilterModal compartido: estado,
 * creador y fecha de actualización. Las opciones salen del backend y los
 * filtros viajan como query de GET /visit-forms.
 */
export default function SurveysFilterModal({
  value,
  onChange,
  inHeader
}: SurveysFilterModalProps) {
  const statuses = useVisitFormStatuses();
  const creators = useVisitFormCreators();
  // El draft interno de FilterModal sólo cubre categorías de opciones, así que
  // el rango de fechas se borra aquí y se confirma al aplicar.
  const [dateDraft, setDateDraft] = useState<DateDraft>({ from: value.from, to: value.to });

  const selection: FilterSelection = {
    status: value.status.map((code) => ({
      id: code,
      name: statuses.find((s) => s.code === code)?.name ?? code
    })),
    created_by: value.created_by.map((id) => ({
      id: String(id),
      name: creators.find((c) => c.id === id)?.name ?? String(id)
    }))
  };

  const committedDate: DateDraft = { from: value.from, to: value.to };
  const hasCommittedDate = Boolean(committedDate.from || committedDate.to);
  const hasDraftDate = Boolean(dateDraft.from || dateDraft.to);

  const categories: FilterCategoryConfig[] = [
    {
      key: "status",
      label: "Estado",
      options: statuses.map((s) => ({ id: s.code, name: s.name }))
    },
    {
      key: "created_by",
      label: "Creada por",
      options: creators.map((c) => ({ id: String(c.id), name: c.name }))
    },
    {
      key: "updated_at",
      label: "Fecha de actualización",
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
            label="Actualizada"
            onClear={() => onChange({ ...value, from: null, to: null })}
          />
        ) : null
    }
  ];

  return (
    <FilterModal
      inHeader={inHeader}
      categories={categories}
      value={selection}
      formatTagValue={(_cat, items) => items.map((i) => i.name).join(", ")}
      onApply={(sel) =>
        onChange({
          status: toStatuses(sel.status),
          created_by: toIds(sel.created_by),
          ...dateDraft
        })
      }
      onValueChange={(sel) =>
        onChange({
          ...value,
          status: toStatuses(sel.status),
          created_by: toIds(sel.created_by)
        })
      }
      onClearAll={() => onChange(EMPTY_VISIT_FORMS_FILTERS)}
      onOpen={() => setDateDraft(committedDate)}
      onClearDraft={() => setDateDraft({ from: null, to: null })}
    />
  );
}
