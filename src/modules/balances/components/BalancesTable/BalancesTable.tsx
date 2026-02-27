"use client";

import { Button, Table, TableProps, Tag } from "antd";
import { Eye } from "@phosphor-icons/react";
import "./BalancesTable.scss";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { IBalance } from "@/types/financialDiscounts/IFinancialDiscounts";

interface BalancesTableProps {
  data: IBalance[];
  loading?: boolean;
  selectedSaldoIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onOpenDetail: (balance: IBalance) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function BalancesTable({
  data,
  loading,
  selectedSaldoIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onOpenDetail
}: BalancesTableProps) {
  const height = useScreenHeight();
  const width = useScreenWidth();
  const columns: TableProps<IBalance>["columns"] = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      render: (value: number) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "Fecha saldo",
      dataIndex: "balance_date",
      key: "fecha",
      sorter: (a, b) => new Date(a.balance_date).getTime() - new Date(b.balance_date).getTime(),
      showSorterTooltip: false,
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{formatDate(value)}</span>
      )
    },
    {
      title: "Días",
      key: "diasSaldo",
      showSorterTooltip: false,
      render: () => <span className="text-sm text-cashport-black" />
    },
    {
      title: "Cliente",
      dataIndex: "client_name",
      key: "cliente",
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false,
      render: (value: string) => (
        <div className="flex items-center gap-2" style={{ maxWidth: 260 }}>
          <span
            className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: "#000" }}
          />
          <span className="text-sm text-cashport-black truncate" title={value}>
            {value}
          </span>
        </div>
      )
    },
    {
      title: "KAM",
      dataIndex: "kam_name",
      key: "kam",
      sorter: (a, b) => a.kam_name.localeCompare(b.kam_name),
      showSorterTooltip: false,
      render: (value: string) => <span className="text-sm text-cashport-black">{value}</span>
    },
    {
      title: "Tipo",
      dataIndex: "motive_name",
      key: "tipo",
      sorter: (a, b) => (a.motive_name ?? "").localeCompare(b.motive_name ?? ""),
      showSorterTooltip: false,
      render: (value: string) => (
        <span className="text-sm text-cashport-black">{value ?? "-"}</span>
      )
    },
    {
      title: "Estado",
      dataIndex: "status_name",
      key: "estado",
      width: 140,
      showSorterTooltip: false,
      render: (value: string) => (
        <Tag
          style={{
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid #d9d9d9",
            fontWeight: 500,
            whiteSpace: "nowrap"
          }}
        >
          {value}
        </Tag>
      )
    },
    {
      title: "Saldo inicial",
      dataIndex: "initial_amount",
      key: "initial_amount",
      align: "right",
      sorter: (a, b) => a.initial_amount - b.initial_amount,
      showSorterTooltip: false,
      render: (value: number) => (
        <span className="text-sm text-cashport-black font-medium fontMonoSpace">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: "Pendiente",
      dataIndex: "pending_amount",
      key: "pending_amount",
      align: "right",
      sorter: (a, b) => a.pending_amount - b.pending_amount,
      showSorterTooltip: false,
      render: (value: number) => (
        <span className="text-sm font-bold text-cashport-black fontMonoSpace">
          {formatCurrency(value)}
        </span>
      )
    },
    {
      title: "",
      key: "acciones",
      width: 48,
      render: (_: unknown, record: IBalance) => (
        <Button
          onClick={() => onOpenDetail(record)}
          className="buttonSeeProject"
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  const rowSelection: TableProps<IBalance>["rowSelection"] = {
    selectedRowKeys: selectedSaldoIds,
    onSelect: (record) => {
      onToggleSelection(String(record.id));
    },
    onSelectAll: (selected, selectedRows) => {
      if (selected) {
        onSelectAll(selectedRows.map((r) => String(r.id)));
      } else {
        onClearSelection();
      }
    }
  };

  return (
    <Table<IBalance>
      columns={columns}
      dataSource={data.map((s) => ({ ...s, key: s.id }))}
      loading={loading}
      rowSelection={rowSelection}
      pagination={{ pageSize: 10, showSizeChanger: false, position: ["bottomRight"] }}
      scroll={{ y: width > 1280 ? height - 345 : height - 370, x: undefined }}
      rowClassName={(record) =>
        selectedSaldoIds.includes(String(record.id)) ? "ant-table-row-selected" : ""
      }
      size="small"
    />
  );
}
