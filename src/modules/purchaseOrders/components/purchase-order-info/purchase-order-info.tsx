import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@/modules/chat/ui/input";
import { Textarea } from "@/modules/chat/ui/textarea";
import { DatePicker, Select as AntSelect, Tooltip } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { formatDateBars } from "@/utils/utils";
import { PurchaseOrderInfoFormData, mapApiToFormData, getEmptyFormData } from "../../types/forms";
import { purchaseOrderInfoSchema } from "../../schemas/purchaseOrderSchemas";
import { getAdresses, getClients } from "@/services/commerce/commerce";
import { getPurchaseOrderChannels } from "@/services/purchaseOrders/purchaseOrders";
import { ICommerceAdresses, IEcommerceClient } from "@/types/commerce/ICommerce";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";

export const PURCHASE_ORDER_INFO_FORM_ID = "purchase-order-info-form";

interface PurchaseOrderInfoProps {
  isCreating?: boolean;
  isEditMode: boolean;
  data?: IPurchaseOrderDetail;
  initialFormData?: PurchaseOrderInfoFormData;
  onSubmit: (data: PurchaseOrderInfoFormData) => void;
  onCancel: () => void;
  onClientChange?: (clientId: string) => void;
  onChange?: (data: PurchaseOrderInfoFormData) => void;
}

export function PurchaseOrderInfo({
  isCreating,
  isEditMode,
  data,
  initialFormData,
  onSubmit,
  onCancel,
  onClientChange,
  onChange
}: PurchaseOrderInfoProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const initialData = useMemo(() => {
    if (isCreating || !data) return initialFormData ?? getEmptyFormData();
    return mapApiToFormData(data);
  }, [data, isCreating, initialFormData]);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(data?.client_nit);

  // Channel options
  const [channels, setChannels] = useState<{ value: number; label: string }[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);

  // Client list for create mode
  const [clients, setClients] = useState<IEcommerceClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => {
    const fetchChannels = async () => {
      setChannelsLoading(true);
      try {
        const res = await getPurchaseOrderChannels();
        if (res) {
          setChannels(
            res.map((ch) => ({
              value: ch.id,
              label: ch.name
            }))
          );
        }
      } catch {
        // silent fail
      } finally {
        setChannelsLoading(false);
      }
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!isCreating || !projectId) return;
    const fetchClients = async () => {
      setClientsLoading(true);
      try {
        const res = await getClients(projectId);
        if (res.data) setClients(res.data);
      } catch {
        // silent fail
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, [isCreating, projectId]);

  const clientId = selectedClientId ?? data?.client_nit;

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
    watch
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

  // Continuously report form changes to parent in create mode
  useEffect(() => {
    if (!isCreating || !onChange) return;
    const subscription = watch((values) => {
      onChange(values as PurchaseOrderInfoFormData);
    });
    return () => subscription.unsubscribe();
  }, [isCreating, onChange, watch]);

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

  const onFormSubmit = handleSubmit((formData) => {
    if (Object.keys(dirtyFields).length === 0) {
      onCancel();
      return;
    }
    onSubmit(formData);
  });

  return (
    <form
      id={PURCHASE_ORDER_INFO_FORM_ID}
      onSubmit={onFormSubmit}
      className="grid grid-cols-2 gap-8 mb-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-cashport-black mb-4">Información General</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground tracking-wide">
                ID Interno OC
              </label>
              <p className="text-sm font-semibold text-cashport-black mt-1">{data?.id ?? "xxxx"}</p>
            </div>
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
                      <Input
                        {...field}
                        className="mt-1 h-8 text-sm font-semibold"
                        disabled={!isCreating}
                      />
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
                Canal
              </label>
              <Controller
                name="usage_channel_id"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <AntSelect
                        value={field.value || undefined}
                        onChange={(value) => field.onChange(value)}
                        loading={channelsLoading}
                        placeholder={channelsLoading ? "Cargando canales..." : "Seleccionar canal"}
                        options={channels}
                        className="!mt-1 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!leading-8"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {data?.usage_channel_name ?? "-"}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
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
                    isCreating ? (
                      <AntSelect
                        showSearch
                        filterOption={(input, option) =>
                          ((option?.label as string) ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={field.value || undefined}
                        onChange={(value) => {
                          const selected = clients.find((c) => c.client_name === value);
                          field.onChange(value);
                          if (selected) {
                            setSelectedClientId(selected.client_id);
                            onClientChange?.(selected.client_id);
                          }
                        }}
                        loading={clientsLoading}
                        placeholder={
                          clientsLoading ? "Cargando clientes..." : "Seleccionar cliente"
                        }
                        options={clients.map((c) => ({
                          value: c.client_name,
                          label: c.client_name
                        }))}
                        className="mt-1 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selection-search-input]:!h-8 [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!text-sm [&_.ant-select-selection-placeholder]:!leading-8"
                        notFoundContent="No hay clientes disponibles"
                      />
                    ) : (
                      <Input {...field} className="mt-1 h-8 text-sm font-semibold" disabled />
                    )
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">{field.value}</p>
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
            {isCreating ? (
              <Controller
                name="order_date"
                control={control}
                render={({ field }) => (
                  <>
                    {isEditMode ? (
                      <DatePicker
                        format="YYYY-MM-DD"
                        value={field.value ? dayjs.utc(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? dayjs.utc(date).format("YYYY-MM-DD") : "")
                        }
                        className="mt-1 h-8 text-sm font-semibold w-full"
                        placeholder="Seleccionar fecha"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-cashport-black mt-1">
                        {field.value ? dayjs.utc(field.value).format("YYYY-MM-DD") : "-"}
                      </p>
                    )}
                    {errors.order_date && (
                      <span className="text-xs text-red-500">{errors.order_date.message}</span>
                    )}
                  </>
                )}
              />
            ) : (
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
            )}
          </div>
          {!isCreating && (
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
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-cashport-black mb-4">Información de Entrega</h3>
        <div className="space-y-4">
          <div className="mt-4">
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
                      disabledDate={(current) => current && current < dayjs().startOf("day")}
                      value={field.value ? dayjs.utc(field.value) : null}
                      onChange={(date) =>
                        field.onChange(date ? dayjs.utc(date).format("YYYY-MM-DD HH:mm") : "")
                      }
                      className="!mt-1 h-8 text-sm font-semibold w-full"
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
          <div className="!mt-4">
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
                            className="!mt-1 w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center [&_.ant-select-selection-search-input]:!h-8 [&_.ant-select-selection-item]:!text-sm [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!leading-8 [&_.ant-select-selection-placeholder]:!text-sm [&_.ant-select-selection-placeholder]:!leading-8"
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
                    <span className="text-xs text-red-500">{errors.delivery_address.message}</span>
                  )}
                </>
              )}
            />
          </div>
          <div className="4">
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Observación
            </label>
            <Controller
              name="observations"
              control={control}
              render={({ field }) => (
                <>
                  {isEditMode ? (
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      rows={4}
                      className="mt-1 text-sm font-semibold resize-none overflow-y-auto field-sizing-fixed [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
                    />
                  ) : (
                    <Tooltip
                      title={field.value || "-"}
                      overlayStyle={{
                        maxWidth: 440,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word"
                      }}
                    >
                      <p className="text-sm font-semibold text-cashport-black mt-1 break-words line-clamp-2">
                        {field.value || "-"}
                      </p>
                    </Tooltip>
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
    </form>
  );
}
