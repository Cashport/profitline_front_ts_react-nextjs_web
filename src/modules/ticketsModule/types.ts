import type { TaskFieldKey } from "@/types/tickets/ITickets";

export type TaskLayout = "list" | "board";

/**
 * Vista del gestor de tareas: agrupar + ordenar + filtrar. Es lo que se
 * recuerda por usuario y proyecto (localStorage); la búsqueda no se guarda.
 */
export interface TaskViewState {
  /** Valores por llave de campo; "none" = sin valor. El proceso también vive aquí. */
  filters: Partial<Record<TaskFieldKey, string[]>>;
  /** Rango de creación (YYYY-MM-DD). */
  created: { from: string | null; to: string | null };
  /** null = sin agrupar. */
  groupBy: TaskFieldKey | null;
  sortBy: TaskFieldKey;
  sortDir: "asc" | "desc";
  layout: TaskLayout;
  showClosed: boolean;
  /** Grupos plegados, por campo de agrupación. */
  collapsed: Partial<Record<TaskFieldKey, string[]>>;
}

/** Valores iniciales de "Nueva tarea" (proceso elegido, "+" de un grupo). */
export type TaskCreateDraft = Partial<Record<TaskFieldKey, string>>;
