"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import type {
  ITaskConfig,
  ITaskFieldConfig,
  ITaskGroup,
  TicketPriority,
  TicketStatus
} from "@/types/tickets/ITickets";
import { TASKS_PER_GROUP } from "../../constants";
import { useMoreTasks } from "../../hooks/useTaskData";
import { priorityMeta, statusMeta } from "../../utils/task-format";
import { TaskRow } from "./task-row";

interface TaskGroupProps {
  group: ITaskGroup;
  /** Campo por el que se agrupa. */
  field: ITaskFieldConfig;
  columns: ITaskFieldConfig[];
  grid: string;
  config: ITaskConfig;
  collapsed: boolean;
  onToggle: () => void;
  onOpen: (id: number) => void;
  /** "+": nueva tarea con el valor del grupo ya puesto. */
  onCreate?: () => void;
}

/** Color del punto del grupo: el que manda el back o el del estado/prioridad. */
function groupColor(group: ITaskGroup, field: ITaskFieldConfig, config: ITaskConfig) {
  if (group.color) return group.color;
  if (field.key === "status") return statusMeta(config, group.value as TicketStatus)?.color;
  if (field.key === "priority") return priorityMeta(config, group.value as TicketPriority)?.color;
  return undefined;
}

/**
 * Grupo plegable: "● Etiqueta  N · M críticas  +", sus filas y "Ver más".
 * Un grupo que llegó sin filas (más allá del límite del back) arranca
 * plegado y pide su primera página solo cuando se abre: con cientos de
 * grupos (p. ej. por cliente) no se disparan cientos de consultas.
 */
export default function TaskGroup({
  group,
  field,
  columns,
  grid,
  config,
  collapsed,
  onToggle,
  onOpen,
  onCreate
}: TaskGroupProps) {
  const preloaded = group.items !== null;
  const more = useMoreTasks(config, field, group.value, preloaded ? 2 : 1);
  const rows = [...(group.items ?? []), ...more.items];
  const remaining = Math.max(0, group.count - rows.length);

  const [lazyOpen, setLazyOpen] = useState(false);
  const isCollapsed = collapsed || (!preloaded && !lazyOpen);
  const toggle = () => {
    if (preloaded || lazyOpen) return onToggle();
    setLazyOpen(true);
    if (collapsed) onToggle();
  };

  // Grupo sin filas precargadas: la primera página se pide una sola vez al abrirlo.
  const requested = useRef(false);
  useEffect(() => {
    if (isCollapsed || preloaded || requested.current || group.count === 0) return;
    requested.current = true;
    more.loadMore();
  }, [isCollapsed, preloaded, group.count, more]);

  const Chevron = isCollapsed ? ChevronRight : ChevronDown;

  return (
    <section>
      <div className="flex h-[var(--table-title-h)] items-center gap-2 border-b border-cp-line px-4 text-[13px]">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!isCollapsed}
          className="flex min-w-0 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-cp-ink"
        >
          <Chevron className="h-4 w-4 shrink-0 text-cp-ink-3" />
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: groupColor(group, field, config) ?? "rgb(var(--cp-ink-4))" }}
          />
          <span className="truncate font-semibold">{group.label}</span>
          <span className="shrink-0 text-cp-ink-3">{group.count}</span>
          {group.critical_count > 0 && (
            <span className="shrink-0 text-[12px] font-semibold text-cp-magenta">
              · {group.critical_count} {group.critical_count === 1 ? "crítica" : "críticas"}
            </span>
          )}
        </button>
        {onCreate && (
          <button
            type="button"
            title={`Nueva tarea en ${group.label}`}
            aria-label={`Nueva tarea en ${group.label}`}
            onClick={onCreate}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-cp-ink-3 hover:bg-cp-muted hover:text-cp-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {rows.map((t) => (
            <TaskRow
              key={t.id}
              ticket={t}
              columns={columns}
              grid={grid}
              config={config}
              onOpen={onOpen}
            />
          ))}
          {remaining > 0 && (
            <button
              type="button"
              onClick={more.loadMore}
              disabled={more.isLoading}
              className="flex h-9 w-full cursor-pointer items-center border-0 border-b border-solid border-cp-line bg-transparent px-4 text-left text-[12.5px] font-semibold text-cp-ink-3 hover:text-cp-ink disabled:cursor-default disabled:opacity-60"
            >
              {more.isLoading
                ? "Cargando…"
                : `Ver ${Math.min(remaining, TASKS_PER_GROUP)} más de ${remaining}`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
