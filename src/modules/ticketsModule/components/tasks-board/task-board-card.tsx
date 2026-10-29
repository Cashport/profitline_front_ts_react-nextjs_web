"use client";

import BoardCard, { type BoardCardSeverity } from "@/components/ui/board-lanes/board-card";
import type { ITaskConfig, ITicket } from "@/types/tickets/ITickets";
import { isAgeAlert } from "../../utils/task-format";
import { AgeLabel, AssigneeAvatar, PriorityLabel } from "../task-cells/task-cells";

interface TaskBoardCardProps {
  ticket: ITicket;
  config: ITaskConfig;
  onOpen: (id: number) => void;
}

const severityOf = (config: ITaskConfig, t: ITicket): BoardCardSeverity =>
  t.priority === "URGENT" ? "crit" : isAgeAlert(config, t) ? "warn" : "idle";

/** Tarjeta de una tarea en una columna (estado) del tablero. */
export default function TaskBoardCard({ ticket: t, config, onOpen }: TaskBoardCardProps) {
  const client = t.client_data_name ?? t.client_name;
  const context = [client, t.process_name].filter(Boolean).join(" · ");

  return (
    <BoardCard sev={severityOf(config, t)} onClick={() => onOpen(t.id)}>
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <span className="font-mono">{t.ticket_code}</span>
        {t.incident_id && <span>· Novedad #{t.incident_id}</span>}
        {t.country_code && <span className="ml-auto font-semibold">{t.country_code}</span>}
      </div>

      <div className="mb-[5px] mt-1 text-[13px] font-semibold leading-[1.3] text-foreground">
        {t.title}
      </div>

      {context && (
        <div className="mb-1.5 truncate text-[13px] text-muted-foreground">{context}</div>
      )}

      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <PriorityLabel config={config} ticket={t} />
        <span className="ml-auto flex items-center gap-2">
          <AgeLabel config={config} ticket={t} />
          <AssigneeAvatar name={t.assigned_to_name} />
        </span>
      </div>
    </BoardCard>
  );
}
