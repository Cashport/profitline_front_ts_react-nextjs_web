import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Edit, Save } from "lucide-react";
import { ProductCombobox } from "@/modules/purchaseOrders/components/product-combobox/product-combobox";
import { PurchaseOrderProductsFormData } from "../../types/forms";
import { purchaseOrderProductsSchema } from "../../schemas/purchaseOrderSchemas";
import { IPurchaseOrderSummary } from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { getProductsByClient } from "@/services/commerce/commerce";
import { IProduct } from "@/types/commerce/ICommerce";

interface PurchaseOrderProductsProps {
  initialProducts: PurchaseOrderProductsFormData;
  isPdfCollapsed: boolean;
  pdfWidth: number;
  onSave: (data: PurchaseOrderProductsFormData, changedIndices: number[]) => void;
  summary: IPurchaseOrderSummary;
  clientId: string;
}

export function PurchaseOrderProducts({
  initialProducts,
  isPdfCollapsed,
  pdfWidth,
  onSave,
  summary,
  clientId
}: PurchaseOrderProductsProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [internalProducts, setInternalProducts] = useState<IProduct[]>([]);
  const { ID: projectId } = useAppStore((projects) => projects.selectedProject);
  const formatMoney = useAppStore((state) => state.formatMoney);

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch
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

  // Reset form when initialProducts changes (API refetch)
  useEffect(() => {
    reset(initialProducts);
  }, [initialProducts, reset]);

  const handleEditToggle = () => {
    if (isEditMode) {
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

  // Calculate totals - use local calculations in edit mode, API summary otherwise
  const totalUnits = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + producto.quantity, 0)
    : summary.totalQuantity;

  const totalIVA = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + producto.tax_amount * producto.quantity, 0)
    : summary.totalTaxes;

  const totalAmount = isEditMode
    ? watchedProducts.reduce((sum, producto) => sum + producto.total_price, 0)
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
          <Button type="button" variant="outline" size="sm" onClick={handleEditToggle}>
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
          <table className="w-full">
            <thead className="bg-cashport-gray-lighter border-b border-cashport-gray-light">
              <tr>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Producto cliente
                </th>
                <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                  Producto
                </th>
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
                              <ProductCombobox
                                products={internalProducts}
                                value={controllerField.value}
                                onValueChange={controllerField.onChange}
                                placeholder="Seleccionar producto"
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
                      <Controller
                        name={`products.${index}.unit_price`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) => controllerField.onChange(Number(e.target.value))}
                                className="w-28 h-8 text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black fontMonoSpace">
                                {formatMoney(controllerField.value)}
                              </span>
                            )}
                            {errors.products?.[index]?.unit_price && (
                              <span className="text-xs text-red-500 block mt-1">
                                {errors.products[index]?.unit_price?.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <Controller
                        name={`products.${index}.tax_amount`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) => controllerField.onChange(Number(e.target.value))}
                                className="w-24 h-8 text-sm text-right"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black fontMonoSpace">
                                {formatMoney(controllerField.value)}
                              </span>
                            )}
                            {errors.products?.[index]?.tax_amount && (
                              <span className="text-xs text-red-500 block mt-1">
                                {errors.products[index]?.tax_amount?.message}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </td>
                    <td className="p-3 text-sm text-cashport-black text-right fontMonoSpace">
                      {formatMoney(watchedProducts[index].total_price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-cashport-gray-lighter border-t-2 border-cashport-gray-light">
              <tr>
                <td className="p-3 text-sm font-semibold text-cashport-black text-right">Total</td>
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
