"use client";

import { useState } from "react";
import { DatePicker, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";

import { useDebounce } from "@/hooks/useDeabouce";
import type { ITaskFieldConfig, ITaskOptionItem } from "@/types/tickets/ITickets";
import { useTaskOptions } from "../../hooks/useTaskDetail";

interface TaskFieldInputProps {
  field: ITaskFieldConfig;
  value: string | null | undefined;
  /** `extra` llega al elegir un cliente (país, tier del cliente). */
  onChange: (value: string | null, extra?: ITaskOptionItem["extra"]) => void;
  /** Etiqueta del valor actual cuando es un cliente que aún no está en la búsqueda. */
  initialLabel?: string | null;
  disabled?: boolean;
}

/**
 * Input de un campo según su tipo (crear y editar tarea). Las opciones salen
 * de la config del proyecto; los clientes se buscan en el back.
 */
export default function TaskFieldInput({
  field,
  value,
  onChange,
  initialLabel,
  disabled
}: TaskFieldInputProps) {
  switch (field.type) {
    case "text":
      return (
        <Input
          value={value ?? ""}
          maxLength={255}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "longtext":
      return (
        <Input.TextArea
          value={value ?? ""}
          rows={3}
          maxLength={1000}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "money":
      return (
        <InputNumber
          className="w-full"
          min={0}
          value={value ? Number(value) : null}
          disabled={disabled}
          onChange={(n) => onChange(n === null ? null : String(n))}
        />
      );
    case "datetime":
      return (
        <DatePicker
          className="w-full"
          format="DD/MM/YYYY"
          value={value ? dayjs(value) : null}
          disabled={disabled}
          allowClear={!field.required}
          onChange={(d) => onChange(d ? d.format("YYYY-MM-DD") : null)}
        />
      );
    case "client":
    case "data_client":
      return (
        <RemoteClientSelect
          field={field}
          value={value}
          onChange={onChange}
          initialLabel={initialLabel}
          disabled={disabled}
        />
      );
    default:
      return (
        <Select
          className="w-full"
          showSearch
          optionFilterProp="label"
          allowClear={!field.required}
          disabled={disabled}
          placeholder={field.key === "assignee" ? "Yo (por defecto)" : undefined}
          value={value ?? undefined}
          options={(field.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
          onChange={(v?: string) => onChange(v ?? null)}
        />
      );
  }
}

function RemoteClientSelect({
  field,
  value,
  onChange,
  initialLabel,
  disabled
}: Omit<TaskFieldInputProps, "field"> & { field: ITaskFieldConfig }) {
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 300);
  const { options, isLoading } = useTaskOptions(
    field.key === "data_client" ? "data_client" : "client",
    debounced
  );
  const items = options.map((o) => ({ value: o.id, label: o.label, extra: o.extra }));
  if (value && !items.some((o) => o.value === value)) {
    items.unshift({ value, label: initialLabel ?? value, extra: undefined });
  }

  return (
    <Select
      className="w-full"
      showSearch
      filterOption={false}
      allowClear={!field.required}
      disabled={disabled}
      loading={isLoading}
      placeholder="Buscar cliente…"
      notFoundContent={isLoading ? "Buscando…" : "Sin resultados"}
      value={value ?? undefined}
      options={items}
      onSearch={setTerm}
      onChange={(v?: string, option?: unknown) =>
        onChange(v ?? null, (option as { extra?: ITaskOptionItem["extra"] } | undefined)?.extra)
      }
    />
  );
}
