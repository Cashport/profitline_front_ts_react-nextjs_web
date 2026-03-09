import React, { useState, useEffect } from "react";
import { Modal, Button, Input, message } from "antd";
import { Paperclip, Plus, X, Upload } from "lucide-react";

import { IOrder } from "@/types/purchaseOrders/purchaseOrders";
import { sendMultiplePurchaseOrdersToBilling } from "@/services/purchaseOrders/purchaseOrders";

interface FacturaRow {
  numero: string;
  archivo: File | null;
}

interface ModalUploadInvoicesPurchaseOrdersProps {
  isOpen: boolean;
  onClose: () => void;
  orders: IOrder[];
  onSuccess?: () => void;
}

export function ModalUploadInvoicesPurchaseOrders({
  isOpen,
  onClose,
  orders,
  onSuccess
}: ModalUploadInvoicesPurchaseOrdersProps) {
  const [facturaInputs, setFacturaInputs] = useState<Record<number, FacturaRow[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && orders.length > 0) {
      const initial: Record<number, FacturaRow[]> = {};
      orders.forEach((order) => {
        initial[order.id] = [{ numero: "", archivo: null }];
      });
      setFacturaInputs(initial);
    }
    if (!isOpen) {
      setFacturaInputs({});
      setIsLoading(false);
    }
  }, [isOpen, orders]);

  const handleSubmit = async () => {
    const allRows = Object.entries(facturaInputs).flatMap(([orderId, rows]) =>
      rows.map((row) => ({ orderId: Number(orderId), ...row }))
    );

    const incomplete = allRows.some((r) => !r.numero.trim() || !r.archivo);
    if (incomplete) {
      message.warning("Cada factura debe tener un número y un archivo adjunto");
      return;
    }

    setIsLoading(true);

    try {
      const request: Array<{ purchase_order_id: string; invoice_id: string }> = [];
      const files: File[] = [];

      Object.entries(facturaInputs).forEach(([orderId, rows]) => {
        rows.forEach((row) => {
          request.push({
            purchase_order_id: orderId,
            invoice_id: row.numero.trim()
          });
          if (row.archivo) files.push(row.archivo);
        });
      });

      const modelData = {
        data: request,
        files
      };

      await sendMultiplePurchaseOrdersToBilling(
        orders.map((o) => String(o.id)),
        modelData
      );

      message.success("Facturas cargadas correctamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar las facturas";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={<span className="text-base font-semibold text-cashport-black">Subir facturas</span>}
      footer={
        <div className="flex justify-end gap-2">
          <Button size="small" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="small"
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
            style={{ backgroundColor: "#CBE71E", color: "#000", borderColor: "#CBE71E" }}
            icon={<Upload className="h-3.5 w-3.5" />}
          >
            Cargar facturas
          </Button>
        </div>
      }
      centered
      width={900}
    >
      {Object.keys(facturaInputs).length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          Selecciona al menos una OC del listado para subir facturas.
        </p>
      ) : (
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-44">OC</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-36">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700 w-36">Monto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">No. Factura</th>
                <th className="px-3 py-3 w-12 text-center font-semibold text-gray-700">PDF</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {orders.flatMap((order) => {
                const rows = facturaInputs[order.id] ?? [{ numero: "", archivo: null }];
                return rows.map((row, rowIdx) => (
                  <tr
                    key={`${order.id}-${rowIdx}`}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    {/* OC — only on first row of this OC */}
                    <td className="px-4 py-2.5 align-middle">
                      {rowIdx === 0 ? (
                        <span className="font-semibold text-cashport-black text-sm">
                          {order.orderNumber}
                        </span>
                      ) : null}
                    </td>

                    {/* Estado — only on first row */}
                    <td className="px-4 py-2.5 align-middle">
                      {rowIdx === 0 ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: order.statusColor || "#e5e7eb",
                            color: "#333"
                          }}
                        >
                          {order.status ?? "-"}
                        </span>
                      ) : null}
                    </td>

                    {/* Monto — only on first row */}
                    <td className="px-4 py-2.5 align-middle text-right">
                      {rowIdx === 0 ? (
                        <span className="text-sm font-semibold text-cashport-black">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            maximumFractionDigits: 0
                          }).format(order.totalAmount)}
                        </span>
                      ) : null}
                    </td>

                    {/* No. Factura input */}
                    <td className="px-4 py-2.5 align-middle">
                      <Input
                        placeholder="Ej: FAC-2024-001"
                        value={row.numero}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFacturaInputs((prev) => {
                            const updated = [...(prev[order.id] ?? [])];
                            updated[rowIdx] = { ...updated[rowIdx], numero: val };
                            return { ...prev, [order.id]: updated };
                          });
                        }}
                        style={{ height: 40 }}
                      />
                    </td>

                    {/* File upload */}
                    <td className="px-3 py-2.5 text-center align-middle">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setFacturaInputs((prev) => {
                              const updated = [...(prev[order.id] ?? [])];
                              updated[rowIdx] = { ...updated[rowIdx], archivo: file };
                              return { ...prev, [order.id]: updated };
                            });
                          }}
                        />
                        <div
                          className={`inline-flex items-center justify-center h-10 w-10 rounded-md border transition-colors ${
                            row.archivo
                              ? "border-green-400 bg-green-50 text-green-600"
                              : "border-gray-300 bg-white text-gray-400 hover:bg-gray-50"
                          }`}
                          title={row.archivo?.name ?? "Adjuntar PDF"}
                        >
                          <Paperclip className="h-4 w-4" />
                        </div>
                      </label>
                    </td>

                    {/* Add / Remove row */}
                    <td className="px-2 py-2.5 text-center align-middle">
                      {rowIdx === rows.length - 1 ? (
                        <button
                          onClick={() =>
                            setFacturaInputs((prev) => ({
                              ...prev,
                              [order.id]: [...(prev[order.id] ?? []), { numero: "", archivo: null }]
                            }))
                          }
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Agregar factura"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setFacturaInputs((prev) => {
                              const updated = [...(prev[order.id] ?? [])];
                              updated.splice(rowIdx, 1);
                              return { ...prev, [order.id]: updated };
                            })
                          }
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          title="Quitar factura"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
