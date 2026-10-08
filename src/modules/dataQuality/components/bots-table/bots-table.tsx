"use client";

import { useMemo } from "react";
import { Table } from "antd";

import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

import { getBotsColumns } from "./columns";

interface BotsTableProps {
  bots: IBotStatusItem[];
  totalBots: number;
  loading?: boolean;
  executingScheduleId: number | null;
  // eslint-disable-next-line no-unused-vars
  onRun: (bot: IBotStatusItem) => void;
  // eslint-disable-next-line no-unused-vars
  onViewHistory: (bot: IBotStatusItem) => void;
  // eslint-disable-next-line no-unused-vars
  onClientClick: (bot: IBotStatusItem) => void;
}

// La API no trae id: la fila se identifica por cliente, bot, país y tipo de archivo.
const getBotRowKey = (bot: IBotStatusItem) =>
  `${bot.cliente}-${bot.bot}-${bot.pais}-${bot.tipo_archivo}`;

export function BotsTable({
  bots,
  totalBots,
  loading,
  executingScheduleId,
  onRun,
  onViewHistory,
  onClientClick
}: BotsTableProps) {
  const columns = useMemo(
    () => getBotsColumns({ executingScheduleId, onRun, onViewHistory }),
    [executingScheduleId, onRun, onViewHistory]
  );

  return (
    <>
      <Table<IBotStatusItem>
        columns={columns}
        dataSource={bots}
        rowKey={getBotRowKey}
        loading={loading}
        pagination={false}
        showSorterTooltip={false}
        size="small"
        tableLayout="auto"
        scroll={{ x: 100 }}
        onRow={(record) => ({
          onClick: () => onClientClick(record),
          className: "cursor-pointer hover:bg-gray-50"
        })}
      />

      <div className="my-4 text-sm text-gray-500">
        Mostrando {bots.length} de {totalBots} bots
      </div>
    </>
  );
}
