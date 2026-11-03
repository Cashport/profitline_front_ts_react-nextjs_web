export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CLIENT" | "COMPLETED" | "CANCELLED";

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

/** Buckets de GET /tickets/summary; también es el param `situation` del listado. */
export type TicketSituation =
  | "pending"
  | "overdue"
  | "due_soon"
  | "completed_late"
  | "completed_on_time";

/** Llaves de campo del gestor de tareas (registro del backend). */
export type TaskFieldKey =
  | "title"
  | "client"
  | "data_client"
  | "country"
  | "process"
  | "category"
  | "amount"
  | "error_type"
  | "intake_type"
  | "priority"
  | "status"
  | "created_at"
  | "due_at"
  | "assignee"
  | "tier"
  | "description";

/** Cómo se pinta una celda o un input cuando la llave no tiene trato propio. */
export type TaskFieldType =
  | "text"
  | "longtext"
  | "client"
  | "data_client"
  | "country"
  | "process"
  | "option"
  | "category"
  | "money"
  | "priority"
  | "status"
  | "datetime"
  | "user";

/** Fila de GET /tickets y cuerpo de GET /tickets/:id. */
export interface ITicket {
  id: number;
  ticket_code: string;
  project_id: number;
  /** Con valor, el ticket es una acción de esa novedad. */
  incident_id: number | null;
  title: string;
  description: string | null;
  client_id: string | null;
  client_name: string | null;
  created_by_user_id: number;
  created_by_name: string | null;
  assigned_to_user_id: number;
  assigned_to_name: string | null;
  category_id: number | null;
  category_name: string | null;
  amount: number | null;
  status: TicketStatus;
  priority: TicketPriority;
  /** ISO8601; null cuando el ticket se creó sin fecha límite. */
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  resolution_comment: string | null;
  created_at: string;
  updated_at: string;
  process_id: number | null;
  process_name: string | null;
  process_color: string | null;
  client_data_id: number | null;
  client_data_name: string | null;
  country_id: number | null;
  country_name: string | null;
  country_code: string | null;
  intake_type_id: number | null;
  intake_type_name: string | null;
  intake_type_icon: string | null;
  intake_type_color: string | null;
  error_type_id: number | null;
  error_type_name: string | null;
  tier_id: number | null;
  tier_name: string | null;
  tier_color: string | null;
  /** Minutos abierta (hasta que se resolvió, o hasta ahora). */
  open_minutes: number;
}

/** Fila de GET /tickets/:id/history. */
export interface ITicketLog {
  id: number;
  ticket_id: number;
  event: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  performed_by: number;
  performed_by_name: string | null;
  created_at: string;
}

/** Opción de un campo (proceso, catálogo, país, responsable…). Valores siempre string. */
export interface ITaskConfigOption {
  value: string;
  label: string;
  color?: string | null;
  icon?: string | null;
  code?: string | null;
  is_default?: boolean;
}

/** Campo activo del proyecto, tal como lo resuelve GET /tickets/config. */
export interface ITaskFieldConfig {
  key: TaskFieldKey;
  label: string;
  column_label: string;
  type: TaskFieldType;
  required: boolean;
  show_in_list: boolean;
  order: number;
  groupable: boolean;
  sortable: boolean;
  filterable: boolean;
  creatable: boolean;
  editable: boolean;
  filter_param: string | null;
  body_key: string | null;
  nullable: boolean;
  default_sort_dir: "asc" | "desc";
  options_source: "config" | "remote" | "none";
  options?: ITaskConfigOption[];
}

export interface ITaskProcess {
  id: number;
  code: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface ITaskStatusMeta {
  key: TicketStatus;
  label: string;
  color: string;
  closed: boolean;
  order: number;
}

export interface ITaskPriorityMeta {
  key: TicketPriority;
  label: string;
  color: string;
  rank: number;
}

/** GET /tickets/config: qué usa el proyecto. El front solo pinta esto. */
export interface ITaskConfig {
  project_id: number;
  processes: ITaskProcess[];
  statuses: ITaskStatusMeta[];
  priorities: ITaskPriorityMeta[];
  transitions: Record<TicketStatus, TicketStatus[]>;
  fields: ITaskFieldConfig[];
  assignees: { id: number; name: string }[];
  defaults: {
    group_by: TaskFieldKey | null;
    sort_by: TaskFieldKey;
    sort_dir: "asc" | "desc";
    show_closed: boolean;
    priority: TicketPriority;
  };
}

export interface ITaskGroup {
  /** null = grupo "Sin …". */
  value: string | null;
  label: string;
  color: string | null;
  count: number;
  critical_count: number;
  /** null = el backend no precargó filas (grupo más allá del límite). */
  items: ITicket[] | null;
  has_more: boolean;
}

/** GET /tickets/groups. */
export interface ITaskGroups {
  group_by: TaskFieldKey;
  total: number;
  groups: ITaskGroup[];
}

export interface ITaskFacetValue {
  /** "none" = sin valor. */
  value: string;
  label: string;
  count: number;
}

/** GET /tickets/facets: conteos por valor; cada faceta ignora su propio filtro. */
export interface ITaskFacets {
  total: number;
  facets: Partial<Record<TaskFieldKey, ITaskFacetValue[]>>;
}

/** GET /tickets/options/:field (clientes). */
export interface ITaskOptionItem {
  id: string;
  label: string;
  extra?: { country_id?: number | null; impact_tier?: string | null };
}
