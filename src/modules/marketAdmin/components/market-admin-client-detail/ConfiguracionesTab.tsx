"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import WarehouseSelect from "@/modules/commerce/components/warehouse-select/warehouse-select";
import { PAYMENT_TYPES } from "@/constants/documentTypes";
import {
  IMarketAdminClientConfig,
  IMarketAdminClientUser,
  IUpdateMarketAdminClientConfigBody
} from "@/types/marketAdmin/IMarketAdmin";

export type ConfigForm = {
  // Ajustes datos del cliente
  asigned_user: string;
  coordinator: string;
  kam: string;
  kam_lider: string;
  market: string;
  quota: string;
  payment_discount: string;
  payment_condition_code: string;
  payment_type: string;
  warehouse_id: number | null;
  pricelist_id: string;
  receives_partials: string;
  lots_greater_than: string;
};

type Props = {
  config?: IMarketAdminClientConfig;
  isLoading?: boolean;
  usuarios: IMarketAdminClientUser[];
  isLoadingUsuarios?: boolean;
  onSave: (body: IUpdateMarketAdminClientConfigBody) => Promise<void>;
};

const BLANK_CONFIG: ConfigForm = {
  asigned_user: "",
  coordinator: "",
  kam: "",
  kam_lider: "",
  market: "",
  quota: "",
  payment_discount: "",
  payment_condition_code: "",
  payment_type: "",
  warehouse_id: null,
  pricelist_id: "",
  receives_partials: "",
  lots_greater_than: ""
};

const CLIENT_DATA_KEYS = ["asigned_user", "coordinator", "kam", "kam_lider", "market"] as const;

// Cada select guarda el email del usuario seleccionado.
const USER_SELECTS: { key: (typeof CLIENT_DATA_KEYS)[number]; label: string }[] = [
  { key: "asigned_user", label: "Ejecutivo" },
  { key: "coordinator", label: "Coordinador" },
  { key: "kam", label: "KAM" },
  { key: "kam_lider", label: "KAM líder" }
];

const toForm = (config?: IMarketAdminClientConfig): ConfigForm =>
  config
    ? {
        asigned_user: config.asigned_user ?? "",
        coordinator: config.coordinator ?? "",
        kam: config.kam ?? "",
        kam_lider: config.kam_lider ?? "",
        market: config.market ?? "",
        quota: config.quota?.toString() ?? "",
        payment_discount: config.payment_discount?.toString() ?? "",
        payment_condition_code: config.payment_condition_code ?? "",
        payment_type: config.payment_type?.toString() ?? "",
        warehouse_id: config.warehouse_id,
        pricelist_id: config.pricelist_id?.toString() ?? "",
        receives_partials: config.receives_partials?.toString() ?? "",
        lots_greater_than: config.lots_greater_than?.toString() ?? ""
      }
    : BLANK_CONFIG;

const toNumberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

// Para los campos que deben guardar NULL cuando el valor es vacío o 0.
const toNonZeroNumberOrNull = (value: string) => {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed === 0 ? null : parsed;
};

