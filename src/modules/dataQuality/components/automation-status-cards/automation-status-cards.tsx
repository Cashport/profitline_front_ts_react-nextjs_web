"use client";

import { cn } from "@/utils/utils";

import { BOT_STATUS_META } from "../../constants";
import { BotStatusFilter, IBotsSummary } from "../../types/automations";

// Orden pedido por producto: Operativo, Con fallas, En revisión, Ejecutando.
// PENDIENTE/SIN_EJECUCIONES no tienen card propia (solo cuentan en el Total).
const STATUS_KEYS: Array<"EXITOSO" | "FALLIDO" | "EN_REVISION" | "EN_EJECUCION"> = [
  "EXITOSO",
  "FALLIDO",
  "EN_REVISION",
  "EN_EJECUCION"
];

interface AutomationStatusCardsProps {
  summary: IBotsSummary;
  statusFilter: BotStatusFilter;
  onStatusClick: (status: BotStatusFilter) => void;
}

// Versión compacta: sin el chip de ícono, solo etiqueta + número (el color del
// número ya comunica el estado, p. ej. "Con fallas" en rojo cuando hay > 0).
export function AutomationStatusCards({
  summary,
  statusFilter,
  onStatusClick
}: AutomationStatusCardsProps) {
  const isTotalActive = statusFilter === "all";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      <button
        type="button"
        onClick={() => onStatusClick("all")}
        className={cn(
          "flex h-full w-full flex-col gap-1 rounded-lg p-3 text-left transition-colors",
          isTotalActive
            ? "bg-cashport-black text-white"
            : "bg-cashport-gray-lighter text-cashport-black hover:bg-[#EFEFEF]"
        )}
      >
        <span className="block truncate text-sm font-light">Total de bots</span>
        <span className="block truncate text-2xl font-medium">{summary.total}</span>
      </button>

      {STATUS_KEYS.map((key) => {
        const meta = BOT_STATUS_META[key];
        const isActive = statusFilter === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onStatusClick(isActive ? "all" : key)}
            className={cn(
              "flex h-full w-full flex-col gap-1 rounded-lg p-3 text-left transition-colors",
              isActive
                ? "bg-cashport-black text-white"
                : "bg-cashport-gray-lighter text-cashport-black hover:bg-[#EFEFEF]"
            )}
          >
            <span className="block truncate text-sm font-light">{meta.label}</span>
            <span
              className={cn(
                "block truncate text-2xl font-medium",
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
