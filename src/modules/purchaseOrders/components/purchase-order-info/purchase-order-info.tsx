import React, { useEffect, forwardRef, useImperativeHandle, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { DatePicker, message, Select as AntSelect } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { formatDateBars } from "@/utils/utils";
import { PurchaseOrderInfoFormData, mapApiToFormData, mapFormDataToApi } from "../../types/forms";
import { purchaseOrderInfoSchema } from "../../schemas/purchaseOrderSchemas";
import { getAdresses } from "@/services/commerce/commerce";
import { ICommerceAdresses } from "@/types/commerce/ICommerce";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { editPurchaseOrder } from "@/services/purchaseOrders/purchaseOrders";

// Ref type for exposing methods to parent
export interface PurchaseOrderInfoRef {
  submitForm: () => void;
}

// Props del componente
interface PurchaseOrderInfoProps {
  isEditMode: boolean;
  data: IPurchaseOrderDetail;
  orderId: string;
  mutate: () => void;
  onCancel: () => void;
}

export const PurchaseOrderInfo = forwardRef<PurchaseOrderInfoRef, PurchaseOrderInfoProps>(
  ({ isEditMode, data, orderId, mutate }, ref) => {
    const initialData = useMemo(() => mapApiToFormData(data), [data]);
    const clientId = data.client_nit;

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
          setAddressesError("Error al cargar las direcciones");
        } finally {
          setAddressesLoading(false);
        }
      };
      fetchAdresses();
    }, [clientId]);

    // Submit handler that will be called by handleSubmit
    const handleSaveInfo = async (formData: PurchaseOrderInfoFormData) => {
      try {
        const payload = mapFormDataToApi(formData);
        await editPurchaseOrder(orderId, payload);
        mutate();
        message.success("Información actualizada correctamente");
      } catch (error) {
        message.error(
          error instanceof Error ? error.message : "Error al actualizar la información"
        );
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
                        placeholder="Seleccionar fecha"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {dayjs.utc(field.value).format("YYYY-MM-DD")}
                      </p>
                    )}
                    {errors.created_at && (
                      <span className="text-xs text-red-500">{errors.created_at.message}</span>
                    )}
                  </>
                )}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                Facturas
              </label>

              <p className="text-sm font-semibold text-cashport-black mt-1">
                {initialData.invoices && initialData.invoices.length > 0
                  ? initialData.invoices.map((inv) => (
                      <a
                        href={inv.invoice_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={inv.invoice_id}
                        className="text-blue-600 underline"
                      >
                        {inv.invoice_id}
                      </a>
                    ))
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-cashport-black mb-4">Información de Entrega</h3>
          <div className="space-y-4">
            <div className="mt-5">
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
                        format="YYYY-MM-DD HH:mm"
                        showTime={{ defaultOpenValue: dayjs("00:00:00", "HH:mm") }}
                        showNow={false}
                        value={field.value ? dayjs.utc(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? dayjs.utc(date).format("YYYY-MM-DD HH:mm") : "")
                        }
                        className="mt-1 h-8 text-sm font-semibold w-full"
                        placeholder="Seleccionar fecha"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value ? dayjs.utc(field.value).format("YYYY-MM-DD HH:mm") : "-"}
                      </p>
                    )}
                    {errors.delivery_date && (
                      <span className="text-xs text-red-500">{errors.delivery_date.message}</span>
                    )}
                  </>
                )}
              />
            </div>
            <div className="!mt-5">
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
                            <AntSelect
                              value={selectField.value || undefined}
                              onChange={(value) => {
                                selectField.onChange(value);
                                const selectedAddress = addresses.find((a) => a.id === value);
                                if (selectedAddress) {
                                  field.onChange(selectedAddress.address);
                                }
                              }}
                              disabled={addressesLoading}
                              showSearch
                              filterOption={(input, option) =>
                                ((option?.label as string) ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              placeholder={
                                addressesLoading
                                  ? "Cargando direcciones..."
                                  : addresses.length === 0
                                    ? "No hay direcciones disponibles"
                                    : "Seleccionar dirección"
                              }
                              options={addresses.map((a) => ({
                                value: a.id,
                                label: a.address
                              }))}
                              className="mt-1 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selection-search-input]:!h-8 [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!text-sm [&_.ant-select-selection-placeholder]:!leading-8"
                              notFoundContent="No hay direcciones disponibles"
                            />
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
            <div className="!mt-5">
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
