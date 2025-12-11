"use client";

import { useEffect, useState } from "react";
import { Button, Table, TableProps, Typography } from "antd";
import { Eye } from "phosphor-react";

import { Badge } from "@/modules/chat/ui/badge";

import "./approvals-table.scss";

const { Text } = Typography;

type ApprovalStatus = "pendiente" | "aprobado" | "rechazado" | "en-espera";
type ApprovalType = "creacion-nota" | "cupo-credito" | "creacion-cliente" | "orden-compra";

interface ApprovalApprover {
  name: string;
  step: number;
  status: ApprovalStatus;
  date?: string;
  time?: string;
  comment?: string;
}

interface Approval {
  id: string;
  type: ApprovalType;
  client: string;
  date: string;
  daysWaiting: number;
  status: ApprovalStatus;
  requestedBy: string;
  otherApprovers: ApprovalApprover[];
  comment: string;
  attachments: string[];
  detailLink: string;
  details: {
    amount?: string;
    items?: string[];
    currentLimit?: string;
    requestedLimit?: string;
    clientInfo?: string;
  };
}

interface ApprovalsTableProps {
  approvals: Approval[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onSelectApproval: (approval: Approval) => void;
}

const approvalTypeLabels: Record<ApprovalType, string> = {
  "creacion-nota": "Creacion de Nota",
  "cupo-credito": "Cupo de Credito",
  "creacion-cliente": "Creacion Cliente",
  "orden-compra": "Orden de Compra"
};

const statusConfig: Record<ApprovalStatus, { label: string; color: string; textColor: string }> = {
  pendiente: {
    label: "Pendiente",
    color: "#FFC107",
    textColor: "text-black"
  },
  aprobado: {
    label: "Aprobado",
    color: "#4CAF50",
    textColor: "text-white"
  },
  rechazado: {
    label: "Rechazado",
    color: "#E53935",
    textColor: "text-white"
  },
  "en-espera": {
    label: "En Espera",
    color: "#2196F3",
    textColor: "text-white"
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calculateDaysColor = (days: number) => {
  if (days <= 2) return "text-cashport-black";
  if (days <= 5) return "text-orange-600";
  return "text-red-600";
};

export default function ApprovalsTable({
  approvals,
  selectedIds,
  onSelectIds,
  onSelectApproval
}: ApprovalsTableProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    setSelectedRowKeys(selectedIds);
  }, [selectedIds]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    onSelectIds(newSelectedRowKeys as string[]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<Approval>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <Text className="idText" onClick={() => onSelectApproval(record)}>
          {id}
        </Text>
      ),
      sorter: (a, b) => a.id.localeCompare(b.id),
      showSorterTooltip: false
    },
    {
      title: "Tipo de Aprobación",
      dataIndex: "type",
      key: "type",
      render: (type: ApprovalType) => <Text>{approvalTypeLabels[type]}</Text>,
      sorter: (a, b) => approvalTypeLabels[a.type].localeCompare(approvalTypeLabels[b.type]),
      showSorterTooltip: false
    },
    {
      title: "Cliente",
      dataIndex: "client",
      key: "client",
      render: (text) => <Text className="clientText">{text}</Text>,
      sorter: (a, b) => a.client.localeCompare(b.client),
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (text) => <Text>{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.date) - Date.parse(b.date),
      showSorterTooltip: false,
      width: 115
    },
    {
      title: "Días Pendientes",
      dataIndex: "daysWaiting",
      key: "daysWaiting",
      align: "center",
      render: (days: number) => (
        <Text className={`daysText ${calculateDaysColor(days)}`}>{days}</Text>
      ),
      sorter: (a, b) => a.daysWaiting - b.daysWaiting,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: ApprovalStatus) => {
        const config = statusConfig[status];
        return (
          <Badge className={config.textColor} style={{ backgroundColor: config.color }}>
            {config.label}
          </Badge>
        );
      },
      sorter: (a, b) => a.status.localeCompare(b.status),
      showSorterTooltip: false,
      width: 120
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Button
          className="buttonSeeDetail"
          onClick={() => onSelectApproval(record)}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          className="approvalsTable"
          columns={columns}
          rowSelection={rowSelection}
          dataSource={approvals.map((data) => ({ ...data, key: data.id }))}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {approvals.map((approval) => {
          const statusData = statusConfig[approval.status];

          return (
            <div
              key={approval.id}
              className="rounded-lg border bg-white shadow-sm overflow-hidden"
              style={{ borderLeftWidth: "4px", borderLeftColor: statusData.color }}
            >
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {approvalTypeLabels[approval.type]}
                    </p>
                    <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                      {approval.daysWaiting}d
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{approval.client}</p>
                </div>
                <Button
                  className="buttonSeeDetail"
                  onClick={() => onSelectApproval(approval)}
                  icon={<Eye size={"1.3rem"} />}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
