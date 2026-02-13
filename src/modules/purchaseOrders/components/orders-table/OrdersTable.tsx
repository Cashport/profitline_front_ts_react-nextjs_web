"use client";

import { useState } from "react";
import { Table, TableProps, Button, Typography, Flex } from "antd";
import { Eye, AlertCircle } from "lucide-react";
import { IPurchaseOrder } from "@/types/purchaseOrders/purchaseOrders";
import { Pagination } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import useScreenHeight from "@/components/hooks/useScreenHeight";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import { Badge } from "@/modules/chat/ui/badge";
import { WarningDiamond } from "@phosphor-icons/react";
import { ChangeWarehouseModal } from "@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal";

const { Text } = Typography;

const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  const [datePart, timePartRaw] = dateString.includes("T")
    ? dateString.split("T")
    : dateString.split(" ");

  const [year, month, day] = datePart.split("-");

  const timePart = timePartRaw ? timePartRaw.replace("Z", "").slice(0, 5) : "";

  return {
    date: `${day}/${month}/${year}`,
    time: timePart
  };
};

interface OrdersTableProps {
  data: IPurchaseOrder[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  mutate: () => void;
  selectedRowKeys?: React.Key[];
  onRowSelect?: (selectedRowKeys: React.Key[], selectedRows: IPurchaseOrder[]) => void;
  onRowClick?: (record: IPurchaseOrder) => void;
}

export function OrdersTable({
  data,
  pagination,
  loading,
  mutate,
  onPageChange,
  selectedRowKeys,
  onRowSelect,
  onRowClick
}: OrdersTableProps) {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();
  const [selectedOrder, setSelectedOrder] = useState({
    id: 0,
    warehouse_id: 0
  });
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  const columns: TableProps<IPurchaseOrder>["columns"] = [
    {
      title: "ID",
      dataIndex: "purchaseOrderId",
      key: "purchaseOrderId",
      render: (id, record) => (
        <button
          onClick={() => onRowClick?.(record)}
          className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
        >
          {id}
        </button>
      ),
      sorter: (a, b) => a.purchaseOrderId - b.purchaseOrderId,
      showSorterTooltip: false,
      width: 80
    },
    {
      title: "Orden de compra",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (orderNumber, record) => {
        const formattedDate = formatDate(record.orderDate);
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
      sorter: (a, b) => (a.deliveryDate || "").localeCompare(b.deliveryDate || ""),
      showSorterTooltip: false
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => (
        <>
          {record.noveltyTypes ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help">
                  <Badge
                    variant="outline"
                    className="text-white font-medium border-transparent"
                    style={{
                      backgroundColor: record.statusColor || "#B0BEC5",
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: "8px"
                    }}
                  >
                    {status || "-"}
                  </Badge>
                  <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-gray-900 text-white p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm">Tipo de novedad:</div>
                  <div className="text-sm whitespace-pre-wrap">{record.noveltyTypes}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge
              variant="outline"
              className="text-white font-medium border-transparent"
              style={{
                backgroundColor: record.statusColor || "#B0BEC5",
                fontSize: "12px",
                padding: "4px 12px",
                borderRadius: "8px"
              }}
            >
              {status || "-"}
            </Badge>
          )}
        </>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
      showSorterTooltip: false
    },
    {
      title: "Factura",
      dataIndex: "invoiceIds",
      key: "invoiceIds",
      render: (invoiceIds: string[]) => (
        <Text
          className="!text-xs line-clamp-2 break-words"
          title={invoiceIds && invoiceIds.length > 0 ? invoiceIds.join(", ") : ""}
        >
          {invoiceIds && invoiceIds.length > 0 ? invoiceIds.join(", ") : "-"}
        </Text>
      ),
      width: 100,
      align: "right"
    },
    {
      title: "Productos",
      dataIndex: "totalProducts",
      key: "totalProducts",
      align: "right",
      render: (totalProducts) => <Text className="text-cashport-black">{totalProducts || 0}</Text>,
      sorter: (a, b) => a.totalProducts - b.totalProducts,
      showSorterTooltip: false
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
        <Flex gap={8}>
          <Button
            type="text"
            size="small"
            className="h-8 w-8 rounded-md border-gray-300 hover:bg-gray-100 bg-transparent"
            onClick={() => {
              setSelectedOrder({
                id: record.id,
                warehouse_id: record.warehouseId || 0
              });
              setIsWarehouseModalOpen(true);
            }}
            icon={<WarningDiamond className="h-4 w-4 text-gray-600" />}
          />
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
        </Flex>
      )
    }
  ];

  return (
    <>
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
          style: { marginBottom: "0.125rem" },
          current: pagination?.actualPage || 1,
          pageSize: pagination?.rowsperpage || 10,
          total: pagination?.totalRows || 0,
          onChange: onPageChange,
          showSizeChanger: false,
          position: ["bottomRight"],
          showTotal: (total, range) => `Mostrando ${range[0]} a ${range[1]} de ${total} resultados`
        }}
        scroll={{ y: height - 345, x: 100 }}
      />
      <ChangeWarehouseModal
        isOpen={isWarehouseModalOpen}
        selectedOrder={selectedOrder.id}
        currentWarehouseId={selectedOrder.warehouse_id}
        onClose={() => setIsWarehouseModalOpen(false)}
        setFetchMutate={mutate}
      />
    </>
  );
}
