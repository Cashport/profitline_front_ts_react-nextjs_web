"use client";

import { Flag } from "lucide-react";

import { cn } from "@/utils/utils";
import type { TicketPriority } from "@/types/tickets/ITickets";
import { TICKET_PRIORITY_COLOR, TICKET_PRIORITY_LABEL } from "../../constants";

interface PriorityFlagProps {
  priority: TicketPriority;
  /** Sólo el ícono, con el label en `title` (para la tarjeta del tablero). */
  mini?: boolean;
  className?: string;
}

/** Bandera de color según la prioridad del ticket. */
export default function PriorityFlag({ priority, mini, className }: PriorityFlagProps) {
  const color = TICKET_PRIORITY_COLOR[priority];
  const label = TICKET_PRIORITY_LABEL[priority];

  if (mini) {
    return (
      <span title={label} className={cn("inline-flex", color, className)}>
        <Flag className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-1 whitespace-nowrap font-semibold", color, className)}
    >
      <Flag className="h-3 w-3 shrink-0" fill="currentColor" strokeWidth={0} />
      {label}
    </span>
  );
}
