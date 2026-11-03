"use client";

import { Bot, Headset, Mail, MailCheck, Users } from "lucide-react";

import { fmtM } from "@/modules/walletModule/utils/format";
import { cn } from "@/utils/utils";
import type { ITaskConfig, ITaskFieldConfig, ITicket } from "@/types/tickets/ITickets";
import {
  formatAge,
  formatTaskDate,
  initialsOf,
  isAgeAlert,
  priorityMeta,
  statusMeta
} from "../../utils/task-format";

const INTAKE_ICONS: Record<string, typeof Bot> = {
  bot: Bot,
  "mail-auto": MailCheck,
  mail: Mail,
  "help-desk": Headset,
  team: Users
};

const Dash = () => <span className="text-cp-ink-4">—</span>;

/** Punto de color + texto (prioridad, tier, proceso). */
export function DotLabel({
  color,
  children,
  className
}: {
  color?: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: color ?? "rgb(var(--cp-ink-4))" }}
      />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Estado: cuadro de color + etiqueta, como en el prototipo. */
export function StatusLabel({ config, ticket }: { config?: ITaskConfig; ticket: ITicket }) {
  const meta = statusMeta(config, ticket.status);
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: meta?.color }} />
      <span className="truncate">{meta?.label ?? ticket.status}</span>
    </span>
  );
}

export function PriorityLabel({ config, ticket }: { config?: ITaskConfig; ticket: ITicket }) {
  const meta = priorityMeta(config, ticket.priority);
  return (
    <DotLabel color={meta?.color} className={cn(ticket.priority === "URGENT" && "font-semibold")}>
      <span style={ticket.priority === "URGENT" ? { color: meta?.color } : undefined}>
        {meta?.label ?? ticket.priority}
      </span>
    </DotLabel>
  );
}

/** Tipo de ingesta: ícono blanco sobre el color del catálogo + nombre. */
export function IntakeLabel({ ticket }: { ticket: ITicket }) {
  if (!ticket.intake_type_name) return <Dash />;
  const Icon = INTAKE_ICONS[ticket.intake_type_icon ?? ""] ?? Users;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-white"
        style={{ background: ticket.intake_type_color ?? "rgb(var(--cp-ink-3))" }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.2} />
      </span>
      <span className="truncate">{ticket.intake_type_name}</span>
    </span>
  );
}

export function AssigneeAvatar({ name }: { name: string | null }) {
  return (
    <span
      title={name ?? "Sin responsable"}
      className="inline-grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cp-line-2 bg-cp-muted text-[10px] font-semibold text-cp-ink-3"
    >
      {initialsOf(name)}
    </span>
  );
}

export function AgeLabel({ config, ticket }: { config?: ITaskConfig; ticket: ITicket }) {
  return (
    <span
      className={cn(
        "tabular-nums",
        isAgeAlert(config, ticket) ? "font-semibold text-cp-magenta" : "text-cp-ink-3"
      )}
    >
      {formatAge(ticket.open_minutes)}
    </span>
  );
}

/**
 * Celda de la lista. Se elige por la llave del campo; un campo nuevo que el
 * front no conozca cae en su tipo (texto).
 */
export function TaskCell({
  field,
  ticket: t,
  config
}: {
  field: ITaskFieldConfig;
  ticket: ITicket;
  config?: ITaskConfig;
}) {
  switch (field.key) {
    case "title":
      return (
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium text-cp-ink" title={t.title}>
            {t.title}
          </span>
          {t.incident_id && (
            <span className="shrink-0 rounded-[5px] bg-cp-muted px-1.5 text-[13px] text-cp-ink-3">
              Novedad #{t.incident_id}
            </span>
          )}
        </span>
      );
    case "client":
      return t.client_name || t.client_id ? (
        <span className="truncate text-cp-blue" title={t.client_name ?? t.client_id ?? ""}>
          {t.client_name ?? t.client_id}
        </span>
      ) : (
        <Dash />
      );
    case "data_client":
      return t.client_data_name ? (
        <span className="truncate text-cp-blue" title={t.client_data_name}>
          {t.client_data_name}
        </span>
      ) : (
        <Dash />
      );
    case "country":
      return t.country_code ? (
        <span className="text-[13px] font-semibold text-cp-ink-2" title={t.country_name ?? ""}>
          {t.country_code}
        </span>
      ) : (
        <Dash />
      );
    case "process":
      return t.process_name ? <span className="truncate">{t.process_name}</span> : <Dash />;
    case "error_type":
      return t.error_type_name ? <span className="truncate">{t.error_type_name}</span> : <Dash />;
    case "intake_type":
      return <IntakeLabel ticket={t} />;
    case "priority":
      return <PriorityLabel config={config} ticket={t} />;
    case "status":
      return <StatusLabel config={config} ticket={t} />;
    case "created_at":
      return <AgeLabel config={config} ticket={t} />;
    case "due_at":
      return <span className="tabular-nums text-cp-ink-3">{formatTaskDate(t.due_at)}</span>;
    case "assignee":
      return <AssigneeAvatar name={t.assigned_to_name} />;
    case "tier":
      return t.tier_name ? <DotLabel color={t.tier_color}>{t.tier_name}</DotLabel> : <Dash />;
    case "category":
      return t.category_name ? <span className="truncate">{t.category_name}</span> : <Dash />;
    case "amount":
      return t.amount === null ? <Dash /> : <span className="tabular-nums">{fmtM(t.amount)}</span>;
    case "description":
      return t.description ? (
        <span className="truncate text-cp-ink-3">{t.description}</span>
      ) : (
        <Dash />
      );
    default:
      return <Dash />;
  }
}
