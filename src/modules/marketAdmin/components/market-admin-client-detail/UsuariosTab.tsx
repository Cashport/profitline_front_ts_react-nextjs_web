"use client";

import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { IMarketAdminClientUser } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  usuarios: IMarketAdminClientUser[];
  isLoading?: boolean;
};

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function UsuariosTab({ usuarios, isLoading }: Props) {
  const columns: ColumnsType<IMarketAdminClientUser> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
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
      dataIndex: "role_name",
      key: "role_name",
      width: 140,
      onHeaderCell: headerCell,
      render: (rol: string) => (
        <span className="text-xs bg-[#F5F5F5] text-[#666666] px-2 py-0.5 rounded font-medium w-fit">
          {rol || "—"}
        </span>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={usuarios}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      locale={{ emptyText: "No hay usuarios asociados." }}
    />
  );
}
