import type { ITaskConfig, TaskFieldKey } from "@/types/tickets/ITickets";
import { EMPTY_TASK_VIEW } from "../stores/tickets-view-store";
import type { TaskViewState } from "../types";

/* Última vista de cada usuario por proyecto, en el navegador. Es solo una
   comodidad: si no hay storage (modo privado, bloqueado) o el valor está
   dañado, se arranca con la vista por defecto del proyecto. */

const storageKey = (viewKey: string) => `cashport:tickets:view:v1:${viewKey}`;

export function loadTaskView(viewKey: string): unknown {
  try {
    const raw = window.localStorage.getItem(storageKey(viewKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTaskView(viewKey: string, view: TaskViewState) {
  try {
    window.localStorage.setItem(storageKey(viewKey), JSON.stringify(view));
  } catch {
    // Sin storage la vista simplemente no se recuerda.
  }
}

/** Vista por defecto del proyecto (lo que define GET /tickets/config). */
export function defaultTaskView(config: ITaskConfig): TaskViewState {
  return {
    ...EMPTY_TASK_VIEW,
    groupBy: config.defaults.group_by,
    sortBy: config.defaults.sort_by,
    sortDir: config.defaults.sort_dir,
    showClosed: config.defaults.show_closed
  };
}

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const isDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Limpia una vista guardada contra la config actual: un campo que el
 * proyecto apagó o un proceso que ya no existe no puede quedar como filtro,
 * agrupación u orden.
 */
export function sanitizeTaskView(raw: unknown, config: ITaskConfig): TaskViewState {
  const base = defaultTaskView(config);
  if (!raw || typeof raw !== "object") return base;
  const saved = raw as Partial<TaskViewState>;
  const fields = new Map(config.fields.map((f) => [f.key, f]));

  const filters: TaskViewState["filters"] = {};
  if (saved.filters && typeof saved.filters === "object") {
    for (const [key, values] of Object.entries(saved.filters)) {
      const field = fields.get(key as TaskFieldKey);
      if (!field?.filterable || !field.filter_param || !isStringList(values)) continue;
      const allowed = field.options_source === "config" ? field.options : undefined;
      const kept = allowed
        ? values.filter((v) => v === "none" || allowed.some((o) => o.value === v))
        : values;
      if (kept.length) filters[key as TaskFieldKey] = kept;
    }
  }

  const groupBy =
    saved.groupBy === null
      ? null
      : saved.groupBy && fields.get(saved.groupBy)?.groupable
        ? saved.groupBy
        : base.groupBy;
  const sortable = saved.sortBy && fields.get(saved.sortBy)?.sortable;

  const collapsed: TaskViewState["collapsed"] = {};
  if (saved.collapsed && typeof saved.collapsed === "object") {
    for (const [key, values] of Object.entries(saved.collapsed)) {
      if (fields.get(key as TaskFieldKey)?.groupable && isStringList(values)) {
        collapsed[key as TaskFieldKey] = values;
      }
    }
  }

  const createdFrom = saved.created?.from;
  const createdTo = saved.created?.to;
  return {
    filters,
    created: {
      from: isDate(createdFrom) ? createdFrom : null,
      to: isDate(createdTo) ? createdTo : null
    },
    groupBy,
    sortBy: sortable ? (saved.sortBy as TaskFieldKey) : base.sortBy,
    sortDir: saved.sortDir === "asc" || saved.sortDir === "desc" ? saved.sortDir : base.sortDir,
    layout: saved.layout === "board" ? "board" : "list",
    showClosed: typeof saved.showClosed === "boolean" ? saved.showClosed : base.showClosed,
    collapsed
  };
}
