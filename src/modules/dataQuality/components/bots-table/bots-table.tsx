"use client";

import { useMemo } from "react";
import { Table } from "antd";

import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";

import { getBotsColumns } from "./columns";

interface BotsTableProps {
  bots: IBotStatusItem[];
  totalBots: number;
  loading?: boolean;
}

// La API no trae id: la fila se identifica por cliente, bot, país y tipo de archivo.
const getBotRowKey = (bot: IBotStatusItem) =>
  `${bot.cliente}-${bot.bot}-${bot.pais}-${bot.tipo_archivo}`;

export function BotsTable({ bots, totalBots, loading }: BotsTableProps) {
  const columns = useMemo(() => getBotsColumns(), []);

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
      />

      <div className="my-4 text-sm text-gray-500">
        Mostrando {bots.length} de {totalBots} bots
      </div>
    </>
  );
}
