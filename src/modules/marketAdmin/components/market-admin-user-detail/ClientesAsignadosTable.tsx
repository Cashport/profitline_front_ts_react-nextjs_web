"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Minus } from "lucide-react";
import { IMarketAdminUserClient } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  clientes: IMarketAdminUserClient[];
  onQuitar: (nit: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ClientesAsignadosTable({ clientes, onQuitar, isLoading, disabled }: Props) {
  const columns: ColumnsType<IMarketAdminUserClient> = [
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "NIT",
      dataIndex: "nit",
      key: "nit",
      width: 160,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "",
      key: "quitar",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, c) => (
        <button
          title="Quitar cliente"
          disabled={disabled}
          onClick={() => onQuitar(c.nit)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCCCCC] hover:bg-[#FEE2E2] hover:text-[#E53E3E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#CCCCCC]"
        >
          <Minus size={13} />
        </button>
      )
    }
  ];

  return (
    <div>
      <p className="text-sm font-bold text-[#141414] mb-4">Clientes asignados</p>
      <Table
        columns={columns}
        dataSource={clientes}
        rowKey="nit"
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: "Sin clientes asignados." }}
      />
    </div>
  );
}
