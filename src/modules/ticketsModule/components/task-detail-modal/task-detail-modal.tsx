"use client";

import { useEffect, useState } from "react";
import { Button, Input, Modal, Select } from "antd";
import { X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import ProfitLoader from "@/components/ui/profit-loader";
import { useMessageApi } from "@/context/MessageContext";
import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import { updateTask, updateTaskAssignee, updateTaskStatus } from "@/services/tickets/tickets";
import type {
  ITaskConfig,
  ITaskFieldConfig,
  ITicket,
  ITicketLog,
  TaskFieldKey,
  TicketStatus
} from "@/types/tickets/ITickets";
import { useTaskDetail, useTaskHistory } from "../../hooks/useTaskDetail";
import { useTicketsView } from "../../stores/tickets-view-store";
import { formatAge, formatTaskDate, statusMeta } from "../../utils/task-format";
import { optionLabel, ticketValue, type TaskFormValues } from "../../utils/task-values";
import { StatusLabel, TaskCell } from "../task-cells/task-cells";
import { toBody } from "../task-create-modal/task-create-modal";
import TaskFieldInput from "../task-field-input/task-field-input";

/** Campos que van en la cuadrícula del detalle (título, estado, responsable y descripción van aparte). */
const OWN_PLACE: TaskFieldKey[] = ["title", "status", "assignee", "description", "created_at"];

const EVENT_LABEL: Record<string, string> = {
  CREATED: "creó la tarea",
  ASSIGNED: "asignó",
  REASSIGNED: "reasignó",
  STATUS_CHANGED: "cambió el estado",
  COMPLETED: "resolvió la tarea",
  CANCELLED: "canceló la tarea",
  DUE_DATE_CHANGED: "cambió la fecha límite",
  AMOUNT_CHANGED: "cambió el monto",
  FIELD_CHANGED: "cambió"
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-0.5 text-[13px] font-semibold text-cp-ink-3">
    {children}
  </div>
);

/** Acción para pasar al estado `to` (texto del botón). */
const actionLabel = (config: ITaskConfig, to: TicketStatus) =>
  to === "COMPLETED"
    ? "Resolver"
    : to === "CANCELLED"
      ? "Cancelar tarea"
      : `Pasar a ${statusMeta(config, to)?.label.toLowerCase() ?? to}`;

/** Detalle de una tarea: estado, edición de los campos del proyecto, responsable e historial. */
export default function TaskDetailModal({ config }: { config: ITaskConfig }) {
  const { detailId, closeDetail } = useTicketsView(
    useShallow((s) => ({ detailId: s.detailId, closeDetail: s.closeDetail }))
  );
  const { resolvedTheme } = useWalletTheme();
  const { ticket, isLoading, error } = useTaskDetail(detailId);

  return (
    <Modal
      open={detailId !== null}
      onCancel={closeDetail}
      footer={null}
      closeIcon={null}
      centered
      destroyOnClose
      width="min(760px, 95 * var(--vw))"
      // El modal vive en un portal fuera de .wallet-scope y del contenedor .dark.
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
      styles={{ body: { padding: 0 }, content: { padding: 0, overflow: "hidden" } }}
    >
      <div className="wallet-scope relative min-h-[220px] bg-cp-surface px-6 pb-6 pt-5 text-cp-ink">
        <button
          type="button"
          aria-label="Cerrar"
          onClick={closeDetail}
          className="absolute right-4 top-4 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] border-0 bg-cp-muted text-cp-ink-3 hover:text-cp-ink"
        >
          <X className="h-4 w-4" />
        </button>
        {ticket ? (
          <DetailBody key={ticket.id} ticket={ticket} config={config} />
        ) : (
          <div className="flex min-h-[180px] items-center justify-center">
            {isLoading ? (
              <ProfitLoader size="small" />
            ) : (
              <p className="px-6 text-center text-[13px] text-cp-magenta">
                {(error as Error)?.message || "No se pudo cargar la tarea."}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailBody({ ticket: t, config }: { ticket: ITicket; config: ITaskConfig }) {
  const refresh = useTicketsView((s) => s.refresh);
  const { showMessage } = useMessageApi();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<TaskFormValues>({});
  const [target, setTarget] = useState<TicketStatus | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const editable = config.fields.filter((f) => f.editable && f.body_key);
  const gridFields = config.fields.filter((f) => !OWN_PLACE.includes(f.key));
  const assigneeField = config.fields.find((f) => f.key === "assignee");
  const transitions = config.transitions[t.status] ?? [];

  useEffect(() => {
    setValues(Object.fromEntries(editable.map((f) => [f.key, ticketValue(t, f.key)])));
    // Solo al abrir otra tarea o al terminar de editar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, editing]);

  const run = async (action: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await action();
      showMessage("success", ok);
      refresh();
      return true;
    } catch (error) {
      showMessage("error", (error as Error).message || "No se pudo guardar");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (to: TicketStatus) => {
    const closing = to === "COMPLETED" || to === "CANCELLED";
    if (closing && target !== to) {
      setTarget(to);
      return;
    }
    const done = await run(
      () => updateTaskStatus(t.id, to, closing ? comment : null),
      `Estado: ${statusMeta(config, to)?.label ?? to}`
    );
    if (done) {
      setTarget(null);
      setComment("");
    }
  };

  const saveEdit = async () => {
    const changed = editable.filter((f) => (values[f.key] ?? null) !== ticketValue(t, f.key));
    if (!changed.length) {
      setEditing(false);
      return;
    }
    const done = await run(() => updateTask(t.id, toBody(changed, values)), "Tarea actualizada");
    if (done) setEditing(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pr-10 text-[13px]">
        <span className="font-mono text-cp-ink-3">{t.ticket_code}</span>
        <StatusLabel config={config} ticket={t} />
        {t.incident_id && (
          <span className="rounded-[5px] bg-cp-muted px-1.5 text-[13px] text-cp-ink-3">
            Novedad #{t.incident_id}
          </span>
        )}
        <span className="text-cp-ink-3">
          · Abierta hace {formatAge(t.open_minutes)} · Creada {formatTaskDate(t.created_at)} por{" "}
          {t.created_by_name ?? "—"}
        </span>
      </div>

      {editing ? (
        <EditForm fields={editable} ticket={t} values={values} onChange={setValues} />
      ) : (
        <>
          <h3 className="mt-2 text-[16px] font-semibold leading-snug">{t.title}</h3>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
            {gridFields.map((f) => (
              <div key={f.key} className="min-w-0 text-[13px] text-cp-ink-2">
                <Label>{f.label}</Label>
                <div className="flex min-w-0">
                  <TaskCell field={f} ticket={t} config={config} />
                </div>
              </div>
            ))}
            {assigneeField && (
              <div className="min-w-0 text-[13px]">
                <Label>{assigneeField.label}</Label>
                <Select
                  size="small"
                  className="w-full"
                  showSearch
                  optionFilterProp="label"
                  disabled={busy}
                  value={String(t.assigned_to_user_id)}
                  options={config.assignees.map((u) => ({ value: String(u.id), label: u.name }))}
                  onChange={(v: string) =>
                    run(() => updateTaskAssignee(t.id, Number(v)), "Responsable actualizado")
                  }
                />
              </div>
            )}
          </div>
          {t.description && (
            <div className="mt-4 border-t border-cp-line pt-3.5">
              <Label>Descripción</Label>
              <p className="whitespace-pre-line text-[13px] leading-relaxed">{t.description}</p>
            </div>
          )}
          {t.resolution_comment && (
            <div className="mt-3">
              <Label>Comentario de cierre</Label>
              <p className="whitespace-pre-line text-[13px]">{t.resolution_comment}</p>
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-cp-line pt-4">
        {editing ? (
          <>
            <Button type="primary" loading={busy} onClick={saveEdit} className="!text-[#141414]">
              Guardar cambios
            </Button>
            <Button onClick={() => setEditing(false)} disabled={busy}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            {transitions.map((to) => (
              <Button
                key={to}
                disabled={busy}
                type={to === "COMPLETED" ? "primary" : "default"}
                className={to === "COMPLETED" ? "!text-[#141414]" : undefined}
                onClick={() => changeStatus(to)}
              >
                {actionLabel(config, to)}
              </Button>
            ))}
            {editable.length > 0 && (
              <Button type="text" className="ml-auto" onClick={() => setEditing(true)}>
                Editar
              </Button>
            )}
          </>
        )}
      </div>

      {target && !editing && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-cp-subtle p-3">
          <span className="text-[13px] font-semibold text-cp-ink-2">
            {target === "COMPLETED" ? "¿Cómo se resolvió?" : "¿Por qué se cancela?"} (opcional)
          </span>
          <Input.TextArea
            rows={2}
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="primary"
              loading={busy}
              className="!text-[#141414]"
              onClick={() => changeStatus(target)}
            >
              {target === "COMPLETED" ? "Confirmar resolución" : "Confirmar cancelación"}
            </Button>
            <Button onClick={() => setTarget(null)} disabled={busy}>
              Volver
            </Button>
          </div>
        </div>
      )}

      <History ticketId={t.id} config={config} />
    </>
  );
}

function EditForm({
  fields,
  ticket,
  values,
  onChange
}: {
  fields: ITaskFieldConfig[];
  ticket: ITicket;
  values: TaskFormValues;
  onChange: (next: TaskFormValues) => void;
}) {
  const initialLabel = (key: TaskFieldKey) =>
    key === "client" ? ticket.client_name : key === "data_client" ? ticket.client_data_name : null;
  return (
    <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
      {fields.map((f) => (
        <label
          key={f.key}
          className={
            f.type === "text" || f.type === "longtext"
              ? "flex flex-col gap-1 sm:col-span-2"
              : "flex flex-col gap-1"
          }
        >
          <span className="text-[13px] font-semibold text-cp-ink-2">
            {f.label}
            {f.required && <span className="text-cp-magenta"> *</span>}
          </span>
          <TaskFieldInput
            field={f}
            value={values[f.key]}
            initialLabel={initialLabel(f.key)}
            onChange={(v) => onChange({ ...values, [f.key]: v })}
          />
        </label>
      ))}
    </div>
  );
}

/** Columna de BD del log → llave de campo (para mostrar etiquetas en vez de ids). */
const FIELD_BY_COLUMN: Record<string, TaskFieldKey> = {
  title: "title",
  description: "description",
  client_id: "client",
  client_data_id: "data_client",
  due_at: "due_at",
  amount: "amount",
  process_id: "process",
  country_id: "country",
  intake_type_id: "intake_type",
  error_type_id: "error_type",
  tier_id: "tier",
  category_id: "category",
  priority: "priority",
  assigned_to_user_id: "assignee"
};

function logValue(config: ITaskConfig, log: ITicketLog, value: string | null) {
  if (value === null) return "—";
  if (log.field_changed === "status")
    return statusMeta(config, value as TicketStatus)?.label ?? value;
  const key = log.field_changed ? FIELD_BY_COLUMN[log.field_changed] : undefined;
  return key ? optionLabel(config, key, value) : value;
}

function fieldLabel(config: ITaskConfig, column: string) {
  const key = FIELD_BY_COLUMN[column];
  return (config.fields.find((f) => f.key === key)?.label ?? column).toLowerCase();
}

function History({ ticketId, config }: { ticketId: number; config: ITaskConfig }) {
  const { history, isLoading } = useTaskHistory(ticketId);
  if (isLoading && !history.length) return null;
  if (!history.length) return null;

  return (
    <div className="mt-5 border-t border-cp-line pt-3.5">
      <Label>Historial</Label>
      <ol className="m-0 flex max-h-[180px] list-none flex-col gap-1.5 overflow-y-auto p-0">
        {history.map((log) => {
          const changed =
            log.event !== "CREATED" && (log.old_value !== null || log.new_value !== null);
          return (
            <li key={log.id} className="text-[13px] text-cp-ink-2">
              <b className="font-semibold text-cp-ink">{log.performed_by_name ?? "—"}</b>{" "}
              {EVENT_LABEL[log.event] ?? log.event}
              {log.event === "FIELD_CHANGED" && log.field_changed
                ? ` ${fieldLabel(config, log.field_changed)}`
                : ""}
              {changed && (
                <span className="text-cp-ink-3">
                  {" "}
                  {logValue(config, log, log.old_value)} → {logValue(config, log, log.new_value)}
                </span>
              )}
              <span className="text-cp-ink-4"> · {formatTaskDate(log.created_at)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
