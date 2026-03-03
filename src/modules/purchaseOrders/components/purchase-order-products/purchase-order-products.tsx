import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Edit, Save } from "lucide-react";
import { Select } from "antd";
import { PurchaseOrderProductsFormData } from "../../types/forms";
import { purchaseOrderProductsSchema } from "../../schemas/purchaseOrderSchemas";
import {
  IPurchaseOrderSummary,
  IBatchesByPurchaseOrder
} from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { getProductsByClient } from "@/services/commerce/commerce";
import { getBatchesForProducts } from "@/services/purchaseOrders/purchaseOrders";
import { IProduct } from "@/types/commerce/ICommerce";

interface PurchaseOrderProductsProps {
  initialProducts: PurchaseOrderProductsFormData;
  isPdfCollapsed: boolean;
  pdfWidth: number;
  onSave: (data: PurchaseOrderProductsFormData, changedIndices: number[]) => void;
  summary: IPurchaseOrderSummary;
  clientId: string;
  purchaseOrderId: string;
}

export function PurchaseOrderProducts({
  initialProducts,
  isPdfCollapsed,
  pdfWidth,
  onSave,
  summary,
  clientId,
  purchaseOrderId
}: PurchaseOrderProductsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [internalProducts, setInternalProducts] = useState<IProduct[]>([]);
  const [batchesByProduct, setBatchesByProduct] = useState<IBatchesByPurchaseOrder[]>([]);
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
    setValue
  } = useForm<PurchaseOrderProductsFormData>({
    resolver: yupResolver<PurchaseOrderProductsFormData>(purchaseOrderProductsSchema),
    defaultValues: initialProducts,
    mode: "onChange"
  });

  const { fields } = useFieldArray({
    control,
    name: "products"
  });

  // Watch for changes to recalculate totals
  const watchedProducts = watch("products");

  // Check if any product has decimals in quantity_by_box or box_quantity
  const hasDecimals =
    isEditMode &&
    watchedProducts.some((p) => {
      const units = p.quantity_by_box ?? 0;
      const boxes = p.box_quantity ?? 0;
      return !Number.isInteger(units) || !Number.isInteger(boxes);
    });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      if (!projectId || !clientId) return;

      try {
        const response = await getProductsByClient(projectId, clientId);
        if (response.success && response.data) {
          // Flatten products from all categories
          const allProducts = response.data.flatMap((category) => category.products);
          setInternalProducts(allProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [projectId, clientId]);

  // Fetch batches for products
  useEffect(() => {
    const fetchBatches = async () => {
      if (!purchaseOrderId) return;
      try {
        const response = await getBatchesForProducts(purchaseOrderId);
        if (response) {
          setBatchesByProduct(response);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, [purchaseOrderId]);

  // Reset form when initialProducts changes (API refetch)
  useEffect(() => {
    reset(initialProducts);
  }, [initialProducts, reset]);

  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasDecimals) return;
      // Exiting edit mode - save changes
      handleSubmit(onSubmitProducts, (errors) => {
        console.error("Errores de validación:", errors);
      })();
    } else {
      // Entering edit mode
      setIsEditMode(true);
    }
  };

  const onSubmitProducts = (data: PurchaseOrderProductsFormData) => {
    // Identify which products were modified
    const changedIndices = data.products
      .map((_, index) => (dirtyFields.products?.[index] ? index : -1))
      .filter((index) => index !== -1);

    if (changedIndices.length > 0) {
      onSave(data, changedIndices);
    }
    setIsEditMode(false);
  };

  const handleUnitsChange = (index: number, newUnits: number) => {
    const currentUnits = watchedProducts[index]?.quantity_by_box ?? 0;
    const currentBoxes = watchedProducts[index]?.box_quantity ?? 0;
    setValue(`products.${index}.quantity_by_box`, newUnits, { shouldDirty: true });
    if (newUnits === 0 || currentBoxes === 0 || currentUnits === 0) return;
    const ratio = currentUnits / currentBoxes;
    setValue(`products.${index}.box_quantity`, newUnits / ratio, { shouldDirty: true });
  };

  const handleBoxesChange = (index: number, newBoxes: number) => {
    const currentUnits = watchedProducts[index]?.quantity_by_box ?? 0;
    const currentBoxes = watchedProducts[index]?.box_quantity ?? 0;
    setValue(`products.${index}.box_quantity`, newBoxes, { shouldDirty: true });
    if (newBoxes === 0 || currentUnits === 0 || currentBoxes === 0) return;
    const ratio = currentUnits / currentBoxes;
    setValue(`products.${index}.quantity_by_box`, newBoxes * ratio, { shouldDirty: true });
  };

  // Calculate totals - use local calculations in edit mode, API summary otherwise
  const totalUnits = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + producto.quantity, 0)
    : summary.totalQuantity;

  const totalIVA = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + producto.tax_amount * producto.quantity, 0)
    : summary.totalTaxes;

  const totalAmount = isEditMode
    ? watchedProducts.reduce((sum, p) => sum + (p.unit_price + p.tax_amount) * p.quantity, 0)
    : summary.grandTotal;

  return (
    <div
      className="space-y-6 transition-all duration-300 ease-in-out min-w-0"
      style={{
        flex: isPdfCollapsed ? "1" : `0 0 calc(${100 - pdfWidth}% - 1.5rem)`
      }}
    >
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-cashport-black">Detalle de Productos</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
            disabled={isEditMode && hasDecimals}
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar productos
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Editar productos
              </>
            )}
          </Button>
        </div>
        <div className="overflow-x-auto">
          {isEditMode && hasDecimals && (
            <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 text-sm rounded w-fit">
              No se pueden pedir decimales en cajas o unidades
            </div>
          )}
          <table className="w-full">
            <thead className="bg-cashport-gray-lighter border-b border-cashport-gray-light">
              <tr>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Producto cliente
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Producto
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">Lote</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Unidades
                </th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">Cajas</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Cantidad
                </th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Precio unitario
                </th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">IVA</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Precio total
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const baseRowClass = index % 2 === 0 ? "bg-white" : "bg-cashport-gray-lighter/30";

                const rowClass = `border-b border-cashport-gray-light ${baseRowClass}`;

                return (
                  <tr key={field.id} className={rowClass}>
                    <td className="p-3">
                      <span className="text-sm text-cashport-black">
                        {field.po_product_description || "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      <Controller
                        name={`products.${index}.product_id`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Select
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                value={controllerField.value}
                                onChange={controllerField.onChange}
                                placeholder="Seleccionar producto"
                                options={internalProducts.map((p) => ({
                                  value: p.id,
                                  label: p.description
                                }))}
                                className="w-full"
                                style={{ maxWidth: 400 }}
                                optionRender={(option) => (
                                  <span style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                    {option.label}
                                  </span>
                                )}
                                variant="outlined"
                              />
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-sm text-cashport-black">
                                  {field.product_description || "-"}
                                </span>
                                {field.product_sku && (
                                  <span className="text-xs text-blue-600 mt-0.5">
                                    SKU: {field.product_sku}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3">
                      <Controller
                        name={`products.${index}.batch_id`}
                        control={control}
                        render={({ field: controllerField }) => {
                          const productId = watchedProducts[index]?.product_id;
                          const productBatches =
                            batchesByProduct.find((b) => b.product_id === productId)?.batches ?? [];

                          return (
                            <div>
                              {isEditMode ? (
                                <Select
                                  showSearch
                                  allowClear
                                  optionFilterProp="label"
                                  filterOption={(input, option) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  value={controllerField.value}
                                  onChange={controllerField.onChange}
                                  placeholder="Seleccionar lote"
                                  options={productBatches.map((b) => ({
                                    value: b.id,
                                    label: b.batch
                                  }))}
                                  className="w-full"
                                  variant="outlined"
                                />
                              ) : (
                                <span className="text-sm text-cashport-black">
                                  {field.batch || "-"}
                                </span>
                              )}
                            </div>
                          );
                        }}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Controller
                        name={`products.${index}.quantity_by_box`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                step="any"
                                value={controllerField.value ?? ""}
                                onChange={(e) => handleUnitsChange(index, Number(e.target.value))}
                                className="w-20 h-8 text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black fontMonoSpace">
                                {controllerField.value ?? "-"}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Controller
                        name={`products.${index}.box_quantity`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                step="any"
                                value={controllerField.value ?? ""}
                                onChange={(e) => handleBoxesChange(index, Number(e.target.value))}
                                className="w-20 h-8 text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black fontMonoSpace">
                                {controllerField.value ?? "-"}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Controller
                        name={`products.${index}.quantity`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) => controllerField.onChange(Number(e.target.value))}
                                className="w-20 h-8 text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black fontMonoSpace">
                                {controllerField.value}
                              </span>
                            )}
                            {errors.products?.[index]?.quantity && (
                              <span className="text-xs text-red-500 block mt-1">
                                {errors.products[index]?.quantity?.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-cashport-black fontMonoSpace">
                        {formatMoney(watchedProducts[index].unit_price)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm text-cashport-black fontMonoSpace">
                        {formatMoney(watchedProducts[index].tax_amount)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-cashport-black text-right fontMonoSpace">
                      {formatMoney(
                        (watchedProducts[index].unit_price + watchedProducts[index].tax_amount) *
                          watchedProducts[index].quantity
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-cashport-gray-lighter border-t-2 border-cashport-gray-light">
              <tr>
                <td className="p-3 text-sm font-semibold text-cashport-black text-right">Total</td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {totalUnits.toLocaleString()}
                </td>
                <td className="p-3"></td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {formatMoney(totalIVA)}
                </td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {formatMoney(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
