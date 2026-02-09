import React, { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { formatDateAndTime, formatDateBars, formatDateDMY } from "@/utils/utils";
import { PurchaseOrderInfoFormData } from "../../types/forms";
import { purchaseOrderInfoSchema } from "../../schemas/purchaseOrderSchemas";
import { getAdresses } from "@/services/commerce/commerce";
import { ICommerceAdresses } from "@/types/commerce/ICommerce";

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
  clientId: string;
}

export const PurchaseOrderInfo = forwardRef<PurchaseOrderInfoRef, PurchaseOrderInfoProps>(
  ({ isEditMode, initialData, onSave, clientId }, ref) => {
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

    // State for managing addresses
    const [addresses, setAddresses] = useState<ICommerceAdresses[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressesError, setAddressesError] = useState<string | null>(null);

    // Reset form when initialData changes (API refetch)
    useEffect(() => {
      reset(initialData);
    }, [initialData, reset]);

    useEffect(() => {
      const fetchAdresses = async () => {
        if (!clientId) return;
        setAddressesLoading(true);
        setAddressesError(null);
        try {
          const res = await getAdresses(clientId);
          setAddresses(res.otherAddresses || []);
        } catch (error) {
          console.error("Error fetching addresses:", error);
          setAddressesError("Error al cargar las direcciones");
        } finally {
          setAddressesLoading(false);
        }
      };
      fetchAdresses();
    }, [clientId]);

    // Submit handler that will be called by handleSubmit
    const handleSaveInfo = (formData: PurchaseOrderInfoFormData) => {
      const changedFields = Object.keys(dirtyFields);
      if (changedFields.length > 0) {
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
                      <DatePicker
                        format="YYYY-MM-DD HH:mm:ss"
                        showTime={{ defaultOpenValue: dayjs("00:00:00", "HH:mm:ss") }}
                        value={field.value ? dayjs.utc(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? date.utc().format("YYYY-MM-DD HH:mm:ss") : "")
                        }
                        className="mt-1 h-8 text-sm font-semibold w-full"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value ? dayjs.utc(field.value).format("YYYY-MM-DD HH:mm:ss") : "-"}
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
                      <>
                        <Controller
                          name="delivery_address_id"
                          control={control}
                          render={({ field: selectField }) => (
                            <Select
                              value={selectField.value?.toString() || ""}
                              onValueChange={(value) => {
                                const selectedId = parseInt(value);
                                selectField.onChange(selectedId);

                                // Update the display address field for consistency
                                const selectedAddress = addresses.find((a) => a.id === selectedId);
                                if (selectedAddress) {
                                  field.onChange(selectedAddress.address);
                                }
                              }}
                              disabled={addressesLoading}
                            >
                              <SelectTrigger className="mt-1 h-8 w-full">
                                <SelectValue
                                  placeholder={
                                    addressesLoading
                                      ? "Cargando direcciones..."
                                      : addresses.length === 0
                                        ? "No hay direcciones disponibles"
                                        : "Seleccionar dirección"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {addresses.length > 0 ? (
                                  addresses.map((address) => (
                                    <SelectItem key={address.id} value={address.id.toString()}>
                                      {address.address}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    No hay direcciones disponibles
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {addressesError && (
                          <span className="text-xs text-red-500 mt-1">{addressesError}</span>
                        )}
                      </>
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
