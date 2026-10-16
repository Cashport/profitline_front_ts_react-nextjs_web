"use client";

import { useMemo } from "react";
import { Table } from "antd";

import { IBotStatusItem } from "@/types/dataQuality/IDataQuality";
import { IBotClientGroupRow } from "../../types/automations";

import { getBotColumns, getGroupColumns } from "./columns";

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

// La próxima ejecución más próxima entre los bots del cliente es la más
// accionable/urgente, así que es la que se muestra mientras el grupo está colapsado.
const getEarliestNextRun = (bots: IBotStatusItem[]): string | null => {
  const dates = bots
    .map((bot) => bot.proxima_ejecucion)
    .filter((date): date is string => Boolean(date));
  if (dates.length === 0) return null;
  return dates.reduce((earliest, current) => (current < earliest ? current : earliest));
};

export function BotsTable({
  bots,
  totalBots,
  loading,
  executingScheduleId,
  onRun,
  onViewHistory,
  onClientClick
}: BotsTableProps) {
  const groupColumns = useMemo(() => getGroupColumns({ onClientClick }), [onClientClick]);
  const botColumns = useMemo(
    () => getBotColumns({ executingScheduleId, onRun, onViewHistory }),
    [executingScheduleId, onRun, onViewHistory]
  );

  // Agrupa por cliente (id_client_data) para que la tabla muestre una fila
  // expandible por cliente en vez de una fila plana por cada bot (stock, ventas, etc.).
  // La fila colapsada conserva periodicidad/próxima ejecución agregadas (no en blanco).
  const groupedRows = useMemo<IBotClientGroupRow[]>(() => {
    const groups = new Map<number, IBotClientGroupRow>();
    bots.forEach((bot) => {
      const existing = groups.get(bot.id_client_data);
      if (existing) {
        existing.bots.push(bot);
        if (existing.pais !== bot.pais) existing.pais = null;
      } else {
        groups.set(bot.id_client_data, {
          key: `group-${bot.id_client_data}`,
          isGroup: true,
          id_client_data: bot.id_client_data,
          cliente: bot.cliente,
          pais: bot.pais,
          periodicidad: [],
          proxima_ejecucion: null,
          bots: [bot]
        });
      }
    });
    groups.forEach((group) => {
      const uniquePeriodicidad = Array.from(new Set(group.bots.flatMap((bot) => bot.periodicidad)));
      group.periodicidad = uniquePeriodicidad;
      group.proxima_ejecucion = getEarliestNextRun(group.bots);
    });
    return Array.from(groups.values());
  }, [bots]);

  return (
    <>
      <Table<IBotClientGroupRow>
        columns={groupColumns}
        dataSource={groupedRows}
        rowKey={(record) => record.key}
        loading={loading}
        pagination={false}
        showSorterTooltip={false}
        size="small"
        tableLayout="auto"
        expandable={{
          expandRowByClick: true,
          indentSize: 0,
          expandedRowRender: (record) => (
            <Table<IBotStatusItem>
              columns={botColumns}
              dataSource={record.bots}
              rowKey={getBotRowKey}
              pagination={false}
              showSorterTooltip={false}
              size="small"
              tableLayout="auto"
              onRow={(bot) => ({
                onClick: () => onClientClick(bot),
                className: "cursor-pointer hover:bg-gray-50"
              })}
            />
          )
        }}
      />

      <div className="my-4 text-sm text-gray-500">
        Mostrando {bots.length} de {totalBots} bots
      </div>
    </>
  );
}
