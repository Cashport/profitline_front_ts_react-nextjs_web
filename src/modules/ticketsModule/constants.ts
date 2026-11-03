import type { TaskFieldKey } from "@/types/tickets/ITickets";

/** Filas que trae cada grupo (y cada página de "Ver más"). */
export const TASKS_PER_GROUP = 25;
/** Grupos que llegan con filas; el resto se cargan al desplegarlos. */
export const TASKS_MAX_ITEM_GROUPS = 20;
/** Página de la lista sin agrupar. */
export const TASKS_PAGE_SIZE = 50;

/** A partir de aquí la antigüedad de una tarea abierta se pinta en rojo. */
export const TASK_AGE_ALERT_MINUTES = 72 * 60;

export interface TaskColumnLayout {
  /** Ancho en el grid (siempre con minmax(0, …) o fijo). */
  width: string;
  /** Ancho mínimo estimado, para decidir qué columnas caben. */
  min: number;
  /** Menor = se esconde antes cuando no cabe (DESIGN.md §7). Infinity = nunca. */
  priority: number;
  align?: "left" | "right";
}

/** Columnas de la lista: ancho y prioridad de cada campo. */
export const TASK_COLUMN_LAYOUT: Record<TaskFieldKey, TaskColumnLayout> = {
  title: { width: "minmax(0,2.6fr)", min: 220, priority: Infinity },
  status: { width: "minmax(0,1.1fr)", min: 120, priority: 90 },
  priority: { width: "minmax(0,0.8fr)", min: 84, priority: 85 },
  client: { width: "minmax(0,1.4fr)", min: 120, priority: 80 },
  data_client: { width: "minmax(0,1.4fr)", min: 120, priority: 80 },
  process: { width: "minmax(0,1fr)", min: 110, priority: 70 },
  assignee: { width: "44px", min: 44, priority: 65 },
  created_at: { width: "72px", min: 72, priority: 60, align: "right" },
  due_at: { width: "88px", min: 88, priority: 55, align: "right" },
  intake_type: { width: "minmax(0,1.2fr)", min: 130, priority: 50 },
  error_type: { width: "minmax(0,1.2fr)", min: 120, priority: 45 },
  category: { width: "minmax(0,1fr)", min: 110, priority: 40 },
  amount: { width: "minmax(0,0.8fr)", min: 90, priority: 40, align: "right" },
  country: { width: "48px", min: 48, priority: 35 },
  tier: { width: "minmax(0,0.7fr)", min: 76, priority: 30 },
  description: { width: "minmax(0,1.5fr)", min: 160, priority: 10 }
};
