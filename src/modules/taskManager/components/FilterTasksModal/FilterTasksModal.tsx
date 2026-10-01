"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";

import { FilterModal } from "@/components/ui/filter-modal";
import type { FilterCategoryConfig, FilterSelection } from "@/components/ui/filter-modal";
import { ITaskTypes } from "@/types/tasks/ITasks";
import { ISelectFilterTasks } from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";
import TaskDateTab, { DateDraft } from "./TaskDateTab";

interface FilterTasksModalProps {
  taskTypes: ITaskTypes[];
  value: ISelectFilterTasks;
  onChange: (next: ISelectFilterTasks) => void;
  isLoading?: boolean;
}

// The parent stores dates as a single "from|to" range string; the date panel works with a DateDraft.
const datesToDraft = (dates: string[]): DateDraft => {
  const [from, to] = dates[0]?.split("|") ?? [];
  return { from_date: from || null, to_date: to || null };
};

const draftToDates = (d: DateDraft): string[] =>
  d.from_date || d.to_date ? [`${d.from_date ?? ""}|${d.to_date ?? ""}`] : [];

const formatDate = (value: string) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value;
};

export default function FilterTasksModal({
  taskTypes,
  value,
  onChange,
  isLoading
}: FilterTasksModalProps) {
  // Draft for the custom "Fechas" category — owned here, seeded from the committed value.
  const [dateDraft, setDateDraft] = useState<DateDraft>(datesToDraft(value.dates));

  // Committed selection -> FilterSelection (only the task-type option category).
  const selection: FilterSelection = {
    taskTypes: (value.taskTypes ?? []).map((id) => ({
      id: String(id),
      name: taskTypes.find((t) => t.ID === id)?.NAME ?? String(id)
    }))
  };

  const hasCommittedDate = Boolean(value.dates?.length);
  const [committedFrom, committedTo] = value.dates[0]?.split("|") ?? [];
  const dateTagValue =
    committedFrom && committedTo
      ? `${formatDate(committedFrom)} - ${formatDate(committedTo)}`
      : formatDate(committedFrom || committedTo || "");

  const categories: FilterCategoryConfig[] = [
    {
      key: "fecha",
      label: "Fechas",
      kind: "custom",
      metaLabel: "Selecciona un periodo",
      draftCount: dateDraft.from_date || dateDraft.to_date ? 1 : 0,
      renderPanel: () => <TaskDateTab value={dateDraft} onChange={setDateDraft} />,
      renderTag: () =>
        hasCommittedDate ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs">
            <span className="text-muted-foreground font-medium">Fecha:</span>
            <span className="font-bold text-foreground">{dateTagValue}</span>
            <button
              type="button"
              onClick={() => onChange({ ...value, dates: [] })}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null
    },
    {
      key: "taskTypes",
      label: "Tipo de tarea",
      options: taskTypes.map((t) => ({ id: String(t.ID), name: t.NAME }))
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      isLoading={isLoading}
      trigger={{
        label: "Filtrar",
        showChevron: true,
        className:
          "h-12 flex items-center gap-2 border border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent px-4 rounded-md"
      }}
      formatTagValue={(_cat, items) => (items.length === 1 ? items[0].name : `${items.length} tipos`)}
      onApply={(sel) =>
        onChange({
          ...value,
          taskTypes: (sel.taskTypes ?? []).map((o) => Number(o.id)),
          dates: draftToDates(dateDraft)
        })
      }
      onValueChange={(sel) =>
        onChange({
          ...value,
          taskTypes: (sel.taskTypes ?? []).map((o) => Number(o.id))
        })
      }
      onClearAll={() => onChange({ ...value, taskTypes: [], dates: [] })}
      onOpen={() => setDateDraft(datesToDraft(value.dates))}
      onClearDraft={() => setDateDraft({ from_date: null, to_date: null })}
    />
  );
}
