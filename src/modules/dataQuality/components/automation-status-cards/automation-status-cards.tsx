"use client";

import { Bot } from "lucide-react";

import { cn } from "@/utils/utils";

import { BOT_STATUS_META } from "../../constants";
import { BotStatus, BotStatusFilter, IBotsSummary } from "../../types/automations";

const STATUS_KEYS: BotStatus[] = ["EXITOSO", "FALLIDO", "EN_EJECUCION"];

interface AutomationStatusCardsProps {
  summary: IBotsSummary;
  statusFilter: BotStatusFilter;
  onStatusClick: (status: BotStatusFilter) => void;
}

// Mismo look que AlertCategoryCards: tarjeta-botón que al activarse se voltea a negro.
// Acá el cuadro del icono se colorea según el estado en vez de ir siempre en verde.
export function AutomationStatusCards({
  summary,
  statusFilter,
  onStatusClick
}: AutomationStatusCardsProps) {
  const isTotalActive = statusFilter === "all";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button
        type="button"
        onClick={() => onStatusClick("all")}
        className={cn(
          "flex h-full w-full flex-col justify-between gap-2 rounded-lg p-3 text-left transition-colors xl:p-4",
          isTotalActive
            ? "bg-cashport-black text-white"
            : "bg-cashport-gray-lighter text-cashport-black hover:bg-[#EFEFEF]"
        )}
      >
        <span className="flex w-full items-center justify-between gap-2">
          <span className="block truncate text-[0.938rem] font-light leading-6 xl:text-base">
            Total de bots
          </span>
          <span
            className={cn(
              "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md xl:h-6 xl:w-6",
              isTotalActive ? "bg-white/15 text-white" : "bg-cashport-green text-cashport-black"
            )}
          >
            <Bot className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
        </span>
        <span className="block truncate text-[1.3rem] font-medium xl:text-[1.625rem]">
          {summary.total}
        </span>
      </button>

      {STATUS_KEYS.map((key) => {
        const meta = BOT_STATUS_META[key];
        const Icon = meta.icon;
        const isActive = statusFilter === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusClick(isActive ? "all" : key)}
            className={cn(
              "flex h-full w-full flex-col justify-between gap-2 rounded-lg p-3 text-left transition-colors xl:p-4",
              isActive
                ? "bg-cashport-black text-white"
                : "bg-cashport-gray-lighter text-cashport-black hover:bg-[#EFEFEF]"
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="block truncate text-[0.938rem] font-light leading-6 xl:text-base">
                {meta.label}
              </span>
              <span
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md xl:h-6 xl:w-6"
                style={{
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : meta.bg,
                  color: isActive ? "#FFFFFF" : meta.color
                }}
              >
                <Icon
                  className={cn("h-3.5 w-3.5", key === "EN_EJECUCION" && "animate-spin")}
                  strokeWidth={2.5}
                />
              </span>
            </span>
            <span
              className={cn(
                "block truncate text-[1.3rem] font-medium xl:text-[1.625rem]",
                key === "FALLIDO" && !isActive && summary.FALLIDO > 0 && "text-[#DC2626]"
              )}
            >
              {summary[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
