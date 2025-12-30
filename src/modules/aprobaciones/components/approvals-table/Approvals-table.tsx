"use client";

import { useEffect, useState } from "react";
import { Button, Table, TableProps, Typography } from "antd";
import { Eye } from "phosphor-react";

import { IApprovalItem, IApprovalStepStatus } from "@/types/approvals/IApprovals";
import { Badge } from "@/modules/chat/ui/badge";

import "./approvals-table.scss";

const { Text } = Typography;

interface ApprovalsTableProps {
  approvals: IApprovalItem[];
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onSelectApproval: (approval: IApprovalItem) => void;
  pagination?: {
    current: number;
    total: number;
    onChange: (page: number) => void;
  };
  isLoading?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function ApprovalsTable({
  approvals,
  selectedIds,
  onSelectIds,
  onSelectApproval,
  pagination,
  isLoading
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

  const columns: TableProps<IApprovalItem>["columns"] = [
    {
      title: "ID",
      dataIndex: "referenceId",
      key: "referenceId",
      render: (referenceId, record) => (
        <Text className="idText" onClick={() => onSelectApproval(record)}>
          {referenceId}
        </Text>
      ),
      sorter: (a, b) => a.referenceId.localeCompare(b.referenceId),
      showSorterTooltip: false
    },
    {
      title: "Tipo de Aprobación",
      dataIndex: "typeActionCode",
      key: "typeActionCode",
      render: (typeActionCode: string) => <Text>{typeActionCode}</Text>,
      sorter: (a, b) => a.typeActionCode.localeCompare(b.typeActionCode),
      showSorterTooltip: false
    },
    {
      title: "Cliente",
      key: "client",
      render: () => <Text className="clientText">-</Text>,
      showSorterTooltip: false
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => <Text>{formatDate(text)}</Text>,
      sorter: (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      showSorterTooltip: false,
      width: 115
    },
    {
      title: "Días Pendientes",
      key: "daysWaiting",
      align: "center",
      render: () => <Text className="daysText">-</Text>,
      showSorterTooltip: false,
      width: 130
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: IApprovalStepStatus) => (
        <Badge
          variant="outline"
          className="flex-shrink-0 border-gray-300 bg-gray-50 text-gray-700"
          style={
            status?.color && status?.backgroundColor
              ? {
                  color: status.color,
                  backgroundColor: status.backgroundColor,
                  borderColor: status.color
                }
              : undefined
          }
        >
          {status?.name || "Desconocido"}
        </Badge>
      ),
      sorter: (a, b) => a.status.name.localeCompare(b.status.name),
      showSorterTooltip: false
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
          loading={isLoading}
          pagination={
            pagination
              ? {
                  current: pagination.current,
                  pageSize: 20,
                  total: pagination.total,
                  onChange: pagination.onChange,
                  showSizeChanger: false
                }
              : { pageSize: 20, showSizeChanger: false }
          }
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {approvals.map((approval) => (
          <div key={approval.id} className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{approval.typeActionCode}</p>
                </div>
                <p className="text-sm text-gray-600 truncate">{approval.referenceId}</p>
              </div>
              <Button
                className="buttonSeeDetail"
                onClick={() => onSelectApproval(approval)}
                icon={<Eye size={"1.3rem"} />}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
