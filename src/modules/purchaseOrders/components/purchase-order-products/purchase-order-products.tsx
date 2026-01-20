import React from "react";
import { Input } from "@/modules/chat/ui/input";

interface Product {
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  iva: number;
  precioTotal: number;
}

interface PurchaseOrderProductsProps {
  editableProducts: Product[];
  isEditMode: boolean;
  isPdfCollapsed: boolean;
  pdfWidth: number;
  onProductFieldChange: (
    index: number,
    field: "cantidad" | "precioUnitario" | "iva",
    value: string
  ) => void;
  formatCurrency: (amount: number) => string;
}

export function PurchaseOrderProducts({
  editableProducts,
  isEditMode,
  isPdfCollapsed,
  pdfWidth,
  onProductFieldChange,
  formatCurrency
}: PurchaseOrderProductsProps) {
  // Calculate totals
  const totalUnits = editableProducts.reduce((sum, producto) => sum + producto.cantidad, 0);
  const totalIVA = editableProducts.reduce((sum, producto) => sum + producto.iva, 0);
  const totalAmount = editableProducts.reduce((sum, producto) => sum + producto.precioTotal, 0);

  return (
    <div
      className="space-y-6 transition-all duration-300 ease-in-out min-w-0"
      style={{
        flex: isPdfCollapsed ? "1" : `0 0 calc(${100 - pdfWidth}% - 1.5rem)`
      }}
    >
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-cashport-black">
            Detalle de Productos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cashport-gray-lighter border-b border-cashport-gray-light">
              <tr>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Producto cliente
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Cantidad
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Precio unitario
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  IVA
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Precio total
                </th>
              </tr>
            </thead>
            <tbody>
              {editableProducts.map((producto, index) => {
                const baseRowClass =
                  index % 2 === 0 ? "bg-white" : "bg-cashport-gray-lighter/30";

                const rowClass = `border-b border-cashport-gray-light ${baseRowClass}`;

                return (
                  <tr key={producto.idProducto} className={rowClass}>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-cashport-black">
                          {producto.nombreProducto}
                        </span>
                        <span className="text-xs text-blue-600 mt-0.5">
                          SKU: {producto.idProducto}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) =>
                            onProductFieldChange(index, "cantidad", e.target.value)
                          }
                          className="w-20 h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-cashport-black">
                          {producto.cantidad}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={producto.precioUnitario}
                          onChange={(e) =>
                            onProductFieldChange(
                              index,
                              "precioUnitario",
                              e.target.value
                            )
                          }
                          className="w-28 h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-cashport-black">
                          {formatCurrency(producto.precioUnitario)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={producto.iva}
                          onChange={(e) =>
                            onProductFieldChange(index, "iva", e.target.value)
                          }
                          className="w-24 h-8 text-sm"
                        />
                      ) : (
                        <span className="text-sm text-cashport-black">
                          {formatCurrency(producto.iva)}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-cashport-black">
                      {formatCurrency(producto.precioTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-cashport-gray-lighter border-t-2 border-cashport-gray-light">
              <tr>
                <td className="p-3 text-sm font-semibold text-cashport-black text-right">
                  Total
                </td>
                <td className="p-3 text-sm font-bold text-cashport-black">
                  {totalUnits.toLocaleString()}
                </td>
                <td className="p-3"></td>
                <td className="p-3 text-sm font-bold text-cashport-black">
                  {formatCurrency(totalIVA)}
                </td>
                <td className="p-3 text-sm font-bold text-cashport-black">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export type { Product };
