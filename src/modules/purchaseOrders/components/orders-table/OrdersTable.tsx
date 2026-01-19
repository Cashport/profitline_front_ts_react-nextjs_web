"use client";

import { Table, TableProps, Badge, Button, Typography } from "antd";
import { Eye } from "lucide-react";
import { IPurchaseOrder } from "@/types/purchaseOrders/purchaseOrders";
import { Pagination } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";

const { Text } = Typography;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`
  };
};

interface OrdersTableProps {
  data: IPurchaseOrder[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  selectedRowKeys?: React.Key[];
  onRowSelect?: (selectedRowKeys: React.Key[], selectedRows: IPurchaseOrder[]) => void;
  onRowClick?: (record: IPurchaseOrder) => void;
}

export function OrdersTable({
  data,
  pagination,
  loading,
  onPageChange,
  selectedRowKeys,
  onRowSelect,
  onRowClick
}: OrdersTableProps) {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const columns: TableProps<IPurchaseOrder>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <button
          onClick={() => onRowClick?.(record)}
          className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
        >
          {id}
        </button>
      ),
      sorter: (a, b) => a.id - b.id,
      showSorterTooltip: false,
      width: 80
    },
    {
      title: "Orden de compra",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber, record) => {
        const formattedDate = formatDate(record.deliveryDate);
        return (
          <div className="flex flex-col">
            <Text className="text-cashport-black">{orderNumber || "-"}</Text>
            <Text className="!text-xs !text-gray-500">
              {typeof formattedDate === "object" ? formattedDate.date : formattedDate}
            </Text>
          </div>
        );
      },
      sorter: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      showSorterTooltip: false
    },
    {
      title: "Cliente",
      dataIndex: "customerName",
      key: "customerName",
      render: (customerName, record) => (
        <div className="flex flex-col max-w-64">
          <Text className="truncate" title={customerName || ""}>
            {customerName || "-"}
          </Text>
          <Text className="!text-xs !text-gray-500 truncate" title={record.deliveryAddress || ""}>
            {record.deliveryAddress || ""}
          </Text>
        </div>
      ),
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      showSorterTooltip: false
    },
    {
      title: "Entrega",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      render: (deliveryDate) => {
        if (!deliveryDate) return "-";
        const formattedDate = formatDate(deliveryDate);
        return (
          <div className="flex flex-col">
            <Text>{typeof formattedDate === "object" ? formattedDate.date : formattedDate}</Text>
            {typeof formattedDate === "object" && formattedDate.time && (
              <Text className="!text-xs !text-gray-500">{formattedDate.time}</Text>
            )}
          </div>
        );
      },
      sorter: (a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime(),
      showSorterTooltip: false
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => (
        <Badge color={record.statusColor || "#B0BEC5"} text={status || "-"} status="default" />
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      showSorterTooltip: false
    },
    {
      title: "Productos",
      dataIndex: "totalProducts",
      key: "totalProducts",
      align: "right",
      render: (totalProducts) => <Text className="text-cashport-black">{totalProducts || 0}</Text>,
      sorter: (a, b) => a.totalProducts - b.totalProducts,
      showSorterTooltip: false,
      width: 100
    },
    {
      title: "Monto",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (totalAmount) => (
        <Text className="text-cashport-black">{formatMoney(totalAmount || 0)}</Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      showSorterTooltip: false,
      width: 140
    },
    {
      key: "actions",
      width: 60,
      align: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100 bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            onRowClick?.(record);
          }}
          icon={<Eye className="h-4 w-4 text-gray-600" />}
        />
      )
    }
  ];

  return (
    <Table
      className="w-full"
      columns={columns}
      dataSource={data?.map((item) => ({ ...item, key: item.id }))}
      rowSelection={
        onRowSelect
          ? {
              selectedRowKeys,
              onChange: onRowSelect
            }
          : undefined
      }
      loading={loading}
      pagination={{
        current: pagination?.actualPage || 1,
        pageSize: pagination?.rowsperpage || 10,
        total: pagination?.totalRows || 0,
        onChange: onPageChange,
        showSizeChanger: false,
        position: ["bottomRight"],
        showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} resultados`
      }}
      scroll={{ x: 1200 }}
    />
  );
}
