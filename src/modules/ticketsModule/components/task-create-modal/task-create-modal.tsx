"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Modal } from "antd";
import { useShallow } from "zustand/react/shallow";

import { useMessageApi } from "@/context/MessageContext";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { createTask, type TaskBody } from "@/services/tickets/tickets";
import type { ITaskConfig, ITaskFieldConfig } from "@/types/tickets/ITickets";
import { useTaskOptions } from "../../hooks/useTaskDetail";
import { useTicketsView } from "../../stores/tickets-view-store";
import type { TaskCreateDraft } from "../../types";
import { taskErrorMessage } from "../../utils/task-errors";
import { initialCreateValues, toDueAt, type TaskFormValues } from "../../utils/task-values";
import TaskFormField, { type TaskFieldChange } from "../task-form-field/task-form-field";

/** Campos del formulario: los que el proyecto deja crear; título primero, descripción al final. */
const creatableFields = (config: ITaskConfig) =>
  config.fields
    .filter((f) => f.creatable && f.body_key)
    .sort((a, b) => {
      const rank = (f: ITaskFieldConfig) =>
        f.key === "title" ? -1 : f.key === "description" ? 1 : 0;
      return rank(a) - rank(b) || a.order - b.order;
    });

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
 * vuelve a validar todo contra la config. El estado vive en `TaskCreateForm`
 * para que escribir no re-renderice el Modal (ver `TaskFormField`).
 */
export default function TaskCreateModal({ config }: { config: ITaskConfig }) {
  const { draft, closeCreate } = useTicketsView(
    useShallow((s) => ({ draft: s.createDraft, closeCreate: s.closeCreate }))
  );
  const { resolvedTheme } = useWalletTheme();
  const formRef = useRef<TaskCreateFormHandle>(null);
  const [saving, setSaving] = useState(false);

  return (
    <Modal
      open={draft !== null}
      title="Nueva tarea"
      onCancel={closeCreate}
      onOk={() => formRef.current?.submit()}
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
      <TaskCreateForm ref={formRef} config={config} draft={draft} onSavingChange={setSaving} />
    </Modal>
  );
}

interface TaskCreateFormHandle {
  submit: () => Promise<void>;
}

interface TaskCreateFormProps {
  config: ITaskConfig;
  draft: TaskCreateDraft | null;
  onSavingChange: (saving: boolean) => void;
}

const TaskCreateForm = forwardRef<TaskCreateFormHandle, TaskCreateFormProps>(
  function TaskCreateForm({ config, draft, onSavingChange }, ref) {
    const { closeCreate, refresh, openDetail } = useTicketsView(
      useShallow((s) => ({
        closeCreate: s.closeCreate,
        refresh: s.refresh,
        openDetail: s.openDetail
      }))
    );
    const { showMessage } = useMessageApi();
    const [values, setValues] = useState<TaskFormValues>({});

    useEffect(() => {
      if (draft) setValues(initialCreateValues(config, draft));
    }, [draft, config]);

    const fields = creatableFields(config);
    const hasCountry = fields.some((f) => f.key === "country");

    // "+" de un grupo por cliente: llega solo el id; el país se completa como al elegirlo a mano.
    const draftClient = draft?.data_client ?? null;
    const draftClientOptions = useTaskOptions(
      draftClient && hasCountry ? "data_client" : null,
      "",
      draftClient ? [draftClient] : []
    ).options;
    useEffect(() => {
      const countryId = draftClientOptions.find((o) => o.id === draftClient)?.extra?.country_id;
      if (!countryId) return;
      setValues((prev) =>
        prev.country || prev.data_client !== draftClient
          ? prev
          : { ...prev, country: String(countryId) }
      );
    }, [draftClientOptions, draftClient]);

    const setValue = useCallback<TaskFieldChange>(
      (key, value, extra) =>
        setValues((prev) => {
          const next = { ...prev, [key]: value };
          // Cliente de ingesta: su país queda puesto si no se eligió otro.
          if (key === "data_client" && hasCountry && !prev.country && extra?.country_id) {
            next.country = String(extra.country_id);
          }
          return next;
        }),
      [hasCountry]
    );

    const submit = async () => {
      const missing = fields.filter((f) => f.required && !values[f.key]?.trim());
      if (missing.length) {
        showMessage("warning", `Falta: ${missing.map((f) => f.label).join(", ")}`);
        return;
      }
      onSavingChange(true);
      try {
        const created = await createTask(toBody(fields, values));
        showMessage("success", `Tarea ${created.ticket_code} creada`);
        refresh();
        closeCreate();
        openDetail(created.id);
      } catch (error) {
        showMessage("error", taskErrorMessage(error, config, "No se pudo crear la tarea"));
      } finally {
        onSavingChange(false);
      }
    };

    useImperativeHandle(ref, () => ({ submit }));

    return (
      <div className="wallet-scope grid grid-cols-1 gap-x-4 gap-y-3 pt-2 sm:grid-cols-2">
        {fields.map((f) => (
          <TaskFormField key={f.key} field={f} value={values[f.key]} onFieldChange={setValue} />
        ))}
      </div>
    );
  }
);
