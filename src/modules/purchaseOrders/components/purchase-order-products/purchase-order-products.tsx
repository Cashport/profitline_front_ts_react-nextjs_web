import React, { useState, useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import "./purchase-order-products.scss";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Edit, Check } from "lucide-react";
import { Trash, Plus } from "@phosphor-icons/react";
import { Select, Popover, message } from "antd";
import { Eye } from "lucide-react";
import {
  PurchaseOrderProductsFormData,
  mapApiProductsToForm,
  mapFormProductsToApi,
  getEmptyProductsFormData
} from "../../types/forms";
import { purchaseOrderProductsSchema } from "../../schemas/purchaseOrderSchemas";
import {
  IPurchaseOrderDetail,
  IBatchesByPurchaseOrder
} from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { getProductsByClient } from "@/services/commerce/commerce";
import {
  getBatchesByProduct,
  editPurchaseOrderProducts
} from "@/services/purchaseOrders/purchaseOrders";
import { IProduct } from "@/types/commerce/ICommerce";
import { monthsUntilExpiration, formatDateDMY, formatNumber } from "@/utils/utils";

interface PurchaseOrderProductsProps {
  isCreating?: boolean;
  data?: IPurchaseOrderDetail;
  orderId?: string;
  mutate?: () => void;
  isPdfCollapsed: boolean;
  pdfWidth: number;
  canEdit?: boolean;
  clientId?: string;
  initialProductsData?: PurchaseOrderProductsFormData;
  onProductsChange?: (products: PurchaseOrderProductsFormData) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  saveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function PurchaseOrderProducts({
  isCreating,
  data,
  orderId,
  mutate,
  isPdfCollapsed,
  pdfWidth,
  canEdit,
  clientId: clientIdProp,
  initialProductsData,
  onProductsChange,
  onDirtyChange,
  saveRef
}: PurchaseOrderProductsProps) {
  const initialProducts = useMemo(() => {
    if (isCreating || !data?.products) return initialProductsData ?? getEmptyProductsFormData();
    return mapApiProductsToForm(data.products);
  }, [data?.products, isCreating, initialProductsData]);
  const summary = data?.summary ?? { totalQuantity: 0, subtotal: 0, totalTaxes: 0, grandTotal: 0 };
  const clientId = clientIdProp ?? data?.client_nit;
  const [isEditMode, setIsEditMode] = useState(isCreating ?? false);
  const [internalProducts, setInternalProducts] = useState<IProduct[]>([]);
  const [batchesByProduct, setBatchesByProduct] = useState<IBatchesByPurchaseOrder[]>([]);

  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, isValid },
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

  const fetchBatchesForProduct = async (productId: number) => {
    if (!orderId) return;
    try {
      const response = await getBatchesByProduct(orderId, String(productId));
      if (response) {
        setBatchesByProduct((prev) => {
          const filtered = prev.filter((b) => b.product_id !== productId);
          return [...filtered, ...response];
        });
      }
    } catch (error) {
      console.error("Error fetching batches for product:", error);
    }
  };

  const getStockForBatch = (productId: number | undefined, batchId: number | null | undefined) => {
    if (!productId || !batchId) return undefined;
    const productEntry = batchesByProduct.find((b) => b.product_id === productId);
    if (!productEntry) return undefined;
    const batch = productEntry.batches.find((b) => b.id === batchId);
    return batch?.stock_available ?? undefined;
  };

  const isStockExceeded = (index: number) => {
    const product = watchedProducts[index];
    const stockAvailable = getStockForBatch(product?.product_id, product?.batch_id);
    if (stockAvailable == null) return false;
    const totalUnitsRequested = product.box_quantity ?? 0;
    return totalUnitsRequested > stockAvailable;
  };

  const hasStockExceeded = isEditMode && watchedProducts.some((_, index) => isStockExceeded(index));

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

  // Sync quantity_by_box from internalProducts when they load
  useEffect(() => {
    if (internalProducts.length === 0) return;
    watchedProducts.forEach((product, index) => {
      if (!product.product_id) return;
      const found = internalProducts.find((p) => p.id === product.product_id);
      if (found?.product_units != null) {
        setValue(`products.${index}.quantity_by_box`, found.product_units);
      }
    });
  }, [internalProducts]);

