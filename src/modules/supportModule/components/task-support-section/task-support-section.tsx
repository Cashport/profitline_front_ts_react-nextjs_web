"use client";

import Link from "next/link";
import useSWR from "swr";
import { LifeBuoy } from "lucide-react";

import { getSupportTicketByTask } from "@/services/support/support";
import type { ISupportDetail } from "@/types/support/ISupport";
import { formatDuration, slaBadge } from "../../utils/support-format";
import SupportConversation from "../support-conversation/support-conversation";
import { CriticalityTag, StatusDot } from "../support-tags/support-tags";

/**
 * Dentro del detalle de una tarea: si nació de un ticket de soporte, muestra el ticket y su
 * conversación (la misma que ve el usuario), para responder desde la tarea.
 */
export default function TaskSupportSection({
  taskId,
  version
}: {
  taskId: number;
  version?: string;
}) {
  const { data, mutate } = useSWR<ISupportDetail | null>(
    ["support-by-task", taskId, version],
    () => getSupportTicketByTask(taskId),
    { shouldRetryOnError: false, revalidateOnFocus: false }
  );
  if (!data) return null;
  const t = data.ticket;
  const sla = slaBadge(t);

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-cp-line pt-3.5">
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <LifeBuoy className="h-4 w-4" />
        <span className="font-semibold">Ticket de soporte</span>
        <Link href={`/support?tab=assigned&ticket=${t.id}`} className="font-mono">
          {t.code}
        </Link>
        <StatusDot value={t.status} asAgent />
        <CriticalityTag value={t.criticality} />
        <span className="text-cp-ink-3">
          · {t.subcategory_name} · Solicitó {t.created_by.name ?? "—"} · ANS{" "}
          {formatDuration(t.sla.resolution_min)}: <b style={{ color: sla.color }}>{sla.text}</b>
        </span>
      </div>
      <SupportConversation
        detail={data}
        onChange={(next) => mutate(next, false)}
        maxHeight="min(320px, 35 * var(--vh))"
      />
    </div>
  );
}
