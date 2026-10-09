"use client";

import { TableProps } from "antd";
import { Eye, Loader2, Play } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";
import { cn, formatLocalDateTimeParts } from "@/utils/utils";

import {
  BOT_FREQUENCY_LABELS,
  BOT_MUTED_TEXT_COLOR,
  BOT_STATUS_META,
  DARK_TOOLTIP_ARROW,
  DARK_TOOLTIP_CONTENT,
  getWorstBotStatus
} from "../../constants";
import { IBotClientGroupRow } from "../../types/automations";
import { BotStatusBadge } from "./bot-status-badge";

interface RunTimestampProps {
  isoDate: string | null;
  emptyLabel: string;
}

function RunTimestamp({ isoDate, emptyLabel }: RunTimestampProps) {
  if (!isoDate) return <div className="text-sm text-gray-500">{emptyLabel}</div>;

  const { date, time } = formatLocalDateTimeParts(isoDate);
  return (
    <div className="text-sm" style={{ color: "#141414" }}>
      {date}
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  );
}

interface RunErrorProps {
  error: string | null;
  readableError?: string | null;
  category?: string | null;
}

// En la celda va el mensaje legible, o el error crudo si no llegó.
// El error técnico completo se despliega al pasar el mouse.
function RunError({ error, readableError, category }: RunErrorProps) {
  const summary = readableError || error;
  if (!summary) return null;

  const summaryText = (
    <div className="mt-0.5 max-w-[140px] truncate text-xs text-[#DC2626]">{summary}</div>
  );
  if (!error) return summaryText;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{summaryText}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        align="start"
        className={cn(DARK_TOOLTIP_CONTENT, "max-w-[30rem] space-y-1 rounded-lg px-3 py-2.5")}
        arrowClassName={DARK_TOOLTIP_ARROW}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
          Detalle del error{category ? ` - ${category}` : ""}
        </p>
        <p className="overflow-y-auto whitespace-pre-wrap break-words text-xs">{error}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// "Con fallas" a secas si TODOS los bots del cliente fallaron (incluido el caso de
// un único bot); "N con fallas" solo cuando el grupo está mezclado (algunos ok,
// otros no), para no perder la señal de cuántos realmente fallaron.
function getGroupStatusLabel(bots: IBotStatusItem[]): { label: string; color: string } {
  const failedCount = bots.filter((bot) => bot.estado === "FALLIDO").length;
  if (failedCount > 0 && failedCount < bots.length) {
    return { label: `${failedCount} con fallas`, color: BOT_STATUS_META.FALLIDO.color };
  }
  const worst = getWorstBotStatus(bots);
  return { label: BOT_STATUS_META[worst].label, color: BOT_STATUS_META[worst].color };
}

interface GetGroupColumnsOptions {
  // eslint-disable-next-line no-unused-vars
  onClientClick: (bot: IBotStatusItem) => void;
}

// Columnas de la fila por cliente (colapsable): compactas, sin País/Tipo de
// archivo/Acciones -- esos solo tienen sentido por bot individual, no agregados.
export const getGroupColumns = ({
  onClientClick
}: GetGroupColumnsOptions): TableProps<IBotClientGroupRow>["columns"] => [
  {
    title: "Cliente",
    key: "cliente",
    render: (_, record) => (
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClientClick(record.bots[0]);
          }}
          className="text-left text-sm font-semibold hover:underline"
          style={{ color: "#141414" }}
        >
          {record.cliente}
        </button>
        <p className="text-xs" style={{ color: BOT_MUTED_TEXT_COLOR }}>
          {record.bots.length} bots
        </p>
      </div>
    )
  },
  {
    title: "Bots",
    key: "bots",
    render: (_, record) => (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {record.bots.map((bot) => (
          <span
            key={bot.schedule_id}
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "#141414" }}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: BOT_STATUS_META[bot.estado].color }}
            />
            {bot.tipo_archivo || bot.bot}
          </span>
        ))}
      </div>
    )
  },
  {
    title: "Estado",
    key: "estado",
    render: (_, record) => {
      const { label, color } = getGroupStatusLabel(record.bots);
      return (
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
      );
    }
  },
  {
    title: "Periodicidad",
    key: "periodicidad",
    render: (_, record) => (
      <span className="text-sm" style={{ color: "#141414" }}>
        {record.periodicidad.length > 0
          ? record.periodicidad.map((p) => BOT_FREQUENCY_LABELS[p] ?? p).join(", ")
          : "—"}
      </span>
    )
  },
  {
    title: "Próxima ejecución",
    key: "proxima_ejecucion",
    render: (_, record) => (
      <RunTimestamp isoDate={record.proxima_ejecucion} emptyLabel="Sin programar" />
    )
  }
];

interface GetBotColumnsOptions {
  executingScheduleId: number | null;
  // eslint-disable-next-line no-unused-vars
  onRun: (bot: IBotStatusItem) => void;
  // eslint-disable-next-line no-unused-vars
  onViewHistory: (bot: IBotStatusItem) => void;
}

// Columnas de cada bot individual dentro del cliente expandido.
export const getBotColumns = ({
  executingScheduleId,
  onRun,
  onViewHistory
}: GetBotColumnsOptions): TableProps<IBotStatusItem>["columns"] => [
  {
    title: "Bot",
    dataIndex: "tipo_archivo",
    render: (text: string | null, record: IBotStatusItem) => (
      <span className="text-sm font-medium" style={{ color: "#141414" }}>
        {text || record.bot}
      </span>
    )
  },
  {
    title: "País",
    dataIndex: "pais",
    render: (text: string | null) => (
      <Badge variant="outline" className="text-xs">
        {text || "No disponible"}
      </Badge>
    )
  },
  {
    title: "Estado",
    dataIndex: "estado",
    render: (estado: IBotStatusItem["estado"]) => <BotStatusBadge status={estado} />
  },
  {
    title: "Última ejecución",
    dataIndex: "ultima_ejecucion",
    render: (_, record: IBotStatusItem) => (
      <>
        <RunTimestamp isoDate={record.ultima_ejecucion} emptyLabel="Sin registro" />
        {record.estado === "FALLIDO" && (
          <RunError
            error={record.error}
            readableError={record.error_legible}
            category={record.categoria_error}
          />
        )}
      </>
    )
  },
  {
    title: "Periodicidad",
    dataIndex: "periodicidad",
    render: (periodicidad: IBotStatusItem["periodicidad"]) => (
      <span className="text-sm" style={{ color: "#141414" }}>
        {periodicidad.length > 0
          ? periodicidad.map((p) => BOT_FREQUENCY_LABELS[p] ?? p).join(", ")
          : "—"}
      </span>
    )
  },
  {
    title: "Acciones",
    width: 90,
    render: (_, record: IBotStatusItem) => {
      const isRunning = record.estado === "EN_EJECUCION" || executingScheduleId === record.schedule_id;

      return (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            title="Ejecutar bot a demanda"
            disabled={isRunning}
            onClick={() => onRun(record)}
            className="transition-colors hover:bg-[#F0FDF4] hover:text-[#16A34A]"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Ver detalle e historial de ejecuciones"
            onClick={() => onViewHistory(record)}
            className="transition-colors hover:bg-[#e2ecfe] hover:text-[#2143b0]"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];

