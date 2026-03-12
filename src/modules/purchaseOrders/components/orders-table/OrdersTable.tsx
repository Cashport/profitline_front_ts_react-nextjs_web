"use client";

import { useState, Fragment } from "react";
import { Pagination as AntPagination, Spin, Flex, Button } from "antd";
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import {
  IPurchaseOrder,
  IOrder,
  IinvoicePurchaseOrder
} from "@/types/purchaseOrders/purchaseOrders";
import { Pagination } from "@/types/global/IGlobal";
import { useAppStore } from "@/lib/store/store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import { Badge } from "@/modules/chat/ui/badge";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { Eye, WarningDiamond } from "@phosphor-icons/react";
import { ChangeWarehouseModal } from "@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal";
import "./OrdersTable.scss";

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

const renderStatusBadge = (status: string, statusColor: string, noveltyTypes: string) => (
  <>
    {noveltyTypes ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <Badge
              variant="outline"
              className="text-white font-medium border-transparent"
              style={{
                backgroundColor: statusColor || "#B0BEC5",
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
            <div className="text-sm whitespace-pre-wrap">{noveltyTypes}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Badge
        variant="outline"
        className="text-white font-medium border-transparent"
        style={{
          backgroundColor: statusColor || "#B0BEC5",
          fontSize: "12px",
          padding: "4px 12px",
          borderRadius: "8px"
        }}
      >
        {status || "-"}
      </Badge>
    )}
  </>
);

const renderInvoices = (invoices: IinvoicePurchaseOrder[] | null) => {
  if (!invoices || invoices.length === 0) return <span className="text-gray-400">-</span>;

  if (invoices.length === 1) {
    return <span className="text-gray-700">{invoices[0].invoice_id}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help text-gray-700">
          {invoices[0].invoice_id}
          <span className="ml-1.5 text-xs text-gray-600 border border-gray-300 rounded px-1.5 py-0.5 bg-gray-50">
            +{invoices.length - 1}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white p-3 max-w-xs">
        <div className="space-y-1">
          {invoices.map((inv, i) => (
            <div key={i} className="text-sm">
              {inv.invoice_id}
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface OrdersTableProps {
  data: IPurchaseOrder[];
  pagination: Pagination;
  loading: boolean;
  onPageChange: (page: number) => void;
  mutate: () => void;
  selectedRowKeys?: React.Key[];
  onRowSelect?: (selectedRowKeys: React.Key[], selectedRows: IPurchaseOrder[]) => void;
  selectedOrders?: IOrder[];
  onOrderSelect?: (selectedOrders: IOrder[]) => void;
  onRowClick?: (record: IPurchaseOrder) => void;
  onOrderClick?: (order: IOrder) => void;
}

export function OrdersTable({
  data,
  pagination,
  loading,
  onPageChange,
  mutate,
  selectedRowKeys = [],
  onRowSelect,
  selectedOrders = [],
  onOrderSelect,
  onRowClick,
  onOrderClick
}: OrdersTableProps) {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const [expandedPackageIds, setExpandedPackageIds] = useState<Set<number>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState({ id: 0, warehouse_id: 0 });
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  const toggleExpand = (packageId: number) => {
    setExpandedPackageIds((prev) => {
      const next = new Set(prev);
      if (next.has(packageId)) next.delete(packageId);
      else next.add(packageId);
      return next;
    });
  };

  const allOrders = data.flatMap((pkg) => pkg.orders);
  const isAllSelected =
    data.length > 0 &&
    data.every((pkg) => selectedRowKeys.includes(pkg.packageId)) &&
    allOrders.every((o) => selectedOrders.some((s) => s.id === o.id));

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      onRowSelect?.(
        data.map((pkg) => pkg.packageId),
        data
      );
      onOrderSelect?.(allOrders);
    } else {
      onRowSelect?.([], []);
      onOrderSelect?.([]);
    }
  };

  const handleSelectPackage = (pkg: IPurchaseOrder, checked: boolean | "indeterminate") => {
    if (!onRowSelect) return;
    if (checked === true) {
      const newKeys = [...selectedRowKeys, pkg.packageId];
      const newRows = data.filter((p) => newKeys.includes(p.packageId));
      onRowSelect(newKeys, newRows);
      // Also select all child orders
      if (onOrderSelect) {
        const orderIdsAlreadySelected = new Set(selectedOrders.map((s) => s.id));
        const newOrders = pkg.orders.filter((o) => !orderIdsAlreadySelected.has(o.id));
        if (newOrders.length > 0) {
          onOrderSelect([...selectedOrders, ...newOrders]);
        }
      }
    } else {
      const newKeys = selectedRowKeys.filter((k) => k !== pkg.packageId);
      const newRows = data.filter((p) => newKeys.includes(p.packageId));
      onRowSelect(newKeys, newRows);
      // Also deselect all child orders
      if (onOrderSelect) {
        const orderIdsToRemove = new Set(pkg.orders.map((o) => o.id));
        onOrderSelect(selectedOrders.filter((s) => !orderIdsToRemove.has(s.id)));
      }
    }
  };

  const handleSelectOrder = (order: IOrder, checked: boolean | "indeterminate") => {
    if (!onOrderSelect) return;
    if (checked === true) {
      onOrderSelect([...selectedOrders, order]);
    } else {
      onOrderSelect(selectedOrders.filter((s) => s.id !== order.id));
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: "20rem" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white border-b border-gray-200">
            <tr>
              <th className="text-left p-4 font-bold text-black">
                <div className="flex items-center gap-2">
                  {onRowSelect && (
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  )}
                  <span>ID Pedido</span>
                </div>
              </th>
              <th className="text-left p-4 font-bold text-black">Orden de compra</th>
              <th className="text-left p-4 font-bold text-black">Cliente</th>
              <th className="text-left p-4 font-bold text-black">Entrega</th>
              <th className="text-left p-4 font-bold text-black">Estado</th>
              <th className="text-left p-4 font-bold text-black">Factura</th>
              <th className="text-right p-4 font-bold text-black">Productos</th>
              <th className="text-right p-4 font-bold text-black w-28">Monto</th>
              <th className="p-4 w-16" />
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-gray-500 py-8">
                  No hay órdenes de compra.
                </td>
              </tr>
            )}
            {data.map((pkg) => {
              const isExpanded = expandedPackageIds.has(pkg.packageId);
              const isMulti = pkg.orders.length > 1;
              const singleOrder = pkg.orders.length === 1 ? pkg.orders[0] : null;
              const isSelected = selectedRowKeys.includes(pkg.packageId);

              const renderIdPedidoCell = () => (
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {onRowSelect && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectPackage(pkg, checked)}
                        />
                      </div>
                    )}
                    <div
                      className={`flex items-center gap-1.5 select-none ${isMulti ? "cursor-pointer" : ""}`}
                      onClick={() => isMulti && toggleExpand(pkg.packageId)}
                    >
                      <span className="w-3.5 h-3.5 flex items-center justify-center text-gray-400 shrink-0">
                        {isMulti &&
                          (isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          ))}
                      </span>
                      <span className="text-gray-700">{pkg.packageNumber}</span>
                    </div>
                  </div>
                </td>
              );

              return (
                <Fragment key={pkg.packageId}>
                  {/* ── GROUP HEADER ROW (multi-order) ── */}
                  {isMulti && (
                    <tr
                      key={`pkg-${pkg.packageId}`}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      {renderIdPedidoCell()}
                      <td className="p-4 text-gray-500 text-sm">{pkg.orderCount} ordenes</td>
                      <td className="p-4 text-gray-700 max-w-64">
                        <span className="truncate" title={pkg.customerName}>
                          {pkg.customerName || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        {(() => {
                          if (!pkg.deliveryDate) return "-";
                          const d = formatDate(pkg.deliveryDate);
                          return typeof d === "object" ? d.date : d;
                        })()}
                      </td>
                      <td className="p-4">
                        {renderStatusBadge(pkg.status, pkg.statusColor, pkg.noveltyTypes)}
                      </td>
                      <td className="p-4">{renderInvoices(pkg.invoices)}</td>
                      <td className="p-4 text-right font-semibold text-cashport-black">
                        {pkg.totalProducts || 0}
                      </td>
                      <td className="p-4 text-right font-semibold text-cashport-black w-28">
                        {formatMoney(pkg.totalAmount || 0)}
                      </td>
                      <td className="p-4 text-right">
                        <Flex gap={8} justify="flex-end">
                          <Button
                            onClick={() => onRowClick?.(pkg)}
                            className="buttonSeeProject"
                            icon={<Eye size={"1.3rem"} />}
                          />
                        </Flex>
                      </td>
                    </tr>
                  )}

                  {/* ── CHILD ROWS (expanded) or SINGLE-ORDER ROW ── */}
                  {pkg.orders.map((order) => {
                    if (isMulti && !isExpanded) return null;

                    return (
                      <tr
                        key={`order-${order.id}`}
                        className={`border-b transition-colors ${
                          isMulti
                            ? "border-gray-100 bg-gray-50/30 hover:bg-gray-50/60"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {/* ID Pedido cell: checkbox for child rows, full for single-order */}
                        {isMulti ? (
                          <td className="p-4">
                            {onOrderSelect && (
                              <div
                                className="flex items-center justify-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={selectedOrders.some((s) => s.id === order.id)}
                                  onCheckedChange={(checked) => handleSelectOrder(order, checked)}
                                />
                              </div>
                            )}
                          </td>
                        ) : (
                          renderIdPedidoCell()
                        )}

                        {/* Orden de compra */}
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-cashport-black">{order.orderNumber || "-"}</span>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const d = formatDate(order.orderDate);
                                return typeof d === "object" ? d.date : d;
                              })()}
                            </span>
                          </div>
                        </td>

                        {/* Cliente + address */}
                        <td className="p-4 text-gray-700 max-w-64">
                          <div className="flex flex-col">
                            <span className="truncate" title={pkg.customerName}>
                              {pkg.customerName || "-"}
                            </span>
                            {order.deliveryAddress && (
                              <span
                                className="text-xs text-gray-500 truncate"
                                title={order.deliveryAddress}
                              >
                                {order.deliveryAddress}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Entrega */}
                        <td className="p-4 text-gray-700">
                          {(() => {
                            if (!order.deliveryDate) return "-";
                            const d = formatDate(order.deliveryDate);
                            if (typeof d === "string") return d;
                            return (
                              <div className="flex flex-col">
                                <span>{d.date}</span>
                                {d.time && <span className="text-xs text-gray-500">{d.time}</span>}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Estado */}
                        <td className="p-4">
                          {renderStatusBadge(order.status, order.statusColor, order.noveltyTypes)}
                        </td>

                        {/* Factura */}
                        <td className="p-4 text-gray-700">{renderInvoices(order.invoices)}</td>

                        {/* Productos */}
                        <td className="p-4 text-right text-cashport-black">
                          {order.totalProducts || 0}
                        </td>

                        {/* Monto */}
                        <td className="p-4 text-right text-cashport-black w-28">
                          {formatMoney(order.totalAmount || 0)}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <Flex gap={8} justify="flex-end">
                            <Button
                              onClick={() => {
                                setSelectedOrder({
                                  id: order.id,
                                  warehouse_id: order.warehouseId || 0
                                });
                                setIsWarehouseModalOpen(true);
                              }}
                              className="buttonSeeProject"
                              icon={<WarningDiamond size={"1.3rem"} />}
                            />
                            <Button
                              onClick={() => onOrderClick?.(order)}
                              className="buttonSeeProject"
                              icon={<Eye size={"1.3rem"} />}
                            />
                          </Flex>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-2 px-4 py-2">
        <span className="text-sm text-gray-500">
          Mostrando{" "}
          {Math.min(
            ((pagination?.actualPage || 1) - 1) * (pagination?.rowsperpage || 10) + 1,
            pagination?.totalRows || 0
          )}{" "}
          a{" "}
          {Math.min(
            (pagination?.actualPage || 1) * (pagination?.rowsperpage || 10),
            pagination?.totalRows || 0
          )}{" "}
          de {pagination?.totalRows || 0} resultados
        </span>
        <AntPagination
          current={pagination?.actualPage || 1}
          pageSize={pagination?.rowsperpage || 10}
          total={pagination?.totalRows || 0}
          onChange={onPageChange}
          showSizeChanger={false}
          size="small"
        />
      </div>
      <ChangeWarehouseModal
        isOpen={isWarehouseModalOpen}
        selectedOrder={selectedOrder.id}
        currentWarehouseId={selectedOrder.warehouse_id}
        onClose={() => setIsWarehouseModalOpen(false)}
        setFetchMutate={mutate}
      />
    </div>
  );
}
