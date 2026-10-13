"use client";

import { Badge } from "@/modules/chat/ui/badge";
import { cn } from "@/utils/utils";

import { BOT_STATUS_META } from "../../constants";
import { BotStatus } from "../../types/automations";

export function BotStatusBadge({ status }: { status: BotStatus }) {
  const meta = BOT_STATUS_META[status];
  // Un estado que el front aún no conoce se muestra tal cual en vez de romper la tabla.
  if (!meta) {
    return (
      <Badge variant="secondary" className="text-xs">
        {status}
      </Badge>
    );
  }

  const Icon = meta.icon;

  return (
    <Badge
      variant="secondary"
      className="gap-1 text-xs"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon className={cn("h-3 w-3", status === "EN_EJECUCION" && "animate-spin")} />
      {meta.label}
    </Badge>
  );
}
