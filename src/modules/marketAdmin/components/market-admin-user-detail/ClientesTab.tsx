"use client";

import { useMemo, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Minus, Plus } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import ModalAgregarClientes from "@/modules/marketAdmin/components/market-admin-user-detail/ModalAgregarClientes";
import { IMarketAdminUserClient } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  clientes: IMarketAdminUserClient[];
  onAgregar: (nit: string) => void;
  onQuitar: (nit: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function ClientesTab({ clientes, onAgregar, onQuitar, isLoading, disabled }: Props) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Los clientes asignados llegan completos en el detalle, así que el filtro es local.
  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.client_name.toLowerCase().includes(q) || c.nit.toLowerCase().includes(q)
    );
  }, [clientes, search]);

  const asignadosNits = useMemo(() => new Set(clientes.map((c) => c.nit)), [clientes]);

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
      <div className="flex items-center justify-between gap-4 mb-4">
        <UiSearchInput placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors flex-shrink-0"
        >
          <Plus size={14} /> Agregar clientes
        </button>
      </div>

      <Table
        columns={columns}
        dataSource={filtrados}
        rowKey="nit"
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: search.trim()
            ? "No se encontraron clientes con ese nombre o NIT."
            : "Este usuario aún no tiene clientes asignados."
        }}
      />

      {showModal && (
        <ModalAgregarClientes
          asignadosNits={asignadosNits}
          onAgregar={onAgregar}
          onClose={() => setShowModal(false)}
          disabled={disabled}
        />
      )}
    </div>
  );
}
