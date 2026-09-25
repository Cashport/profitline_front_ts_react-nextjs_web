"use client";

import { TableProps } from "antd";
import { Clock, Eye, Loader2, Package, Play } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";
import { formatLocalDateTimeParts } from "@/utils/utils";

import { BOT_FREQUENCY_LABELS } from "../../constants";
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

export const getBotsColumns = (): TableProps<IBotStatusItem>["columns"] => [
  {
    title: "Bot",
    dataIndex: "bot",
    render: (text: string) => (
      <span className="font-medium" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: "Cliente",
    dataIndex: "cliente",
    render: (text: string) => (
      <span className="text-sm" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: "País",
    dataIndex: "pais",
    render: (text: string) => (
      <Badge variant="outline" className="text-xs">
        {text}
      </Badge>
    )
  },
  {
    title: "Tipo de archivo",
    dataIndex: "tipo_archivo",
    render: (text: string) => (
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "#141414" }}>
        <Package className="h-3.5 w-3.5 text-gray-400" />
        {text}
      </div>
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
        {record.estado === "FALLIDO" && record.error && (
          <div className="mt-0.5 max-w-48 truncate text-xs text-[#DC2626]">{record.error}</div>
        )}
      </>
    )
  },
  {
    title: "Periodicidad",
    dataIndex: "periodicidad",
    render: (periodicidad: IBotStatusItem["periodicidad"]) => (
      <div className="flex items-center gap-1.5 text-sm" style={{ color: "#141414" }}>
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        {periodicidad
          .map((periodicity) => BOT_FREQUENCY_LABELS[periodicity] ?? periodicity)
          .join(", ")}
      </div>
    )
  },
  {
    title: "Próxima ejecución",
    dataIndex: "proxima_ejecucion",
    render: (proximaEjecucion: IBotStatusItem["proxima_ejecucion"]) => (
      <RunTimestamp isoDate={proximaEjecucion} emptyLabel="Sin programar" />
    )
  },
  {
    title: "Acciones",
    width: 100,
    render: (_, record: IBotStatusItem) => {
      const isRunning = record.estado === "EN_EJECUCION";
      return (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" title="Ejecutar bot a demanda" disabled>
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm" title="Ver historial de ejecuciones" disabled>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    }
  }
];
