"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Pagination, Table, TableProps, Tooltip } from "antd";
import dayjs from "dayjs";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { IAlert } from "@/types/dataQuality/IDataQuality";
import useScreenHeight from "@/components/hooks/useScreenHeight";

interface AlertsTableProps {
  alerts: IAlert[];
  isLoading: boolean;
  pagination: {
    current: number;
    total: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

const columns: TableProps<IAlert>["columns"] = [
  {
    title: "Cliente",
    dataIndex: "client_name",
    render: (text: string) => (
      <span className="font-medium" style={{ color: "#141414" }}>
        {text}
      </span>
    )
  },
  {
    title: "País",
    dataIndex: "country_name",
    render: (text: string) => (
      <Badge variant="outline" className="text-xs">
        {text}
      </Badge>
    )
  },
  {
    title: "Novedad",
    dataIndex: "error_message",
    ellipsis: true,
    onCell: () => ({
      style: { maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
    }),
    render: (text: string) => (
      <Tooltip title={text} placement="topLeft">
        <span style={{ color: "#141414" }}>{text}</span>
      </Tooltip>
    )
  },
  {
    title: "Tipo",
    dataIndex: "error_type"
  },
  {
    title: "Fecha novedad",
    dataIndex: "created_at",
    width: 140,
    render: (text: string) => (
      <div className="text-sm" style={{ color: "#141414" }}>
        {dayjs(text).format("DD-MM-YY HH:mm")}
      </div>
    )
  },
  {
    title: "Prioridad",
    width: 90,
    render: () => "-"
  },
  {
    title: "Estado",
    dataIndex: "status_description",
    width: 120,
    render: (_: string, record: IAlert) => (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: record.status_color }} />
        <span className="text-sm">{record.status_description}</span>
      </div>
    )
  },
  {
    title: "Acciones",
    width: 90,
    render: (_: unknown, record: IAlert) => (
      <div className="flex items-center space-x-2">
        <Link href={`/data-quality/client/${record.id_client}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs bg-transparent"
            title="Ir al catálogo del cliente"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Ir
          </Button>
        </Link>
      </div>
    )
  }
];

export function AlertsTable({ alerts, isLoading, pagination, onPageChange }: AlertsTableProps) {
  return (
    <>
      <Table<IAlert>
        columns={columns}
        dataSource={alerts}
        rowKey="id"
        pagination={false}
        loading={isLoading}
        showSorterTooltip={false}
        size="small"
        tableLayout="auto"
        scroll={{
          x: 100
        }}
      />

      <div className="mt-4 p-4 border-t flex items-center justify-between">
        <Pagination
          current={pagination.current}
          onChange={onPageChange}
          total={pagination.total}
          pageSize={pagination.pageSize}
          showSizeChanger={false}
        />
        <span className="text-sm" style={{ color: "#141414" }}>
          Mostrando {alerts.length} de {pagination.total} alertas
        </span>
      </div>
    </>
  );
}
