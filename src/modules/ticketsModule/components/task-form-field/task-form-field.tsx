"use client";

import { memo } from "react";

import type { ITaskFieldConfig, ITaskOptionItem, TaskFieldKey } from "@/types/tickets/ITickets";
import { cn } from "@/utils/utils";
import TaskFieldInput from "../task-field-input/task-field-input";

export type TaskFieldChange = (
  key: TaskFieldKey,
  value: string | null,
  extra?: ITaskOptionItem["extra"]
) => void;

interface TaskFormFieldProps {
  field: ITaskFieldConfig;
  value: string | null | undefined;
  /** Debe ser estable (useCallback): si cambia, se re-renderizan todos los campos. */
  onFieldChange: TaskFieldChange;
  initialLabel?: string | null;
}

const isWide = (f: ITaskFieldConfig) => f.type === "text" || f.type === "longtext";

/**
 * Campo con etiqueta de crear/editar tarea. Memoizado a propósito: cada Select
 * de antd monta un Portal que hace setState en cada render, y si una tecla
 * re-renderiza todos los campos React acumula esas actualizaciones hasta
 * "Maximum update depth exceeded" (#185) y se pierde la tecla. Así, escribir
 * en un campo solo re-renderiza ese campo.
 */
const TaskFormField = memo(function TaskFormField({
  field,
  value,
  onFieldChange,
  initialLabel
}: TaskFormFieldProps) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1", isWide(field) && "sm:col-span-2")}>
      <span className="text-[13px] font-semibold text-cp-ink-2">
        {field.label}
        {field.required && <span className="text-cp-magenta"> *</span>}
      </span>
      <TaskFieldInput
        field={field}
        value={value}
        initialLabel={initialLabel}
        onChange={(v, extra) => onFieldChange(field.key, v, extra)}
      />
    </label>
  );
});

export default TaskFormField;
