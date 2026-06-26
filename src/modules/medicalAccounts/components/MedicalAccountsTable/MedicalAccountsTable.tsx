"use client";

import { Button, Flex, Table, TableProps } from "antd";
import { Eye } from "@phosphor-icons/react";

import useScreenWidth from "@/components/hooks/useScreenWidth";
import { IMedicalAccountListItem } from "../../types/IMedicalAccount";
import { MedicalAccountStatusTag } from "../MedicalAccountStatusTag/MedicalAccountStatusTag";

interface MedicalAccountsTableProps {
  data: IMedicalAccountListItem[];
  loading?: boolean;
  onOpenDetail?: (record: IMedicalAccountListItem) => void;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function MedicalAccountsTable({
  data,
  loading,
  onOpenDetail,
  currentPage,
  pageSize,
  total,
  onPageChange
}: MedicalAccountsTableProps) {
  const width = useScreenWidth();
  const colWidth = (px: number) => (width > 1400 ? px : undefined);

  const columns: TableProps<IMedicalAccountListItem>["columns"] = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: colWidth(110),
      render: (value: number) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "No. Autorización",
      dataIndex: "authorization_id",
      key: "authorization_id",
      width: colWidth(160),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Paciente",
      key: "paciente",
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <div className="flex flex-col">
          <span className="text-sm text-cashport-black">{record.patient_name ?? "-"}</span>
          <span className="text-xs text-gray-500">{record.document_number ?? "-"}</span>
        </div>
      )
    },
    {
      title: "Fecha Cargue",
      dataIndex: "created_at",
      key: "created_at",
      width: colWidth(130),
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Fecha Servicio",
      dataIndex: "service_date",
      key: "service_date",
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
      dataIndex: "service_type",
      key: "service_type",
      width: colWidth(120),
      render: (value: string | null) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Estado",
      dataIndex: "status_name",
      key: "status_name",
      width: colWidth(140),
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <MedicalAccountStatusTag status={record.status_name} />
      )
    },
    {
      title: "",
      key: "acciones",
      width: 72,
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <Flex gap={4} align="center">
          <Button type="text" onClick={() => onOpenDetail?.(record)} icon={<Eye size={"1.3rem"} />} />
        </Flex>
      )
    }
  ];

  return (
    <Table<IMedicalAccountListItem>
      columns={columns}
      dataSource={data.map((row) => ({ ...row, key: row.id }))}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: false,
        position: ["bottomRight"],
        onChange: onPageChange
      }}
      size="small"
    />
  );
}
