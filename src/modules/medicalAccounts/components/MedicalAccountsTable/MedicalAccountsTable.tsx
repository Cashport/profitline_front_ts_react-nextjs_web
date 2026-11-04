"use client";

import { Button, Flex, Popconfirm, Table, TableProps } from "antd";
import { Eye, Trash } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { useMessageApi } from "@/context/MessageContext";
import { deleteMedicalAccount } from "@/services/medicalAccounts/medicalAccounts";
import { IMedicalAccountListItem } from "../../types/IMedicalAccount";
import { MedicalAccountStatusTag } from "../MedicalAccountStatusTag/MedicalAccountStatusTag";

interface MedicalAccountsTableProps {
  data: IMedicalAccountListItem[];
  loading?: boolean;
  onOpenDetail?: (record: IMedicalAccountListItem) => void;
  onDeleted?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
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
  onDeleted,
  selectedRowKeys,
  onSelectionChange,
  currentPage,
  pageSize,
  total,
  onPageChange
}: MedicalAccountsTableProps) {
  const t = useTranslations("medicalAccounts.table");
  const tCommon = useTranslations("common");
  const { showMessage } = useMessageApi();

  const handleDelete = async (record: IMedicalAccountListItem) => {
    try {
      await deleteMedicalAccount(record.id);
      showMessage("success", t("deleteSuccess"));
      onDeleted?.();
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("deleteError"));
    }
  };

  const columns: TableProps<IMedicalAccountListItem>["columns"] = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (value: number) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: t("columns.orderNumber"),
      dataIndex: "order_number",
      key: "order_number",
      width: 130,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: t("columns.authorizationNumber"),
      dataIndex: "authorization_number",
      key: "authorization_number",
      width: 160,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: t("columns.patient"),
      key: "paciente",
      width: 200,
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <div className="flex min-w-0 flex-col" style={{ maxWidth: 200 }}>
          <span className="truncate text-sm text-cashport-black">{record.patient_name ?? "-"}</span>
          <span className="truncate text-[13px] text-gray-500">
            {record.document_number ?? "-"}
          </span>
        </div>
      )
    },
    {
      title: t("columns.uploadDate"),
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (value: string) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: t("columns.serviceDate"),
      dataIndex: "service_date",
      key: "service_date",
      width: 120,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: t("columns.regimen"),
      dataIndex: "regimen",
      key: "regimen",
      width: 110,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: t("columns.eps"),
      dataIndex: "eps",
      key: "eps",
      width: 150,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: t("columns.serviceType"),
      dataIndex: "service_type",
      key: "service_type",
      width: 130,
      render: (value: string | null) => (
        <span className="whitespace-nowrap text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: tCommon("fields.status"),
      dataIndex: "status_name",
      key: "status_name",
      width: 210,
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <span className="whitespace-nowrap">
          <MedicalAccountStatusTag
            statusCode={record.status_code}
            statusName={record.status_name}
          />
        </span>
      )
    },
    {
      title: "",
      key: "acciones",
      width: 96,
      render: (_: unknown, record: IMedicalAccountListItem) => (
        <Flex gap={4} align="center">
          <Button
            type="text"
            onClick={() => onOpenDetail?.(record)}
            icon={<Eye size={"1.3rem"} />}
            aria-label={tCommon("actions.viewDetail")}
          />
          <Popconfirm
            title={t("deleteConfirm.title")}
            description={t("deleteConfirm.description")}
            okText={tCommon("actions.delete")}
            cancelText={tCommon("actions.cancel")}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button
              type="text"
              danger
              icon={<Trash size={"1.3rem"} />}
              aria-label={tCommon("actions.delete")}
            />
          </Popconfirm>
        </Flex>
      )
    }
  ];

  return (
    <Table<IMedicalAccountListItem>
      columns={columns}
      dataSource={data.map((row) => ({ ...row, key: row.id }))}
      loading={loading}
      scroll={{ x: "max-content" }}
      rowSelection={
        selectedRowKeys
          ? {
              selectedRowKeys,
              onChange: onSelectionChange,
              preserveSelectedRowKeys: false
            }
          : undefined
      }
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
