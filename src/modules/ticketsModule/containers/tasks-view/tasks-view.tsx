"use client";

import { useTicketsView } from "../../stores/tickets-view-store";
import ProfitLoader from "@/components/ui/profit-loader";
import ProcessBar from "../../components/process-bar/process-bar";
import TaskCreateModal from "../../components/task-create-modal/task-create-modal";
import TaskDetailModal from "../../components/task-detail-modal/task-detail-modal";
import TasksBoard from "../../components/tasks-board/tasks-board";
import TasksList from "../../components/tasks-list/tasks-list";
import TasksToolbar from "../../components/tasks-toolbar/tasks-toolbar";
import { useTaskConfig } from "../../hooks/useTaskConfig";
import { useTaskViewPersistence } from "../../hooks/useTaskViewPersistence";

/**
 * Gestor de tareas: barra de procesos (filtro principal) + controles de
 * vista, y la lista agrupada o el tablero. Las etiquetas de filtros,
 * "Filtrar" y el buscador van en el encabezado del layout.
 */
export default function TasksView() {
  const { config, error } = useTaskConfig();
  const ready = useTaskViewPersistence(config);
  const layout = useTicketsView((s) => s.view.layout);

  if (error) {
    return (
      <p className="p-9 text-center text-sm text-cp-magenta">
        {error.message || "No se pudo cargar la configuración de tareas."}
      </p>
    );
  }
  if (!config || !ready) return <ProfitLoader size="small" />;

  return (
    <div className="wallet-scope flex min-w-0 flex-col gap-[var(--section-gap)] pb-6">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <ProcessBar config={config} />
        <div className="ml-auto">
          <TasksToolbar config={config} />
        </div>
      </div>

      {layout === "board" ? <TasksBoard config={config} /> : <TasksList config={config} />}

      <TaskCreateModal config={config} />
      <TaskDetailModal config={config} />
    </div>
  );
}
