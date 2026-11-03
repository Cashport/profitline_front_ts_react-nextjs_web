"use client";

import SortArrows from "@/components/ui/sort-arrows/sort-arrows";
import { cn } from "@/utils/utils";
import type { ITaskConfig, ITaskFieldConfig, ITicket } from "@/types/tickets/ITickets";
import { TASK_COLUMN_LAYOUT } from "../../constants";
import { TaskCell } from "../task-cells/task-cells";

interface TaskHeaderRowProps {
  columns: ITaskFieldConfig[];
  grid: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSort: (field: ITaskFieldConfig) => void;
}

/** Encabezado sticky (bajo el header de la página); clic en una columna ordenable cambia el orden. */
export function TaskHeaderRow({ columns, grid, sortBy, sortDir, onSort }: TaskHeaderRowProps) {
  return (
    <div
      className="sticky top-[var(--header-h)] z-10 grid h-[var(--table-head-h)] items-center gap-3 rounded-t-[var(--card-radius)] border-b border-cp-line bg-cp-surface px-4 text-[13.5px] font-semibold text-cp-ink"
      style={{ gridTemplateColumns: grid }}
    >
      {columns.map((c) => {
        const active = sortBy === c.key;
        const right = TASK_COLUMN_LAYOUT[c.key].align === "right";
        if (!c.sortable) {
          return (
            <span key={c.key} className={cn("truncate", right && "text-right")} title={c.label}>
              {c.column_label}
            </span>
          );
        }
        return (
          <button
            key={c.key}
            type="button"
            title={`Ordenar por ${c.label.toLowerCase()}`}
            onClick={() => onSort(c)}
            className={cn(
              "flex min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-left font-semibold text-cp-ink",
              right && "justify-end"
            )}
          >
            <span className="truncate">{c.column_label}</span>
            <SortArrows dir={active ? sortDir : null} />
          </button>
        );
      })}
    </div>
  );
}

interface TaskRowProps {
  ticket: ITicket;
  columns: ITaskFieldConfig[];
  grid: string;
  config: ITaskConfig;
  onOpen: (id: number) => void;
}

export function TaskRow({ ticket, columns, grid, config, onOpen }: TaskRowProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ticket.id)}
      className="grid h-[var(--table-row-h-single)] w-full cursor-pointer items-center gap-3 border-0 border-b border-solid border-cp-line bg-transparent px-4 text-left text-[13px] text-cp-ink-2 hover:bg-cp-subtle"
      style={{ gridTemplateColumns: grid }}
    >
      {columns.map((c) => (
        <span
          key={c.key}
          className={cn(
            "flex min-w-0 items-center",
            TASK_COLUMN_LAYOUT[c.key].align === "right" && "justify-end"
          )}
        >
          <TaskCell field={c} ticket={ticket} config={config} />
        </span>
      ))}
    </button>
  );
}
