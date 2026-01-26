import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { formatDateBars, formatDateDMY } from "@/utils/utils";
import { PurchaseOrderInfoFormData } from "../../types/forms";
import { purchaseOrderInfoSchema } from "../../schemas/purchaseOrderSchemas";

// Ref type for exposing methods to parent
export interface PurchaseOrderInfoRef {
  submitForm: () => void;
}

// Props del componente
interface PurchaseOrderInfoProps {
  isEditMode: boolean;
  initialData: PurchaseOrderInfoFormData;
  onSave: (data: PurchaseOrderInfoFormData, dirtyFields: string[]) => void;
  onCancel: () => void;
}

export const PurchaseOrderInfo = forwardRef<PurchaseOrderInfoRef, PurchaseOrderInfoProps>(
  ({ isEditMode, initialData, onSave }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { errors, dirtyFields },
      reset
    } = useForm<PurchaseOrderInfoFormData>({
      resolver: yupResolver(purchaseOrderInfoSchema),
      defaultValues: initialData,
      mode: "onChange"
    });

    // Reset form when initialData changes (API refetch)
    useEffect(() => {
      reset(initialData);
    }, [initialData, reset]);

    // Submit handler that will be called by handleSubmit
    const handleSaveInfo = (formData: PurchaseOrderInfoFormData) => {
      const changedFields = Object.keys(dirtyFields);
      if (changedFields.length > 0) {
        console.log("handleSaveInfo - changed fields:", changedFields);
        console.log("handleSaveInfo - form data:", formData);
        onSave(formData, changedFields);
      }
    };

    // Expose submitForm method to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        submitForm: () => {
          const changedFields = Object.keys(dirtyFields);
          if (changedFields.length > 0) {
            handleSubmit(handleSaveInfo)();
          }
        }
      }),
      [dirtyFields, handleSubmit]
    );

    return (
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-cashport-black mb-4">Información General</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Orden de compra
              </label>
              <Controller
                name="purchase_order_number"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input {...field} className="mt-1 h-8 text-sm font-semibold" disabled />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value}
                      </p>
                    )}
                    {errors.purchase_order_number && (
                      <span className="text-xs text-red-500">
                        {errors.purchase_order_number.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Cliente
              </label>
              <Controller
                name="client_name"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input {...field} className="mt-1 h-8 text-sm font-semibold" disabled />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value}
                      </p>
                    )}
                    {errors.client_name && (
                      <span className="text-xs text-red-500">{errors.client_name.message}</span>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Fecha orden de compra
              </label>
              <Controller
                name="created_at"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={formatDateBars(field.value)}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1 h-8 text-sm font-semibold"
                        disabled
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {formatDateDMY(field.value)}
                      </p>
                    )}
                    {errors.created_at && (
                      <span className="text-xs text-red-500">{errors.created_at.message}</span>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-cashport-black mb-4">Información de Entrega</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Fecha/Hora entrega
              </label>
              <Controller
                name="delivery_date"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={field.value ? formatDateBars(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="mt-1 h-8 text-sm font-semibold"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value ? formatDateDMY(field.value) : "-"}
                      </p>
                    )}
                    {errors.delivery_date && (
                      <span className="text-xs text-red-500">{errors.delivery_date.message}</span>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Dirección completa
              </label>
              <Controller
                name="delivery_address"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="mt-1 h-8 text-sm font-semibold"
                        placeholder="Dirección completa"
                        disabled
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value || "-"}
                      </p>
                    )}
                    {errors.delivery_address && (
                      <span className="text-xs text-red-500">
                        {errors.delivery_address.message}
                      </span>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Observación
              </label>
              <Controller
                name="observations"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <Input
                        {...field}
                        value={field.value || ""}
                        className="mt-1 h-8 text-sm font-semibold"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value || "-"}
                      </p>
                    )}
                    {errors.observations && (
                      <span className="text-xs text-red-500">{errors.observations.message}</span>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PurchaseOrderInfo.displayName = "PurchaseOrderInfo";
