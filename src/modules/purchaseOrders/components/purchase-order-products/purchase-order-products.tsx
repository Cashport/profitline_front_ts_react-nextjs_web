import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Button } from "@/modules/chat/ui/button";
import { Edit, Save } from "lucide-react";
import {
  PurchaseOrderProductsFormData,
  ProductFormData,
} from "../../types/forms";
import { purchaseOrderProductsSchema } from "../../schemas/purchaseOrderSchemas";

interface PurchaseOrderProductsProps {
  initialProducts: PurchaseOrderProductsFormData;
  isPdfCollapsed: boolean;
  pdfWidth: number;
  formatCurrency: (amount: number) => string;
  onSave: (
    data: PurchaseOrderProductsFormData,
    changedIndices: number[]
  ) => void;
}

export function PurchaseOrderProducts({
  initialProducts,
  isPdfCollapsed,
  pdfWidth,
  formatCurrency,
  onSave,
}: PurchaseOrderProductsProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch,
    setValue,
  } = useForm<PurchaseOrderProductsFormData>({
    resolver: yupResolver(purchaseOrderProductsSchema),
    defaultValues: initialProducts,
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control,
    name: "products",
  });

  // Watch for changes to recalculate totals
  const watchedProducts = watch("products");

  // Auto-calculate subtotal and total_price when quantity, unit_price, or tax_amount changes
  useEffect(() => {
    watchedProducts.forEach((product, index) => {
      const subtotal = product.quantity * product.unit_price;
      const totalPrice = subtotal + product.tax_amount;

      if (product.subtotal !== subtotal) {
        setValue(`products.${index}.subtotal`, subtotal, {
          shouldDirty: false,
        });
      }
      if (product.total_price !== totalPrice) {
        setValue(`products.${index}.total_price`, totalPrice, {
          shouldDirty: false,
        });
      }
    });
  }, [watchedProducts, setValue]);

  // Reset form when initialProducts changes (API refetch)
  useEffect(() => {
    reset(initialProducts);
  }, [initialProducts, reset]);

  const handleEditToggle = () => {
    if (isEditMode) {
      // Exiting edit mode - save changes
      handleSubmit(onSubmitProducts)();
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

    console.log("Modified products indices:", changedIndices);
    console.log("Modified products data:", {
      changedProducts: changedIndices.map((i) => data.products[i]),
      allProducts: data.products,
    });

    onSave(data, changedIndices);
    setIsEditMode(false);
  };

  // Calculate totals
  const totalUnits = watchedProducts.reduce(
    (sum, producto) => sum + producto.quantity,
    0
  );
  const totalIVA = watchedProducts.reduce(
    (sum, producto) => sum + producto.tax_amount,
    0
  );
  const totalAmount = watchedProducts.reduce(
    (sum, producto) => sum + producto.total_price,
    0
  );

  return (
    <div
      className="space-y-6 transition-all duration-300 ease-in-out min-w-0"
      style={{
        flex: isPdfCollapsed ? "1" : `0 0 calc(${100 - pdfWidth}% - 1.5rem)`,
      }}
    >
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-cashport-black">
            Detalle de Productos
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEditToggle}
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
              {fields.map((field, index) => {
                const baseRowClass =
                  index % 2 === 0 ? "bg-white" : "bg-cashport-gray-lighter/30";

                const rowClass = `border-b border-cashport-gray-light ${baseRowClass}`;

                return (
                  <tr key={field.id} className={rowClass}>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-cashport-black">
                          {field.product_description}
                        </span>
                        <span className="text-xs text-blue-600 mt-0.5">
                          SKU: {field.product_sku}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Controller
                        name={`products.${index}.quantity`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) =>
                                  controllerField.onChange(
                                    Number(e.target.value)
                                  )
                                }
                                className="w-20 h-8 text-sm"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black">
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
                    <td className="p-3">
                      <Controller
                        name={`products.${index}.unit_price`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) =>
                                  controllerField.onChange(
                                    Number(e.target.value)
                                  )
                                }
                                className="w-28 h-8 text-sm"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black">
                                {formatCurrency(controllerField.value)}
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
                    <td className="p-3">
                      <Controller
                        name={`products.${index}.tax_amount`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <div>
                            {isEditMode ? (
                              <Input
                                type="number"
                                {...controllerField}
                                onChange={(e) =>
                                  controllerField.onChange(
                                    Number(e.target.value)
                                  )
                                }
                                className="w-24 h-8 text-sm"
                              />
                            ) : (
                              <span className="text-sm text-cashport-black">
                                {formatCurrency(controllerField.value)}
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
                    <td className="p-3 text-sm text-cashport-black">
                      {formatCurrency(watchedProducts[index].total_price)}
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
