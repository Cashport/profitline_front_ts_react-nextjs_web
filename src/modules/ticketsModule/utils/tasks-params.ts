import type { ITaskConfig } from "@/types/tickets/ITickets";
import type { TaskViewState } from "../types";

interface TaskParamsInput {
  config: ITaskConfig;
  filters: TaskViewState["filters"];
  created: TaskViewState["created"];
  showClosed: boolean;
  search?: string;
  sortBy?: string;
  sortDir?: string;
}

/**
 * Query string de los filtros comunes a /tickets, /tickets/groups y
 * /tickets/facets. Un solo armador para que lista, grupos, tablero y conteos
 * nunca filtren distinto. Cada campo usa el `filter_param` que manda el back.
 */
export function buildTaskParams({
  config,
  filters,
  created,
  showClosed,
  search,
  sortBy,
  sortDir
}: TaskParamsInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const field of config.fields) {
    const values = filters[field.key];
    if (!field.filter_param || !values?.length) continue;
    params.set(field.filter_param, values.join(","));
  }
  if (created.from) params.set("start_date", created.from);
  if (created.to) params.set("end_date", created.to);
  params.set("show_closed", String(showClosed));
  const term = search?.trim();
  if (term) params.set("search", term);
  if (sortBy) params.set("sort_by", sortBy);
  if (sortDir) params.set("sort_dir", sortDir);
  return params;
}
