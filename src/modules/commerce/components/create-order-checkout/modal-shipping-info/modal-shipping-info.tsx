"use client";

import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { Gift, X } from "lucide-react";

import { DiscountItem, ICommerceAdresses } from "@/types/commerce/ICommerce";

import { NEW_ADDRESS_OPTION } from "@/modules/commerce/utils/constants/checkout";
import { IShippingInfo } from "../../create-order-checkout/create-order-checkout";
import { BonusRow } from "../order-shipment-confirm/order-shipment-confirm";

interface ModalShippingInfoProps {
  mode: "new" | string;
  draft: Omit<IShippingInfo, "id">;
  setDraft: Dispatch<SetStateAction<Omit<IShippingInfo, "id">>>;
  onSave: () => void;
  onClose: () => void;
  discountItems: DiscountItem[];
  cantidadesAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  bonusItems: BonusRow[];
  otherBonusItems: BonusRow[];
  bonusAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  otherBonusAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  addresses: ICommerceAdresses[];
  callingCodeOptions: { value: number; label: string; className: string }[];
  isLoadingOptions: boolean;
}

export default function ModalShippingInfo({
  mode,
  draft,
  setDraft,
  onSave,
  onClose,
  discountItems,
  cantidadesAsignadasExcluyendo,
  bonusItems,
  otherBonusItems,
  bonusAsignadasExcluyendo,
  otherBonusAsignadasExcluyendo,
  addresses,
  callingCodeOptions,
  isLoadingOptions
}: ModalShippingInfoProps) {
  const hasBonus = bonusItems.length + otherBonusItems.length > 0;
  const isNewAddress = draft.addressSelectValue === NEW_ADDRESS_OPTION.value;
  const isSaveDisabled =
    !draft.addressSelectValue.trim() ||
    !draft.city.trim() ||
    !draft.dispatch_address.trim() ||
    !draft.email.trim() ||
    !draft.telefono.trim();

  const addressOptions = useMemo(
    () => [
      NEW_ADDRESS_OPTION,
      ...addresses.map((a) => ({ value: String(a.id), label: a.address }))
    ],
    [addresses]
  );

  useEffect(() => {
    if (draft.addressSelectValue === "") return;
    if (draft.addressSelectValue === NEW_ADDRESS_OPTION.value) {
      if (draft.addressId !== undefined || draft.city || draft.dispatch_address) {
        setDraft((d) => ({
          ...d,
          addressId: undefined,
          city: "",
          dispatch_address: ""
        }));
      }
      return;
    }
    const sel = addresses.find((a) => String(a.id) === draft.addressSelectValue);
    if (sel) {
      const same =
        draft.addressId === sel.id &&
        draft.city === sel.city &&
        draft.dispatch_address === sel.address;
      if (!same) {
        setDraft((d) => ({
          ...d,
          addressId: sel.id,
          city: sel.city,
          dispatch_address: sel.address,
          email: d.email || sel.email
        }));
      }
    }
  }, [draft.addressSelectValue, addresses]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-[#DDDDDD] w-[480px] max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEE]">
          <h3 className="text-sm font-bold text-[#141414]">
            {mode === "new" ? "Nuevo destino" : "Editar destino"}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999999] hover:bg-[#F7F7F7] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">Dirección de entrega</label>
            <select
              value={draft.addressSelectValue}
              onChange={(e) => setDraft((d) => ({ ...d, addressSelectValue: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
            >
              <option value="" disabled>
                Seleccione una dirección
              </option>
              {addressOptions.map((o) => (
                <option key={String(o.value)} value={String(o.value)}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">Ciudad</label>
            <input
              type="text"
              placeholder="Bogotá"
              value={draft.city}
              disabled={!isNewAddress}
              onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">
              Dirección de despacho
            </label>
            <input
              type="text"
              placeholder="Cl. 76 9-88"
              value={draft.dispatch_address}
              readOnly={!isNewAddress}
              onChange={(e) => setDraft((d) => ({ ...d, dispatch_address: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] read-only:opacity-60 read-only:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">Teléfono de contacto</label>
            <div className="flex gap-2">
              <select
                value={draft.indicativo}
                disabled={isLoadingOptions}
                onChange={(e) => setDraft((d) => ({ ...d, indicativo: e.target.value }))}
                className="w-20 px-2 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] text-center"
              >
                {callingCodeOptions.length === 0 && <option value="+57">+57</option>}
                {callingCodeOptions.map((o) => {
                  const code = o.label.split(" ")[0];
                  return (
                    <option key={o.value} value={code}>
                      {code}
                    </option>
                  );
                })}
              </select>
              <input
                type="tel"
                placeholder="3001234567"
                value={draft.telefono}
                onChange={(e) => setDraft((d) => ({ ...d, telefono: e.target.value }))}
                className="flex-1 px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">Observaciones</label>
            <textarea
              placeholder="Instrucciones especiales para esta entrega"
              maxLength={128}
              value={draft.observaciones}
              onChange={(e) => setDraft((d) => ({ ...d, observaciones: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[#666666]">
              Unidades por producto
            </label>
            <div className="border border-[#EEEEEE] rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_56px_72px] px-3 py-2 bg-[#F7F7F7] border-b border-[#EEEEEE]">
                <span className="text-[10px] text-[#999999] font-semibold">Producto</span>
                <span className="text-[10px] text-[#999999] font-semibold text-center">Disp.</span>
                <span className="text-[10px] text-[#999999] font-semibold text-center">Cant.</span>
              </div>
              {discountItems.map((item, iIdx) => {
                const asignado = draft.cantidades[item.product_sku] ?? 0;
                const asignadoOtros = cantidadesAsignadasExcluyendo(
                  item.product_sku,
                  mode === "new" ? null : mode
                );
                const disponible = item.quantity - asignadoOtros;
                const puedeAsignar = disponible;
                const isLastRow = iIdx === discountItems.length - 1 && !hasBonus;
                return (
                  <div
                    key={item.product_sku}
                    className={`grid grid-cols-[1fr_56px_72px] items-center px-3 py-2.5 ${!isLastRow ? "border-b border-[#EEEEEE]" : ""}`}
                  >
                    <p className="text-xs text-[#141414] leading-tight pr-2">{item.description}</p>
                    <p
                      className={`text-xs font-semibold text-center ${puedeAsignar === 0 ? "text-red-400" : "text-[#666666]"}`}
                    >
                      {puedeAsignar}
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={puedeAsignar}
                      value={asignado === 0 ? "" : asignado}
                      placeholder="0"
                      onChange={(e) => {
                        const v = Math.min(
                          Math.max(parseInt(e.target.value) || 0, 0),
                          puedeAsignar
                        );
                        setDraft((d) => ({
                          ...d,
                          cantidades: { ...d.cantidades, [item.product_sku]: v }
                        }));
                      }}
                      className="w-full text-center text-sm font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                    />
                  </div>
                );
              })}
              {hasBonus && (
                <>
                  <div className="grid grid-cols-[1fr_56px_72px] px-3 py-2 bg-[#F7FDE8] border-y border-[#F0F9D8] items-center">
                    <span className="text-[10px] text-[#6AB000] font-semibold uppercase tracking-wide flex items-center gap-1.5">
                      <Gift size={10} />
                      Bonificados
                    </span>
                    <span />
                    <span />
                  </div>
                  {bonusItems.map((item, iIdx) => {
                    const asignado = draft.bonusCantidades[item.product_sku] ?? 0;
                    const asignadoOtros = bonusAsignadasExcluyendo(
                      item.product_sku,
                      mode === "new" ? null : mode
                    );
                    const puedeAsignar = item.quantity - asignadoOtros;
                    const isLastBonus =
                      iIdx === bonusItems.length - 1 && otherBonusItems.length === 0;
                    return (
                      <div
                        key={`promo-${item.product_sku}`}
                        className={`grid grid-cols-[1fr_56px_72px] items-center px-3 py-2.5 bg-[#FDFFF5] ${!isLastBonus ? "border-b border-[#F0F9D8]" : ""}`}
                      >
                        <p className="text-xs text-[#141414] leading-tight pr-2">
                          {item.description}
                        </p>
                        <p
                          className={`text-xs font-semibold text-center ${puedeAsignar === 0 ? "text-red-400" : "text-[#666666]"}`}
                        >
                          {puedeAsignar}
                        </p>
                        <input
                          type="number"
                          min={0}
                          max={puedeAsignar}
                          value={asignado === 0 ? "" : asignado}
                          placeholder="0"
                          onChange={(e) => {
                            const v = Math.min(
                              Math.max(parseInt(e.target.value) || 0, 0),
                              puedeAsignar
                            );
                            setDraft((d) => ({
                              ...d,
                              bonusCantidades: { ...d.bonusCantidades, [item.product_sku]: v }
                            }));
                          }}
                          className="w-full text-center text-sm font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                        />
                      </div>
                    );
                  })}
                  {otherBonusItems.map((item, iIdx) => {
                    const asignado = draft.otherBonusCantidades[item.product_sku] ?? 0;
                    const asignadoOtros = otherBonusAsignadasExcluyendo(
                      item.product_sku,
                      mode === "new" ? null : mode
                    );
                    const puedeAsignar = item.quantity - asignadoOtros;
                    const isLastOther = iIdx === otherBonusItems.length - 1;
                    return (
                      <div
                        key={`other-${item.product_sku}`}
                        className={`grid grid-cols-[1fr_56px_72px] items-center px-3 py-2.5 bg-[#FDFFF5] ${!isLastOther ? "border-b border-[#F0F9D8]" : ""}`}
                      >
                        <p className="text-xs text-[#141414] leading-tight pr-2">
                          {item.description}
                        </p>
                        <p
                          className={`text-xs font-semibold text-center ${puedeAsignar === 0 ? "text-red-400" : "text-[#666666]"}`}
                        >
                          {puedeAsignar}
                        </p>
                        <input
                          type="number"
                          min={0}
                          max={puedeAsignar}
                          value={asignado === 0 ? "" : asignado}
                          placeholder="0"
                          onChange={(e) => {
                            const v = Math.min(
                              Math.max(parseInt(e.target.value) || 0, 0),
                              puedeAsignar
                            );
                            setDraft((d) => ({
                              ...d,
                              otherBonusCantidades: {
                                ...d.otherBonusCantidades,
                                [item.product_sku]: v
                              }
                            }));
                          }}
                          className="w-full text-center text-sm font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-[#EEEEEE]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!isSaveDisabled) {
                onSave();
              }
            }}
            disabled={isSaveDisabled}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              isSaveDisabled
                ? "bg-[#E8EEB7] text-[#7D8258] cursor-not-allowed"
                : "text-[#141414] bg-[#CBE71E] hover:bg-[#b8d11a]"
            }`}
          >
            {mode === "new" ? "Agregar destino" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
