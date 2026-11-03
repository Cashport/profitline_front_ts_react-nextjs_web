import type { ITaskConfig, ITicket, TaskFieldKey } from "@/types/tickets/ITickets";

/** Valor de formulario: siempre string (ids incluidos) o null. */
export type TaskFormValues = Partial<Record<TaskFieldKey, string | null>>;

/** Propiedad de la fila que guarda el valor de cada campo editable. */
const TICKET_PROPERTY: Partial<Record<TaskFieldKey, keyof ITicket>> = {
  title: "title",
  description: "description",
  client: "client_id",
  data_client: "client_data_id",
  country: "country_id",
  process: "process_id",
  category: "category_id",
  amount: "amount",
  error_type: "error_type_id",
  intake_type: "intake_type_id",
  priority: "priority",
  due_at: "due_at",
  tier: "tier_id",
  assignee: "assigned_to_user_id"
};

export function ticketValue(ticket: ITicket, key: TaskFieldKey): string | null {
  const prop = TICKET_PROPERTY[key];
  if (!prop) return null;
  const value = ticket[prop];
  if (value === null || value === undefined || value === "") return null;
  return key === "due_at" ? String(value).slice(0, 10) : String(value);
}

/** Etiqueta legible del valor guardado (para el detalle y el historial). */
export function optionLabel(config: ITaskConfig, key: TaskFieldKey, value: string | null) {
  if (value === null) return "—";
  const field = config.fields.find((f) => f.key === key);
  return field?.options?.find((o) => o.value === value)?.label ?? value;
}

/** Valores iniciales de "Nueva tarea": prioridad e ingesta por defecto + lo que venga del draft. */
export function initialCreateValues(
  config: ITaskConfig,
  draft: Partial<Record<TaskFieldKey, string>>
): TaskFormValues {
  const values: TaskFormValues = {};
  if (config.fields.some((f) => f.key === "priority")) values.priority = config.defaults.priority;
  const intake = config.fields.find((f) => f.key === "intake_type");
  const fallback = intake?.options?.find((o) => o.is_default);
  if (fallback) values.intake_type = fallback.value;
  return { ...values, ...draft };
}

/** "YYYY-MM-DD" del formulario → fin de ese día, para que vencer hoy no cuente como vencida. */
export const toDueAt = (date: string) => `${date}T23:59:59`;
