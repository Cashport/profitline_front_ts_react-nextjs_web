"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Plus, X } from "lucide-react";
import { type UsuarioCliente } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  usuarios: UsuarioCliente[];
  onRemove: (id: string) => void;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function UsuariosTab({ usuarios, onRemove }: Props) {
  const columns: ColumnsType<UsuarioCliente> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      onHeaderCell: headerCell,
      render: (v: string) => <span className="text-sm text-[#141414]">{v}</span>
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      width: 140,
      onHeaderCell: headerCell,
      render: (rol: string) => (
        <span className="text-xs bg-[#F5F5F5] text-[#666666] px-2 py-0.5 rounded font-medium w-fit">
          {rol}
        </span>
      )
    },
    {
      title: "",
      key: "remove",
      width: 48,
      onHeaderCell: headerCell,
      render: (_, u) => (
        <button
          onClick={() => onRemove(u.id)}
          className="text-[#CCCCCC] hover:text-[#E53E3E] transition-colors flex items-center justify-center"
        >
          <X size={14} />
        </button>
      )
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={usuarios}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "No hay usuarios asociados." }}
      />
      <div className="border-t border-[#EEEEEE] mt-2 pt-3 px-4">
        <button className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors">
          <Plus size={14} /> Agregar usuario
        </button>
      </div>
    </>
  );
}
