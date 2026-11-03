"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import TaskDateTab, {
  type DateDraft
} from "@/modules/taskManager/components/FilterTasksModal/TaskDateTab";
import type {
  ITaskConfig,
  ITaskFacets,
  ITaskFieldConfig,
  TaskFieldKey
} from "@/types/tickets/ITickets";
import { useTaskFacets } from "../../hooks/useTaskData";
import { useTicketsView } from "../../stores/tickets-view-store";
import type { TaskViewState } from "../../types";

/** Orden de las categorías del modal (el del prototipo); el resto va al final. */
const FILTER_ORDER: TaskFieldKey[] = [
  "status",
  "priority",
  "process",
  "error_type",
  "intake_type",
  "country",
  "client",
  "data_client",
  "category",
  "assignee",
  "tier"
];

export const filterableFields = (config: ITaskConfig) =>
  config.fields
    .filter((f) => f.filterable && f.filter_param)
    .sort((a, b) => {
      const ia = FILTER_ORDER.indexOf(a.key);
      const ib = FILTER_ORDER.indexOf(b.key);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });

export const emptyLabelOf = (field: ITaskFieldConfig) => `Sin ${field.label.toLowerCase()}`;

/**
 * Opciones de un campo con su conteo: las del proyecto (proceso, catálogos,
 * país…) o, para clientes, las que aparecen en las tareas. "Sin …" solo si
 * hay tareas sin ese dato.
 */
function optionsOf(field: ITaskFieldConfig, facets: ITaskFacets | undefined): FilterOptionItem[] {
  const facet = facets?.facets[field.key] ?? [];
  const counts = new Map(facet.map((f) => [f.value, f.count]));
  const base: FilterOptionItem[] =
    field.options_source === "config"
      ? (field.options ?? []).map((o) => ({ id: o.value, name: o.label }))
      : facet.filter((f) => f.value !== "none").map((f) => ({ id: f.value, name: f.label }));
  const withNone = counts.get("none") ? [...base, { id: "none", name: emptyLabelOf(field) }] : base;
  return facets ? withNone.map((o) => ({ ...o, count: counts.get(o.id) ?? 0 })) : withNone;
}

const toFilters = (config: ITaskConfig, selection: FilterSelection): TaskViewState["filters"] => {
  const filters: TaskViewState["filters"] = {};
  for (const field of filterableFields(config)) {
    const ids = (selection[field.key] ?? []).map((o) => o.id);
    if (ids.length) filters[field.key] = ids;
  }
  return filters;
};

/**
 * "Filtros Avanzados" del gestor de tareas: una categoría por campo
 * filtrable del proyecto + Fecha (creación). Los conteos siguen el borrador
 * y el pie dice cuántas tareas coinciden.
 */
export default function TasksFilterModal({ config }: { config: ITaskConfig }) {
  const { view, search, setFilters, setFilter, clearFilters } = useTicketsView(
    useShallow((s) => ({
      view: s.view,
      search: s.search,
      setFilters: s.setFilters,
      setFilter: s.setFilter,
      clearFilters: s.clearFilters
    }))
  );
  const [openedOnce, setOpenedOnce] = useState(false);
  const [draftFilters, setDraftFilters] = useState<TaskViewState["filters"] | null>(null);
  const [dateDraft, setDateDraft] = useState<DateDraft>({ from_date: null, to_date: null });

  const { facets, isLoading } = useTaskFacets({
    config,
    filters: draftFilters ?? view.filters,
    created: openedOnce ? { from: dateDraft.from_date, to: dateDraft.to_date } : view.created,
    showClosed: view.showClosed,
    search,
    enabled: openedOnce
  });

  const fields = filterableFields(config);
  const hasDate = Boolean(view.created.from || view.created.to);

  const categories: FilterCategoryConfig[] = [
    {
      key: "fecha",
      label: "Fecha",
      kind: "custom",
      metaLabel: "Fecha de creación",
      draftCount: dateDraft.from_date || dateDraft.to_date ? 1 : 0,
      renderPanel: () => <TaskDateTab value={dateDraft} onChange={setDateDraft} />,
      // Con hideTags solo cuenta para el badge de "Filtrar".
      renderTag: () => (hasDate ? <span /> : null)
    },
    ...fields.map((field) => ({
      key: field.key,
      label: field.label,
      options: optionsOf(field, facets),
      status:
        field.options_source === "remote" && !facets && isLoading ? ("loading" as const) : undefined
    }))
  ];

  const value: FilterSelection = Object.fromEntries(
    fields.map((field) => {
      const options = optionsOf(field, facets);
      return [
        field.key,
        (view.filters[field.key] ?? []).map((id) => ({
          id,
          name: options.find((o) => o.id === id)?.name ?? id
        }))
      ];
    })
  );

  return (
    <FilterModal
      categories={categories}
      value={value}
      hideTags
      footerSummary={
        facets
          ? `${facets.total} ${facets.total === 1 ? "tarea coincide" : "tareas coinciden"}`
          : null
      }
      onOpen={() => {
        setOpenedOnce(true);
        setDraftFilters(null);
        setDateDraft({ from_date: view.created.from, to_date: view.created.to });
      }}
      onDraftChange={(draft) => setDraftFilters(toFilters(config, draft))}
      onClearDraft={() => setDateDraft({ from_date: null, to_date: null })}
      onApply={(selection) => {
        setFilters(toFilters(config, selection), {
          from: dateDraft.from_date,
          to: dateDraft.to_date
        });
        setDraftFilters(null);
      }}
      onValueChange={(selection) => {
        for (const field of fields) {
          setFilter(
            field.key,
            (selection[field.key] ?? []).map((o) => o.id)
          );
        }
      }}
      onClearAll={clearFilters}
    />
  );
}
