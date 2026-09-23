"use client";

import { TableProps } from "antd";
import { Clock, Eye, Loader2, Package, Play } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";

import { BOT_FILE_TYPE_META } from "../../constants";
import { IBotHealth } from "../../types/automations";
import { BotStatusBadge } from "./bot-status-badge";

interface GetBotsColumnsParams {
  onViewHistory: (bot: IBotHealth) => void;
  onRunNow: (bot: IBotHealth) => void;
}

export const getBotsColumns = ({
  onViewHistory,
  onRunNow
}: GetBotsColumnsParams): TableProps<IBotHealth>["columns"] => [
  {
    title: "Bot",
    dataIndex: "name",
    render: (text: string) => (
      <span className="font-medium" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: "Cliente",
    dataIndex: "client",
    render: (text: string) => (
      <span className="text-sm" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: "País",
    dataIndex: "country",
    render: (text: string) => (
      <Badge variant="outline" className="text-xs">
        {text}
      </Badge>
    )
  },
  {
    title: "Tipo de archivo",
    dataIndex: "fileType",
    render: (fileType: IBotHealth["fileType"]) => (
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "#141414" }}>
        <Package className="h-3.5 w-3.5 text-gray-400" />
        {BOT_FILE_TYPE_META[fileType].label}
      </div>
    )
  },
  {
    title: "Estado",
    dataIndex: "status",
    render: (status: IBotHealth["status"]) => <BotStatusBadge status={status} />
  },
  {
    title: "Última ejecución",
    dataIndex: "lastRun",
    render: (_, record: IBotHealth) => (
      <>
        <div className="text-sm" style={{ color: "#141414" }}>
          {record.lastRun.date}
          <div className="text-xs text-gray-500">{record.lastRun.time}</div>
        </div>
        {record.status === "error" && record.errorMessage && (
          <div className="mt-0.5 max-w-48 truncate text-xs text-[#DC2626]">
            {record.errorMessage}
          </div>
        )}
      </>
    )
  },
  {
    title: "Periodicidad",
    dataIndex: "frequency",
    render: (text: string) => (
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "#141414" }}>
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        {text}
      </div>
    )
  },
  {
    title: "Próxima ejecución",
    dataIndex: "nextRun",
    render: (nextRun: IBotHealth["nextRun"]) => (
      <div className="text-sm" style={{ color: "#141414" }}>
        {nextRun.date}
        <div className="text-xs text-gray-500">{nextRun.time}</div>
      </div>
    )
  },
  {
    title: "Acciones",
    width: 100,
    render: (_, record: IBotHealth) => {
      const isRunning = record.status === "running";
      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="Ejecutar bot a demanda"
            disabled={isRunning}
            onClick={() => onRunNow(record)}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Ver historial de ejecuciones"
            onClick={() => onViewHistory(record)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];
