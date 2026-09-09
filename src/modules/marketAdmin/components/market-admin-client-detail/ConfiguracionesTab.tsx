"use client";

import { useEffect, useState } from "react";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import WarehouseSelect from "@/modules/commerce/components/warehouse-select/warehouse-select";
import {
  IMarketAdminClientConfig,
  IUpdateMarketAdminClientConfigBody
} from "@/types/marketAdmin/IMarketAdmin";

export type ConfigForm = {
  quota: string;
  payment_discount: string;
  payment_condition_code: string;
  warehouse_id: number | null;
  pricelist_id: string;
};

type Props = {
  config?: IMarketAdminClientConfig;
  isLoading?: boolean;
  onSave: (body: IUpdateMarketAdminClientConfigBody) => Promise<void>;
};

const BLANK_CONFIG: ConfigForm = {
  quota: "",
  payment_discount: "",
  payment_condition_code: "",
  warehouse_id: null,
  pricelist_id: ""
};

const toForm = (config?: IMarketAdminClientConfig): ConfigForm =>
  config
    ? {
        quota: config.quota?.toString() ?? "",
        payment_discount: config.payment_discount?.toString() ?? "",
        payment_condition_code: config.payment_condition_code ?? "",
        warehouse_id: config.warehouse_id,
        pricelist_id: config.pricelist_id?.toString() ?? ""
      }
    : BLANK_CONFIG;

const toNumberOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

export default function ConfiguracionesTab({ config, isLoading, onSave }: Props) {
  const [form, setForm] = useState<ConfigForm>(toForm(config));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(toForm(config));
  }, [config]);

  // Solo se envía lo que cambió respecto a la configuración actual.
  const buildBody = (): IUpdateMarketAdminClientConfigBody => {
    const current = toForm(config);
    const body: IUpdateMarketAdminClientConfigBody = {};
    if (form.quota !== current.quota) body.quota = toNumberOrNull(form.quota);
    if (form.payment_discount !== current.payment_discount)
      body.payment_discount = toNumberOrNull(form.payment_discount);
    if (form.payment_condition_code !== current.payment_condition_code)
      body.payment_condition_code = form.payment_condition_code.trim() || null;
    if (form.warehouse_id !== current.warehouse_id) body.warehouse_id = form.warehouse_id;
    if (form.pricelist_id !== current.pricelist_id)
      body.pricelist_id = toNumberOrNull(form.pricelist_id);
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
    <div className="max-w-lg">
      <p className="text-sm text-[#999999] mb-6">Ajustes financieros y operativos del cliente.</p>

      <div className="flex flex-col gap-5">
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

        {/* Save button */}
        <div className="flex justify-end pt-2">
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
