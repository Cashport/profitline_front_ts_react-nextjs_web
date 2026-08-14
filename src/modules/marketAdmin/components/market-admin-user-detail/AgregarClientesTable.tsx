"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import { IMarketAdminClient } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  clientes: IMarketAdminClient[];
  onAgregar: (nit: string) => void;
  onSearchChange: (value: string) => void;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function AgregarClientesTable({
  clientes,
  onAgregar,
  onSearchChange,
  page,
  total,
  pageSize,
  onPageChange,
  isLoading,
  disabled
}: Props) {
  const columns: ColumnsType<IMarketAdminClient> = [
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "client_name",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "NIT",
      dataIndex: "client_id",
      key: "client_id",
      width: 160,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Ciudad",
      dataIndex: "city",
      key: "city",
      width: 160,
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v || "—"}</span>
    },
    {
      title: "",
      key: "agregar",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, c) => (
        <button
          title="Agregar cliente"
          disabled={disabled}
          onClick={() => onAgregar(c.client_id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#CCCCCC] hover:bg-[#E6F9E6] hover:text-[#1A7A1A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#CCCCCC]"
        >
          <Plus size={13} />
        </button>
      )
    }
  ];

  return (
    <div>
      <p className="text-sm font-bold text-[#141414] mb-4">Agregar clientes</p>
      <div className="mb-4">
        <UiSearchInput
          placeholder="Buscar cliente..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Table
        columns={columns}
        dataSource={clientes}
        rowKey="client_id"
        loading={isLoading}
        locale={{ emptyText: "No se encontraron clientes." }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          position: ["bottomRight"],
          showTotal: (t, range) => `Mostrando ${range[0]}–${range[1]} de ${t} clientes`
        }}
        onChange={(pag, _filters, _sorter, extra) => {
          if (extra.action === "paginate") onPageChange(pag.current ?? 1);
        }}
      />
    </div>
  );
}
