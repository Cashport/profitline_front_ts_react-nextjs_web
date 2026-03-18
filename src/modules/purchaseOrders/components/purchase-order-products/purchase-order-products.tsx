import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Edit, Save } from "lucide-react";
import { Trash, Plus, LinkSimpleHorizontal, LinkBreak } from "@phosphor-icons/react";
import { Select, Popover, message } from "antd";
import { Eye } from "lucide-react";
import {
  PurchaseOrderProductsFormData,
  mapApiProductsToForm,
  mapFormProductsToApi
} from "../../types/forms";
import { purchaseOrderProductsSchema } from "../../schemas/purchaseOrderSchemas";
import {
  IPurchaseOrderDetail,
  IBatchesByPurchaseOrder
} from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { getProductsByClient } from "@/services/commerce/commerce";
import {
  getBatchesForProducts,
  editPurchaseOrderProducts
} from "@/services/purchaseOrders/purchaseOrders";
import { IProduct } from "@/types/commerce/ICommerce";
import { monthsUntilExpiration, formatDateDMY } from "@/utils/utils";

interface PurchaseOrderProductsProps {
  data: IPurchaseOrderDetail;
  orderId: string;
  mutate: () => void;
  isPdfCollapsed: boolean;
  pdfWidth: number;
}

export function PurchaseOrderProducts({
  data,
  orderId,
  mutate,
  isPdfCollapsed,
  pdfWidth
}: PurchaseOrderProductsProps) {
  const initialProducts = useMemo(() => mapApiProductsToForm(data.products), [data.products]);
  const summary = data.summary;
  const clientId = data.client_nit;
  const [isEditMode, setIsEditMode] = useState(false);
  const [linkedRows, setLinkedRows] = useState<Record<number, boolean>>({});
  const [hoveredLinkRow, setHoveredLinkRow] = useState<number | null>(null);
  const [internalProducts, setInternalProducts] = useState<IProduct[]>([]);
  const [batchesByProduct, setBatchesByProduct] = useState<IBatchesByPurchaseOrder[]>([]);
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
    reset,
    watch,
    setValue
  } = useForm<PurchaseOrderProductsFormData>({
    resolver: yupResolver<PurchaseOrderProductsFormData>(purchaseOrderProductsSchema),
    defaultValues: initialProducts,
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });

  // Watch for changes to recalculate totals
  const watchedProducts = watch("products");

  // Check if any product has decimals in quantity_by_box or box_quantity
  const hasDecimals =
    isEditMode &&
    watchedProducts.some((p) => {
      const units = p.quantity ?? 0;
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
      if (!orderId) return;
      try {
        const response = await getBatchesForProducts(orderId);
        if (response) {
          setBatchesByProduct(response);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    fetchBatches();
  }, [orderId]);

  // Reset form when initialProducts changes (API refetch)
  useEffect(() => {
    reset(initialProducts);
  }, [initialProducts, reset]);

  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasDecimals) return;
      const isDirty = Object.keys(dirtyFields).length > 0;
      if (!isDirty) {
        setLinkedRows({});
        setIsEditMode(false);
        return;
      }
      handleSubmit(onSubmitProducts, (errors) => {
        console.error("Errores de validación:", errors);
      })();
    } else {
      setIsEditMode(true);
    }
  };

  const onSubmitProducts = async (formData: PurchaseOrderProductsFormData) => {
    try {
      const payload = mapFormProductsToApi(formData);
      const productsToSend = payload.products.map((p) => ({
        ...p,
        marketplace_order_product_id:
          p.marketplace_order_product_id && p.marketplace_order_product_id !== 0
            ? Number(p.marketplace_order_product_id)
            : undefined
      }));
      await editPurchaseOrderProducts(orderId, productsToSend);
      mutate();
      message.success("Productos actualizados correctamente");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar los productos");
    }
    setLinkedRows({});
    setIsEditMode(false);
  };

  const handleUnitsChange = (index: number, newUnits: number) => {
    const currentUnits = watchedProducts[index]?.quantity ?? 0;
    const currentBoxes = watchedProducts[index]?.box_quantity ?? 0;
    setValue(`products.${index}.quantity`, newUnits, { shouldDirty: true });
    if (!isRowLinked(index)) return;
    if (newUnits === 0 || currentBoxes === 0 || currentUnits === 0) return;
    const ratio = currentUnits / currentBoxes;
    setValue(`products.${index}.box_quantity`, newUnits / ratio, { shouldDirty: true });
  };

  const handleBoxesChange = (index: number, newBoxes: number) => {
    const currentUnits = watchedProducts[index]?.quantity ?? 0;
    const currentBoxes = watchedProducts[index]?.box_quantity ?? 0;
    setValue(`products.${index}.box_quantity`, newBoxes, { shouldDirty: true });
    if (!isRowLinked(index)) return;
    if (newBoxes === 0 || currentUnits === 0 || currentBoxes === 0) return;
    const ratio = currentUnits / currentBoxes;
    setValue(`products.${index}.quantity`, newBoxes * ratio, { shouldDirty: true });
  };

  // Calculate totals - use local calculations in edit mode, API summary otherwise
  const totalUnits = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + (producto.quantity ?? 0), 0)
    : summary.totalQuantity;

  const totalIVA = isEditMode
    ? watchedProducts.reduce(
        (sum, producto) => sum + producto.tax_amount * (producto.box_quantity ?? 0),
        0
      )
    : summary.totalTaxes;

  const totalAmount = isEditMode
    ? watchedProducts.reduce(
        (sum, p) => sum + (p.unit_price + p.tax_amount) * (p.box_quantity ?? 0),
        0
      )
    : summary.grandTotal;

  const allowEditStatuses = ["Procesado", "Back order", "Novedad"];

  const canEditProductsRows = isEditMode && allowEditStatuses.includes(data.status_name);

  const isRowLinked = (index: number): boolean => linkedRows[index] ?? true;

  const toggleRowLink = (index: number) => {
    setLinkedRows((prev) => ({
      ...prev,
      [index]: !(prev[index] ?? true)
    }));
  };

  const handleRemoveRow = (index: number) => {
    remove(index);
    setLinkedRows((prev) => {
      const newLinked: Record<number, boolean> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = Number(key);
        if (k < index) newLinked[k] = value;
        else if (k > index) newLinked[k - 1] = value;
      });
      return newLinked;
    });
  };

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
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  reset(initialProducts);
                  setLinkedRows({});
                  setIsEditMode(false);
                }}
              >
                Cancelar
              </Button>
            )}
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
                  Producto
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">Lote</th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Vencimiento lote
                </th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Unidades
                </th>
                {isEditMode && <th className="p-1 w-8"></th>}
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">Cajas</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Precio unitario
                </th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">IVA</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">
                  Precio total
                </th>
                <th className="p-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const baseRowClass = index % 2 === 0 ? "bg-white" : "bg-cashport-gray-lighter/30";

                const rowClass = `border-b border-cashport-gray-light ${baseRowClass}`;

                return (
                  <tr key={field.id} className={rowClass}>
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
                                onChange={(value) => {
                                  controllerField.onChange(value);
                                  const selectedProduct = internalProducts.find(
                                    (p) => p.id === value
                                  );
                                  if (selectedProduct?.product_units) {
                                    setValue(
                                      `products.${index}.quantity_by_box`,
                                      selectedProduct.product_units,
                                      { shouldDirty: true }
                                    );
                                  }
                                  setValue(`products.${index}.batch_id`, null, {
                                    shouldDirty: true
                                  });
                                }}
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
                                  value={controllerField.value ?? null}
                                  onChange={controllerField.onChange}
                                  placeholder="Seleccionar lote"
                                  options={productBatches.map((b) => ({
                                    value: b.id,
                                    label: b.batch_expiration_date
                                      ? `${b.batch} - ${formatDateDMY(b.batch_expiration_date)} - ${monthsUntilExpiration(b.batch_expiration_date)} meses`
                                      : b.batch
                                  }))}
                                  className="w-full"
                                  variant="outlined"
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-sm text-cashport-black">
                                    {field.batch || "-"}
                                  </span>
                                  {field.batch_expiration_date && (
                                    <span className="text-xs text-cashport-gray">
                                      {monthsUntilExpiration(field.batch_expiration_date)} meses
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-cashport-black text-center">
                        {field.batch_expiration_date
                          ? formatDateDMY(field.batch_expiration_date)
                          : "-"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end">
                        <Controller
                          name={`products.${index}.quantity`}
                          control={control}
                          render={({ field: controllerField }) => (
                            <>
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
                            </>
                          )}
                        />
                      </div>
                    </td>
                    {isEditMode && (
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRowLink(index)}
                          onMouseEnter={() => setHoveredLinkRow(index)}
                          onMouseLeave={() => setHoveredLinkRow(null)}
                          className="inline-flex items-center justify-center h-6 w-6 rounded border-none cursor-pointer hover:bg-gray-100 transition-colors"
                          title={isRowLinked(index) ? "Desvincular factor" : "Vincular factor"}
                          style={{ background: "transparent", color: "#9ca3af" }}
                        >
                          {isRowLinked(index) !== (hoveredLinkRow === index) ? (
                            <LinkSimpleHorizontal size={16} />
                          ) : (
                            <LinkBreak size={16} />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end">
                        <Controller
                          name={`products.${index}.box_quantity`}
                          control={control}
                          render={({ field: controllerField }) => (
                            <>
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
                            </>
                          )}
                        />
                      </div>
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
                          (watchedProducts[index].box_quantity ?? 0)
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canEditProductsRows && (
                          <>
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-red-300 bg-white hover:bg-red-50 transition-colors"
                                title="Eliminar producto"
                              >
                                <Trash size={14} className="text-red-500" />
                              </button>
                            )}
                            {index === fields.length - 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  append({
                                    marketplace_order_product_id: 0,
                                    product_sku: "",
                                    product_description: "",
                                    quantity: 0,
                                    unit_price: 0,
                                    tax_amount: 0,
                                    subtotal: 0,
                                    total_price: 0,
                                    product_id: undefined,
                                    batch_id: undefined,
                                    quantity_by_box: undefined,
                                    box_quantity: 0
                                  })
                                }
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-green-300 bg-white hover:bg-green-50 transition-colors"
                                title="Agregar producto"
                              >
                                <Plus size={14} className="text-green-600" />
                              </button>
                            )}
                          </>
                        )}
                        {watchedProducts[index].purchase_order_original ? (
                          <Popover
                            placement="left"
                            arrow={false}
                            overlayInnerStyle={{ padding: 0 }}
                            content={
                              <div className="w-64 bg-white rounded-lg">
                                <div className="bg-gray-100 px-3 py-2.5 flex items-center gap-2 rounded-t-lg">
                                  <Eye className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                  <span className="text-xs font-semibold text-gray-900">
                                    Datos originales del cliente
                                  </span>
                                </div>
                                <div className="text-xs px-3 pb-3">
                                  <div className="flex justify-between gap-3 py-2.5">
                                    <span className="text-gray-500 shrink-0">Producto</span>
                                    <span className="text-right font-medium text-cashport-black break-all">
                                      {
                                        watchedProducts[index].purchase_order_original!
                                          .po_product_description
                                      }
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-3 py-2.5 border-t border-gray-100">
                                    <span className="text-gray-500 shrink-0">Unidades</span>
                                    <span className="font-medium text-cashport-black">
                                      {watchedProducts[index].purchase_order_original!.po_quantity}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-3 py-2.5 border-t border-gray-100">
                                    <span className="text-gray-500 shrink-0">Precio unitario</span>
                                    <span className="font-medium text-cashport-black">
                                      {formatMoney(
                                        watchedProducts[index].purchase_order_original!
                                          .po_unit_price
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between gap-3 py-2.5 border-t border-gray-100">
                                    <span className="text-gray-500 font-semibold shrink-0">
                                      Valor total
                                    </span>
                                    <span className="font-bold text-cashport-black">
                                      {formatMoney(
                                        watchedProducts[index].purchase_order_original!
                                          .po_total_price
                                      )}
                                    </span>
                                  </div>
                                  {watchedProducts[index].purchase_order_original!.novelty && (
                                    <div className="py-2.5 border-t border-gray-100">
                                      <span className="text-gray-500 block mb-1">Observacion</span>
                                      <p className="font-medium text-cashport-black leading-relaxed">
                                        {watchedProducts[index].purchase_order_original!.novelty}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            }
                          >
                            <button
                              className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-gray-400 bg-white hover:bg-gray-50 transition-colors"
                              title="Ver datos originales del PDF"
                            >
                              <span className="text-xs font-bold text-gray-500 leading-none">
                                i
                              </span>
                            </button>
                          </Popover>
                        ) : null}
                      </div>
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
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {totalUnits.toLocaleString()}
                </td>
                {isEditMode && <td className="p-3"></td>}
                <td className="p-3"></td>
                <td className="p-3"></td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {formatMoney(totalIVA)}
                </td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {formatMoney(totalAmount)}
                </td>
                <td className="p-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