export default function ConfiguracionesTab({
  config,
  isLoading,
  usuarios,
  isLoadingUsuarios,
  onSave
}: Props) {
  const [form, setForm] = useState<ConfigForm>(toForm(config));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(toForm(config));
  }, [config]);

  const userOptions = useMemo(
    () =>
      usuarios
        .filter((usuario) => usuario.email)
        .map((usuario) => ({
          value: usuario.email,
          label: `${usuario.name} - ${usuario.email}`
        })),
    [usuarios]
  );

  // Solo se envía lo que cambió respecto a la configuración actual.
  const buildBody = (): IUpdateMarketAdminClientConfigBody => {
    const current = toForm(config);
    const body: IUpdateMarketAdminClientConfigBody = {};
    if (form.quota !== current.quota) body.quota = toNumberOrNull(form.quota);
    if (form.payment_discount !== current.payment_discount)
      body.payment_discount = toNumberOrNull(form.payment_discount);
    if (form.payment_condition_code !== current.payment_condition_code)
      body.payment_condition_code = form.payment_condition_code.trim() || null;
    if (form.payment_type !== current.payment_type)
      body.payment_type = toNumberOrNull(form.payment_type);
    if (form.warehouse_id !== current.warehouse_id) body.warehouse_id = form.warehouse_id;
    if (form.pricelist_id !== current.pricelist_id)
      body.pricelist_id = toNumberOrNull(form.pricelist_id);
    if (form.receives_partials !== current.receives_partials)
      body.receives_partials = toNonZeroNumberOrNull(form.receives_partials);
    if (form.lots_greater_than !== current.lots_greater_than)
      body.lots_greater_than = toNonZeroNumberOrNull(form.lots_greater_than);
    // Los datos del cliente se guardan tal cual; vacío se envía como null para limpiarlos.
    CLIENT_DATA_KEYS.forEach((key) => {
      if (form[key] !== current[key]) body[key] = form[key].trim() || null;
    });
    return body;
  };

  const isDirty = Object.keys(buildBody()).length > 0;

  const handleSave = async () => {
    const body = buildBody();
    if (Object.keys(body).length === 0) return;
    try {
      setIsSaving(true);
      await onSave(body);
    } catch {
      // El contenedor ya muestra el mensaje de error.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Ajustes datos del cliente */}
      <p className="text-sm font-bold text-[#141414] mb-4">Ajustes datos del cliente</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-6 gap-y-5">
        {/* Ejecutivo, Coordinador, KAM y KAM líder */}
        {USER_SELECTS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">{label}</label>
            <Select
              showSearch
              allowClear
              size="large"
              placeholder="Seleccione un usuario"
              className="w-full [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD] [&_.ant-select-selector]:!text-sm"
              popupClassName="[&_.ant-select-item]:!text-sm"
              value={form[key] || undefined}
              options={userOptions}
              loading={isLoadingUsuarios}
              disabled={isLoading}
              notFoundContent="Sin usuarios disponibles"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              onChange={(email?: string) => setForm((f) => ({ ...f, [key]: email ?? "" }))}
            />
          </div>
        ))}

        {/* Mercado */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Mercado</label>
          <input
            type="text"
            placeholder="Mercado del cliente"
            maxLength={255}
            disabled={isLoading}
            value={form.market}
            onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
          />
        </div>
      </div>

      {/* Ajustes financieros y operativos */}
      <p className="text-sm font-bold text-[#141414] mt-8 pt-8 border-t border-[#F0F0F0] mb-4">
        Ajustes financieros y operativos del cliente
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-6 gap-y-5">
        {/* Cupo de crédito */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Cupo de crédito</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999999]">
              $
            </span>
            <input
              type="number"
              min={0}
              placeholder="0"
              disabled={isLoading}
              value={form.quota}
              onChange={(e) => setForm((f) => ({ ...f, quota: e.target.value }))}
              className="w-full text-sm border border-[#DDDDDD] rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
            />
          </div>
        </div>

        {/* Descuento pronto pago */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">
            Descuento pronto pago
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              placeholder="0"
              disabled={isLoading}
              value={form.payment_discount}
              onChange={(e) => setForm((f) => ({ ...f, payment_discount: e.target.value }))}
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 pr-7 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999999]">
              %
            </span>
          </div>
        </div>

        {/* Condición de pago */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Condición de pago</label>
          <input
            type="text"
            placeholder="Código de condición de pago"
            disabled={isLoading}
            value={form.payment_condition_code}
            onChange={(e) => setForm((f) => ({ ...f, payment_condition_code: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
          />
        </div>

        {/* Tipo de pago */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Tipo de pago</label>
          <select
            disabled={isLoading}
            value={form.payment_type}
            onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors bg-white"
          >
            <option value="">Seleccione un tipo de pago</option>
            {PAYMENT_TYPES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bodega por defecto */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Bodega por defecto</label>
          <WarehouseSelect
            value={form.warehouse_id ?? undefined}
            onChange={(warehouseId) => setForm((f) => ({ ...f, warehouse_id: warehouseId }))}
            disabled={isLoading}
            size="large"
          />
        </div>

        {/* Lista de precios */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Lista de precios</label>
          <input
            type="number"
            min={0}
            placeholder="ID de la lista de precios"
            disabled={isLoading}
            value={form.pricelist_id}
            onChange={(e) => setForm((f) => ({ ...f, pricelist_id: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
          />
        </div>

        {/* Recibe parciales de lotes */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">
            Recibe parciales de lotes
          </label>
          <input
            type="number"
            min={0}
            disabled={isLoading}
            value={form.receives_partials}
            onChange={(e) => setForm((f) => ({ ...f, receives_partials: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
          />
        </div>

        {/* Lotes mayores a */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">Lotes mayores a</label>
          <input
            type="number"
            min={0}
            disabled={isLoading}
            value={form.lots_greater_than}
            onChange={(e) => setForm((f) => ({ ...f, lots_greater_than: e.target.value }))}
            className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
          />
        </div>

        {/* Save button */}
        <div className="col-span-full flex justify-end pt-2">
          <PrincipalButton
            onClick={handleSave}
            disabled={!isDirty || isSaving || isLoading}
            loading={isSaving}
          >
            Guardar cambios
          </PrincipalButton>
        </div>
      </div>
    </div>
  );
}
