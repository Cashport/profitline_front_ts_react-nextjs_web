"use client";

import { useEffect, useState } from "react";
import { Modal } from "antd";
import { useShallow } from "zustand/react/shallow";

import { useMessageApi } from "@/context/MessageContext";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { createTask, type TaskBody } from "@/services/tickets/tickets";
import type {
  ITaskConfig,
  ITaskFieldConfig,
  ITaskOptionItem,
  TaskFieldKey
} from "@/types/tickets/ITickets";
import { cn } from "@/utils/utils";
import { useTicketsView } from "../../stores/tickets-view-store";
import { initialCreateValues, toDueAt, type TaskFormValues } from "../../utils/task-values";
import TaskFieldInput from "../task-field-input/task-field-input";

/** Campos del formulario: los que el proyecto deja crear; título primero, descripción al final. */
const creatableFields = (config: ITaskConfig) =>
  config.fields
    .filter((f) => f.creatable && f.body_key)
    .sort((a, b) => {
      const rank = (f: ITaskFieldConfig) =>
        f.key === "title" ? -1 : f.key === "description" ? 1 : 0;
      return rank(a) - rank(b) || a.order - b.order;
    });

const isWide = (f: ITaskFieldConfig) => f.type === "text" || f.type === "longtext";

export function toBody(fields: ITaskFieldConfig[], values: TaskFormValues): TaskBody {
  const body: TaskBody = {};
  for (const f of fields) {
    const v = values[f.key];
    if (!f.body_key || v === undefined) continue;
    body[f.body_key] = v === null ? null : f.key === "due_at" ? toDueAt(v) : v;
  }
  return body;
}

/**
 * "Nueva tarea": formulario armado con los campos activos del proyecto. Se
 * abre con valores iniciales (proceso elegido, "+" de un grupo). El back
 * vuelve a validar todo contra la config.
 */
export default function TaskCreateModal({ config }: { config: ITaskConfig }) {
  const { draft, closeCreate, refresh, openDetail } = useTicketsView(
    useShallow((s) => ({
      draft: s.createDraft,
      closeCreate: s.closeCreate,
      refresh: s.refresh,
      openDetail: s.openDetail
    }))
  );
  const { showMessage } = useMessageApi();
  const { resolvedTheme } = useWalletTheme();
  const [values, setValues] = useState<TaskFormValues>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft) setValues(initialCreateValues(config, draft));
  }, [draft, config]);

  const fields = creatableFields(config);
  const hasCountry = fields.some((f) => f.key === "country");

  const setValue = (key: TaskFieldKey, value: string | null, extra?: ITaskOptionItem["extra"]) =>
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // Cliente de ingesta: su país queda puesto si no se eligió otro.
      if (key === "data_client" && hasCountry && !prev.country && extra?.country_id) {
        next.country = String(extra.country_id);
      }
      return next;
    });

  const submit = async () => {
    const missing = fields.filter((f) => f.required && !values[f.key]?.trim());
    if (missing.length) {
      showMessage("warning", `Falta: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    setSaving(true);
    try {
      const created = await createTask(toBody(fields, values));
      showMessage("success", `Tarea ${created.ticket_code} creada`);
      refresh();
      closeCreate();
      openDetail(created.id);
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo crear la tarea");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={draft !== null}
      title="Nueva tarea"
      onCancel={closeCreate}
      onOk={submit}
      okText="Crear tarea"
      cancelText="Cancelar"
      confirmLoading={saving}
      destroyOnClose
      centered
      width="min(720px, 95 * var(--vw))"
      // El modal vive en un portal fuera de .wallet-scope y del contenedor .dark.
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      okButtonProps={{ className: "!text-[#141414]" }}
    >
      <div className="wallet-scope grid grid-cols-1 gap-x-4 gap-y-3 pt-2 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.key}
            className={cn("flex min-w-0 flex-col gap-1", isWide(f) && "sm:col-span-2")}
          >
            <span className="text-[12px] font-semibold text-cp-ink-2">
              {f.label}
              {f.required && <span className="text-cp-magenta"> *</span>}
            </span>
            <TaskFieldInput
              field={f}
              value={values[f.key]}
              onChange={(v, extra) => setValue(f.key, v, extra)}
            />
          </label>
        ))}
      </div>
    </Modal>
  );
}
