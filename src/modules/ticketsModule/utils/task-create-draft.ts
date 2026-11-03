import type { TaskCreateDraft, TaskViewState } from "../types";

/**
 * Valores iniciales de "Nueva tarea": si la vista está en un solo proceso,
 * la tarea nace en ese proceso; `extra` (p. ej. el "+" de un grupo) gana.
 */
export function createDraftFor(view: TaskViewState, extra: TaskCreateDraft = {}): TaskCreateDraft {
  const draft: TaskCreateDraft = {};
  const processes = view.filters.process ?? [];
  if (processes.length === 1 && processes[0] !== "none") draft.process = processes[0];
  return { ...draft, ...extra };
}
