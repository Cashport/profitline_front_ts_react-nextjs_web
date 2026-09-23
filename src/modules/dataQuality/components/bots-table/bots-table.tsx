"use client";

import { useMemo } from "react";
import { Table } from "antd";

import { IBotHealth } from "../../types/automations";
import { getBotsColumns } from "./columns";

interface BotsTableProps {
  bots: IBotHealth[];
  totalBots: number;
  onViewHistory: (bot: IBotHealth) => void;
  onRunNow: (bot: IBotHealth) => void;
}

export function BotsTable({ bots, totalBots, onViewHistory, onRunNow }: BotsTableProps) {
  const columns = useMemo(
    () => getBotsColumns({ onViewHistory, onRunNow }),
    [onViewHistory, onRunNow]
  );

  return (
    <>
      <Table<IBotHealth>
        columns={columns}
        dataSource={bots}
        rowKey="id"
        pagination={false}
        showSorterTooltip={false}
        size="small"
        tableLayout="auto"
        scroll={{ x: 100 }}
      />

      <div className="mt-4 text-sm text-gray-500">
        Mostrando {bots.length} de {totalBots} bots
      </div>
    </>
  );
}
