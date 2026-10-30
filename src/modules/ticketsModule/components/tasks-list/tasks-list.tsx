"use client";

import { useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import ProfitLoader from "@/components/ui/profit-loader";
import { cn } from "@/utils/utils";
import type { ITaskConfig, ITaskFieldConfig } from "@/types/tickets/ITickets";
import { fieldOf } from "../../hooks/useTaskConfig";
import { useTaskGroups, useTaskList } from "../../hooks/useTaskData";
import { useTicketsView } from "../../stores/tickets-view-store";
import { createDraftFor } from "../../utils/task-create-draft";
import TaskGroup from "./task-group";
import { TaskHeaderRow, TaskRow } from "./task-row";
import { gridTemplate, useElementWidth, visibleColumns } from "./task-columns";

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="px-4 py-10 text-center text-[13px] text-cp-ink-3">{children}</p>
);

/** Vista Lista: agrupada (grupos plegables) o plana, con columnas según el proyecto. */
export default function TasksList({ config }: { config: ITaskConfig }) {
  const { view, patchView, toggleCollapsed, openDetail, openCreate } = useTicketsView(
    useShallow((s) => ({
      view: s.view,
      patchView: s.patchView,
      toggleCollapsed: s.toggleCollapsed,
      openDetail: s.openDetail,
      openCreate: s.openCreate
    }))
  );
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  const groupField = fieldOf(config, view.groupBy);
  const columns = useMemo(
    () => visibleColumns(config, groupField ? view.groupBy : null, width),
    [config, groupField, view.groupBy, width]
  );
  const grid = gridTemplate(columns);

  const onSort = (field: ITaskFieldConfig) =>
    view.sortBy === field.key
      ? patchView({ sortDir: view.sortDir === "asc" ? "desc" : "asc" })
      : patchView({ sortBy: field.key, sortDir: field.default_sort_dir });

  return (
    // Sin overflow-hidden: rompería el encabezado sticky de la tabla.
    <div ref={ref} className="min-w-0 rounded-[var(--card-radius)] bg-cp-surface">
      <TaskHeaderRow
        columns={columns}
        grid={grid}
        sortBy={view.sortBy}
        sortDir={view.sortDir}
        onSort={onSort}
      />
      {groupField ? (
        <GroupedBody
          config={config}
          field={groupField}
          columns={columns}
          grid={grid}
          collapsed={view.collapsed[groupField.key] ?? []}
          onToggle={(value) => toggleCollapsed(groupField.key, value)}
          onOpen={openDetail}
          onCreate={(value) => openCreate(createDraftFor(view, { [groupField.key]: value }))}
        />
      ) : (
        <FlatBody config={config} columns={columns} grid={grid} onOpen={openDetail} />
      )}
    </div>
  );
}

interface BodyProps {
  config: ITaskConfig;
  columns: ITaskFieldConfig[];
  grid: string;
  onOpen: (id: number) => void;
}

function GroupedBody({
  config,
  field,
  columns,
  grid,
  collapsed,
  onToggle,
  onOpen,
  onCreate
}: BodyProps & {
  field: ITaskFieldConfig;
  collapsed: string[];
  onToggle: (value: string) => void;
  onCreate: (value: string) => void;
}) {
  const { groups, error, isLoading } = useTaskGroups(config, field.key);
  if (!groups) return error ? <Empty>{error.message}</Empty> : <ProfitLoader size="small" />;
  if (!groups.groups.length) return <Empty>No hay tareas con estos filtros.</Empty>;

  return (
    <div className={cn(isLoading && "opacity-60")}>
      {groups.groups.map((group) => {
        const id = group.value ?? "none";
        return (
          <TaskGroup
            key={id}
            group={group}
            field={field}
            columns={columns}
            grid={grid}
            config={config}
            collapsed={collapsed.includes(id)}
            onToggle={() => onToggle(id)}
            onOpen={onOpen}
            onCreate={
              field.creatable && group.value !== null ? () => onCreate(group.value!) : undefined
            }
          />
        );
      })}
    </div>
  );
}

function FlatBody({ config, columns, grid, onOpen }: BodyProps) {
  const { items, total, error, isLoading, isLoadingMore, hasMore, loadMore } = useTaskList(
    config,
    true
  );
  if (isLoading && !items.length) return <ProfitLoader size="small" />;
  if (error) return <Empty>{error.message}</Empty>;
  if (!items.length) return <Empty>No hay tareas con estos filtros.</Empty>;

  return (
    <div>
      {items.map((t) => (
        <TaskRow
          key={t.id}
          ticket={t}
          columns={columns}
          grid={grid}
          config={config}
          onOpen={onOpen}
        />
      ))}
      <div className="flex h-[var(--table-total-h)] items-center gap-3 bg-cp-subtle px-4 text-[13px] text-cp-ink-3">
        <span>
          {items.length} de {total} tareas
        </span>
        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold text-cp-ink hover:underline disabled:cursor-default disabled:opacity-60"
          >
            {isLoadingMore ? "Cargando…" : "Cargar más"}
          </button>
        )}
      </div>
    </div>
  );
}
