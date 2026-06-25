"use client";

import { Button, Flex, Table, TableProps } from "antd";
import { Eye } from "@phosphor-icons/react";

import useScreenWidth from "@/components/hooks/useScreenWidth";
import { IMedicalAccount } from "../../types/IMedicalAccount";
import { MedicalAccountStatusTag } from "../MedicalAccountStatusTag/MedicalAccountStatusTag";

interface MedicalAccountsTableProps {
  data: IMedicalAccount[];
  loading?: boolean;
  onOpenDetail?: (record: IMedicalAccount) => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function MedicalAccountsTable({ data, loading, onOpenDetail }: MedicalAccountsTableProps) {
  const width = useScreenWidth();
  const colWidth = (px: number) => (width > 1400 ? px : undefined);

  const columns: TableProps<IMedicalAccount>["columns"] = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: colWidth(110),
      render: (value: string) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "No. Autorización",
      dataIndex: "idAutorizacion",
      key: "idAutorizacion",
      width: colWidth(160),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Paciente",
      key: "paciente",
      render: (_: unknown, record: IMedicalAccount) => (
        <div className="flex flex-col">
          <span className="text-sm text-cashport-black">{record.nombrePaciente ?? "-"}</span>
          <span className="text-xs text-gray-500">{record.documentoPaciente ?? "-"}</span>
        </div>
      )
    },
    {
      title: "Fecha Cargue",
      dataIndex: "fechaCarga",
      key: "fechaCarga",
      width: colWidth(130),
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Fecha Servicio",
      dataIndex: "fechaServicio",
      key: "fechaServicio",
      width: colWidth(130),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Régimen",
      dataIndex: "regimen",
      key: "regimen",
      width: colWidth(130),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Tipo Servicio",
      dataIndex: "tipoServicio",
      key: "tipoServicio",
      width: colWidth(120),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: colWidth(140),
      render: (_: unknown, record: IMedicalAccount) => (
        <MedicalAccountStatusTag status={record.estado} />
      )
    },
    {
      title: "",
      key: "acciones",
      width: 72,
      render: (_: unknown, record: IMedicalAccount) => (
        <Flex gap={4} align="center">
          <Button type="text" onClick={() => onOpenDetail?.(record)} icon={<Eye size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  return (
    <Table<IMedicalAccount>
      columns={columns}
      dataSource={data.map((row) => ({ ...row, key: row.id }))}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomRight"] }}
      size="small"
    />
  );
}
