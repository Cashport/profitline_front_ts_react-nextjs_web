import { useEffect } from "react";

import { useAppStore } from "@/lib/store/store";
import type { ITaskConfig } from "@/types/tickets/ITickets";
import { useTicketsView } from "../stores/tickets-view-store";
import { loadTaskView, sanitizeTaskView, saveTaskView } from "../utils/task-view-storage";

/**
 * Recuerda la última vista (agrupar, ordenar, filtros, lista/tablero) de
 * cada usuario en cada proyecto. Al entrar —o al cambiar de proyecto— la
 * carga ya limpia contra la config; después la guarda con cada cambio.
 */
export function useTaskViewPersistence(config: ITaskConfig | undefined) {
  const userId = useAppStore((s) => s.userId);
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const viewKey = useTicketsView((s) => s.viewKey);
  const view = useTicketsView((s) => s.view);
  const hydrate = useTicketsView((s) => s.hydrate);

  // La config debe ser la del proyecto actual: tras cambiar de proyecto llega un instante después.
  const ready = Boolean(config && projectId && config.project_id === projectId);
  const currentKey = ready ? `${userId || 0}:${projectId}` : null;

  useEffect(() => {
    if (!currentKey || !config || viewKey === currentKey) return;
    hydrate(currentKey, sanitizeTaskView(loadTaskView(currentKey), config));
  }, [currentKey, config, viewKey, hydrate]);

  useEffect(() => {
    if (!viewKey || viewKey !== currentKey) return;
    const timer = setTimeout(() => saveTaskView(viewKey, view), 300);
    return () => clearTimeout(timer);
  }, [view, viewKey, currentKey]);

  return viewKey !== null && viewKey === currentKey;
}