  // Fetch batches for each product on initial load
  useEffect(() => {
    if (!orderId) return;
    const productIds = watchedProducts
      .map((p) => p.product_id)
      .filter((id): id is number => id != null);

    productIds.forEach((productId) => {
      fetchBatchesForProduct(productId);
    });
  }, [orderId, data?.products]);

  // Notify parent about dirty state changes
  const productsIsDirty = isEditMode && Object.keys(dirtyFields).length > 0;
  useEffect(() => {
    onDirtyChange?.(productsIsDirty);
  }, [productsIsDirty, onDirtyChange]);

  // Reset form when initialProducts changes (API refetch)
  useEffect(() => {
    reset(initialProducts);
  }, [initialProducts, reset]);

  // Bubble up product changes in create mode
  useEffect(() => {
    if (isCreating && onProductsChange) {
      onProductsChange({ products: watchedProducts });
    }
  }, [isCreating, watchedProducts, onProductsChange]);

  const handleEditToggle = () => {
    if (isEditMode) {
      if (hasDecimals || hasStockExceeded) return;
      const isDirty = Object.keys(dirtyFields).length > 0;
      if (!isDirty) {
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
    if (isCreating) return;
    try {
      const payload = mapFormProductsToApi(formData);
      const productsToSend = payload.products.map((p) => ({
        ...p,
        marketplace_order_product_id:
          p.marketplace_order_product_id && p.marketplace_order_product_id !== 0
            ? Number(p.marketplace_order_product_id)
            : undefined,
        quantity: p.box_quantity ?? 0
      }));
      await editPurchaseOrderProducts(orderId!, productsToSend);
      mutate?.();
      message.success("Productos actualizados correctamente");
      setIsEditMode(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar los productos");
      throw error;
    }
    setIsEditMode(false);
  };

  // Expose save function to parent via ref
  const internalSubmitRef = useRef<(() => Promise<void>) | null>(null);
  internalSubmitRef.current = handleSubmit(onSubmitProducts);
  useEffect(() => {
    if (saveRef) saveRef.current = () => internalSubmitRef.current!();
    return () => {
      if (saveRef) saveRef.current = null;
    };
  }, [saveRef]);

  const handleBoxesChange = (index: number, newBoxes: number) => {
    setValue(`products.${index}.box_quantity`, newBoxes, {
      shouldDirty: true,
      shouldValidate: true
    });
    const productId = watchedProducts[index]?.product_id;
    const selectedProduct = internalProducts.find((p) => p.id === productId);
    const quantityByBox =
      selectedProduct?.product_units ?? watchedProducts[index]?.quantity_by_box ?? 0;
    setValue(`products.${index}.quantity_by_box`, quantityByBox, { shouldDirty: true });
    setValue(`products.${index}.quantity`, newBoxes * quantityByBox, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  // Calculate totals - use local calculations in edit mode, API summary otherwise
  const totalBoxes = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + (producto.box_quantity ?? 0), 0)
    : summary.totalQuantity;

  const totalUnits = isEditMode
    ? watchedProducts.reduce(
        (sum, producto) => sum + (producto.quantity_by_box ?? 0) * (producto.box_quantity ?? 0),
        0
      )
    : fields.reduce((sum, field) => sum + field.quantity * (field.quantity_by_box || 1), 0);

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

  const canEditProductsRows =
    isCreating || (isEditMode && allowEditStatuses.includes(data?.status_name ?? ""));

  return (
    <div
      className="space-y-6 transition-all duration-300 ease-in-out min-w-0"
      style={{
        flex: isPdfCollapsed ? "1" : `0 0 calc(${100 - pdfWidth}% - 1.5rem)`
      }}
    >
      <div className="flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <span className="flex justify-start items-end gap-2">
            <h3 className="text-lg font-semibold text-cashport-black leading-tight">
              Detalle de Productos
            </h3>
            {data?.warehouseName && (
              <p className="text-sm font-medium text-cashport-gray">
                {" "}
                Almacén: {data.warehouseName}
              </p>
            )}
          </span>
          {!isCreating && canEdit && (
            <div className="flex items-center gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => {
                    reset(initialProducts);
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
                disabled={isEditMode && (hasDecimals || hasStockExceeded || !isValid)}
              >
                {isEditMode ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar productos
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
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
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">Cajas</th>
                <th className="text-right p-3 font-semibold text-cashport-black text-xs">Stock</th>
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
                                    setValue(
                                      `products.${index}.quantity`,
                                      selectedProduct.product_units *
                                        (watchedProducts[index]?.box_quantity ?? 0),
                                      { shouldDirty: true, shouldValidate: true }
                                    );
                                  }
                                  setValue(`products.${index}.batch_id`, null, {
                                    shouldDirty: true
                                  });
                                  if (selectedProduct) {
                                    setValue(
                                      `products.${index}.unit_price`,
                                      selectedProduct.price ?? 0,
                                      { shouldDirty: true }
                                    );
                                  }
                                  if (value) {
                                    fetchBatchesForProduct(value);
                                  }
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
                        render={({ field: controllerField, fieldState: { error } }) => {
                          const productId = watchedProducts[index]?.product_id;
                          const productBatches =
                            batchesByProduct.find((b) => b.product_id === productId)?.batches ?? [];
                          const usedBatchIds = watchedProducts
                            .filter(
                              (p, i) =>
                                i !== index && p.product_id === productId && p.batch_id != null
                            )
                            .map((p) => p.batch_id);
                          return (
                            <div>
                              {isEditMode ? (
                                <Select
                                  showSearch
                                  allowClear
                                  disabled={isCreating}
                                  optionFilterProp="label"
                                  filterOption={(input, option) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  value={controllerField.value ?? null}
                                  onChange={controllerField.onChange}
                                  placeholder="Seleccionar lote"
                                  status={error ? "error" : undefined}
                                  popupClassName="batch-select-dropdown"
                                  popupMatchSelectWidth={205}
                                  options={productBatches.map((b) => ({
                                    value: b.id,
                                    label: b.batch_expiration_date
                                      ? `${b.batch} - ${formatDateDMY(b.batch_expiration_date)} - ${monthsUntilExpiration(b.batch_expiration_date)} meses`
                                      : b.batch,
                                    disabled: usedBatchIds.includes(b.id),
                                    batch: b.batch,
                                    batch_expiration_date: b.batch_expiration_date,
                                    stock_available: b.stock_available
                                  }))}
                                  optionRender={(option) => (
                                    <div className="flex flex-col py-0.5">
                                      <span className="font-semibold">{option.data.batch}</span>
                                      {option.data.batch_expiration_date && (
                                        <span className="text-xs text-gray-500">
                                          Vence:{" "}
                                          {dayjs(option.data.batch_expiration_date)
                                            .utc()
                                            .format("DD/MM/YY")}
                                          {"  |  "}
                                          {option.data.stock_available ?? 0} uds
                                        </span>
                                      )}
                                    </div>
                                  )}
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
                      <span
                        className={`text-sm ${isStockExceeded(index) ? "text-red-500" : "text-cashport-black"} fontMonoSpace`}
                      >
                        {isEditMode
                          ? formatNumber(
                              (watchedProducts[index]?.quantity_by_box ?? 0) *
                                (watchedProducts[index]?.box_quantity ?? 0)
                            )
                          : formatNumber(field.quantity * (field.quantity_by_box || 1))}
                      </span>
                    </td>
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
                                  min={0}
                                  value={controllerField.value ?? ""}
                                  onChange={(e) =>
                                    handleBoxesChange(index, Math.max(0, Number(e.target.value)))
                                  }
                                  className={`w-14 h-8 text-sm text-right pr-0 ${isStockExceeded(index) ? "border-red-500 text-red-500" : ""}`}
                                />
                              ) : (
                                <span
                                  className={`text-sm fontMonoSpace ${isStockExceeded(index) ? "text-red-500" : "text-cashport-black"}`}
                                >
                                  {controllerField.value ?? "-"}
                                </span>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`text-sm fontMonoSpace ${isStockExceeded(index) ? "text-red-500 font-semibold" : "text-cashport-black"}`}
                      >
                        {(() => {
                          const stock = getStockForBatch(
                            watchedProducts[index]?.product_id,
                            watchedProducts[index]?.batch_id
                          );
                          return stock != null ? formatNumber(stock) : "-";
                        })()}
                      </span>
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
                        {fields.length > 1 && canEditProductsRows && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash size={16} className="text-gray-500" />
                          </button>
                        )}
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
                  {formatNumber(totalUnits)}
                </td>
                <td className="p-3 text-sm font-bold text-cashport-black text-right fontMonoSpace">
                  {formatNumber(totalBoxes)}
                </td>
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
        {canEditProductsRows && (
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
            className="mt-2 self-end flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus size={14} />
            Agregar producto
          </button>
        )}
      </div>
    </div>
  );
}
