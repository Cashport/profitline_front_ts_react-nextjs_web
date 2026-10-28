"use client";

import BoardLanes, { type BoardLane } from "@/components/ui/board-lanes/board-lanes";
import ProfitLoader from "@/components/ui/profit-loader";
import { cn } from "@/utils/utils";
import type { ITaskConfig, ITaskGroup, ITicket } from "@/types/tickets/ITickets";
import { TASKS_PER_GROUP } from "../../constants";
import { fieldOf } from "../../hooks/useTaskConfig";
import { useMoreTasks, useTaskGroups } from "../../hooks/useTaskData";
import { useTicketsView } from "../../stores/tickets-view-store";
import { statusMeta } from "../../utils/task-format";
import TaskBoardCard from "./task-board-card";

/**
 * Vista Tablero: una columna por estado (los cerrados solo con "Mostrar
 * cerradas"). Sin arrastrar: el estado se cambia desde el detalle.
 */
export default function TasksBoard({ config }: { config: ITaskConfig }) {
  const openDetail = useTicketsView((s) => s.openDetail);
  const { groups, error, isLoading } = useTaskGroups(config, "status");

  if (!groups) {
    return error ? (
      <p className="p-9 text-center text-sm text-cp-magenta">{error.message}</p>
    ) : (
      <ProfitLoader size="small" />
    );
  }

  const lanes: BoardLane<ITicket>[] = groups.groups.map((group) => ({
    id: group.value ?? "none",
    title: group.label,
    color: group.color ?? statusMeta(config, group.value as ITicket["status"])?.color,
    count: group.count,
    items: group.items ?? [],
    // Solo con más tareas de las precargadas; una columna vacía muestra "Sin tareas".
    footer:
      group.count > (group.items?.length ?? 0) ? (
        <LaneMore config={config} group={group} onOpen={openDetail} />
      ) : undefined
  }));

  return (
    <div className={cn(isLoading && "pointer-events-none opacity-60")}>
      <BoardLanes
        lanes={lanes}
        emptyLabel="Sin tareas"
        renderCard={(t) => (
          <TaskBoardCard key={t.id} ticket={t} config={config} onOpen={openDetail} />
        )}
      />
    </div>
  );
}

/** Tarjetas extra de una columna ("Ver más"), con el mismo orden que la primera página. */
function LaneMore({
  config,
  group,
  onOpen
}: {
  config: ITaskConfig;
  group: ITaskGroup;
  onOpen: (id: number) => void;
}) {
  const more = useMoreTasks(config, fieldOf(config, "status"), group.value, group.items ? 2 : 1);
  const shown = (group.items?.length ?? 0) + more.items.length;
  const remaining = Math.max(0, group.count - shown);

  return (
    <>
      {more.items.map((t) => (
        <TaskBoardCard key={t.id} ticket={t} config={config} onOpen={onOpen} />
      ))}
      {remaining > 0 && (
        <button
          type="button"
          onClick={more.loadMore}
          disabled={more.isLoading}
          className="cursor-pointer rounded-md border border-dashed border-border bg-transparent py-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-60"
        >
          {more.isLoading
            ? "Cargando…"
            : `Ver ${Math.min(remaining, TASKS_PER_GROUP)} más de ${remaining}`}
        </button>
      )}
    </>
  );
}
