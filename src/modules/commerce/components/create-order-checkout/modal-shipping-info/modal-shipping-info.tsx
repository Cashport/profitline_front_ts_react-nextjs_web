"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Flex } from "antd";
import { Gift, X } from "lucide-react";

import { DiscountItem, ICommerceAdresses } from "@/types/commerce/ICommerce";

import {
  NEW_ADDRESS_OPTION,
  isValidEmail,
  isValidPhone,
  phoneErrorMessage
} from "@/modules/commerce/utils/constants/checkout";
import { IShippingInfo } from "../../create-order-checkout/create-order-checkout";
import { BonusRow } from "../order-shipment-confirm/order-shipment-confirm";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { GALDERMA_PROJECT_ID } from "@/utils/constants/globalConstants";
import { useAppStore } from "@/lib/store/store";

const MINIMUM_ORDER_AMOUNT = 1_600_000;

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
  const { projectId, formatMoney } = useAppStore((s) => ({
    projectId: s.selectedProject.ID,
    formatMoney: s.formatMoney
  }));

  const hasBonus = bonusItems.length + otherBonusItems.length > 0;
  const isNewAddress = draft.addressSelectValue === NEW_ADDRESS_OPTION.value;
  const isSaveDisabled =
    !draft.addressSelectValue.trim() ||
    !draft.city.trim() ||
    !draft.dispatch_address.trim() ||
    !isValidEmail(draft.email) ||
    !isValidPhone(draft.telefono, draft.indicativo);

  const isEmailInvalid = draft.email.trim() !== "" && !isValidEmail(draft.email);

  const isPhoneInvalid =
    draft.telefono.trim() !== "" && !isValidPhone(draft.telefono, draft.indicativo);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCanulasModal, setShowCanulasModal] = useState(false);
  const [showOnlyCanulasOrAguaModal, setShowOnlyCanulasOrAguaModal] = useState(false);

  const splitTotal = useMemo(() => {
    return discountItems.reduce((sum, item) => {
      const qty = draft.cantidades[item.item_uuid || item.product_sku] ?? 0;
      const unitPrice = item.discount?.primary?.new_price ?? item.price;
      return sum + unitPrice * qty;
    }, 0);
  }, [discountItems, draft.cantidades]);

  const isTotalLessThanMinimum = splitTotal < MINIMUM_ORDER_AMOUNT;

  const splitProductDescriptions = useMemo(() => {
    const descs: string[] = [];
    for (const i of discountItems) {
      if ((draft.cantidades[i.item_uuid || i.product_sku] ?? 0) > 0) descs.push(i.description ?? "");
    }
    for (const b of bonusItems) {
      if ((draft.bonusCantidades[b.product_sku] ?? 0) > 0) descs.push(b.description ?? "");
    }
    for (const b of otherBonusItems) {
      if ((draft.otherBonusCantidades[b.product_sku] ?? 0) > 0) descs.push(b.description ?? "");
    }
    return descs;
  }, [
    discountItems,
    bonusItems,
    otherBonusItems,
    draft.cantidades,
    draft.bonusCantidades,
    draft.otherBonusCantidades
  ]);

  const hasNoCanulasOrAgua = useMemo(() => {
    return !splitProductDescriptions.some((d) => {
      const n = d.toLowerCase();
      return n.includes("canula") || n.includes("agua");
    });
  }, [splitProductDescriptions]);

  const hasOnlyCanulasOrAgua = useMemo(() => {
    if (splitProductDescriptions.length === 0) return false;
    return splitProductDescriptions.every((d) => {
      const n = d.toLowerCase();
      return n.includes("canula") || n.includes("agua");
    });
  }, [splitProductDescriptions]);

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

  const handleSave = () => {
    if (isSaveDisabled) return;

    if (projectId === GALDERMA_PROJECT_ID) {
      if (hasOnlyCanulasOrAgua) {
        setShowOnlyCanulasOrAguaModal(true);
        return;
      }
      if (isTotalLessThanMinimum) {
        setShowConfirmModal(true);
        return;
      }
      if (hasNoCanulasOrAgua) {
        setShowCanulasModal(true);
        return;
      }
    }

    onSave();
  };

  const handleConfirmCanulas = () => {
    setShowCanulasModal(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl border border-[#DDDDDD] w-[820px] max-w-[95vw] flex flex-col shadow-xl overflow-hidden"
        style={{ height: "min(85vh, 660px)" }}
      >
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

        <div className="flex flex-1 min-h-0">
          {/* Left: productos */}
          <div className="flex-1 flex flex-col min-h-0 border-r border-[#EEEEEE]">
            <div className="grid grid-cols-[1fr_48px_64px] px-4 py-2.5 bg-[#FAFAFA] border-b border-[#EEEEEE] flex-shrink-0">
              <span className="text-[10px] text-[#999999] font-semibold">Producto</span>
              <span className="text-[10px] text-[#999999] font-semibold text-center">Disp.</span>
              <span className="text-[10px] text-[#999999] font-semibold text-center">Cant.</span>
            </div>
            <div className="overflow-y-auto flex-1">
              {discountItems.map((item, iIdx) => {
                const asignado = draft.cantidades[item.item_uuid || item.product_sku] ?? 0;
                const asignadoOtros = cantidadesAsignadasExcluyendo(
                  item.item_uuid || item.product_sku,
                  mode === "new" ? null : mode
                );
                const disponible = item.quantity - asignadoOtros;
                const puedeAsignar = disponible;
                const isLastRow = iIdx === discountItems.length - 1 && !hasBonus;
                return (
                  <div
                    key={`${item.product_sku}::${iIdx}`}
                    className={`grid grid-cols-[1fr_48px_64px] items-center px-4 py-3 ${!isLastRow ? "border-b border-[#F4F4F4]" : ""}`}
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
                          cantidades: { ...d.cantidades, [item.item_uuid || item.product_sku]: v }
                        }));
                      }}
                      className="w-full text-center text-xs font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                    />
                  </div>
                );
              })}
              {hasBonus && (
                <>
                  <div className="grid grid-cols-[1fr_48px_64px] px-4 py-2 bg-[#F7FDE8] border-y border-[#F0F9D8] items-center">
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
                        className={`grid grid-cols-[1fr_48px_64px] items-center px-4 py-3 bg-[#FDFFF5] ${!isLastBonus ? "border-b border-[#F0F9D8]" : ""}`}
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
                          className="w-full text-center text-xs font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
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
                        className={`grid grid-cols-[1fr_48px_64px] items-center px-4 py-3 bg-[#FDFFF5] ${!isLastOther ? "border-b border-[#F0F9D8]" : ""}`}
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
                          className="w-full text-center text-xs font-semibold border border-[#DDDDDD] rounded-lg px-2 py-1.5 outline-none focus:border-[#141414] transition-colors bg-white text-[#141414]"
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {splitTotal > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#EEEEEE] bg-[#FAFAFA] flex-shrink-0">
                <span className="text-xs text-[#666666]">
                  Total{" "}
                  <span className="text-[#999999]">
                    ({Object.values(draft.cantidades).reduce((s, v) => s + v, 0)} und.)
                  </span>
                </span>
                <span className="text-sm font-bold text-[#141414]">{formatMoney(splitTotal)}</span>
              </div>
            )}
          </div>

          {/* Right: formulario */}
          <div className="w-[40%] flex-shrink-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">
                Dirección de entrega
              </label>
              <select
                value={draft.addressSelectValue}
                onChange={(e) => setDraft((d) => ({ ...d, addressSelectValue: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
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

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">Ciudad</label>
              <input
                type="text"
                placeholder="Bogotá"
                value={draft.city}
                disabled={!isNewAddress}
                onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">
                Dirección de despacho
              </label>
              <input
                type="text"
                placeholder="Cl. 76 9-88"
                value={draft.dispatch_address}
                readOnly={!isNewAddress}
                onChange={(e) => setDraft((d) => ({ ...d, dispatch_address: e.target.value }))}
                className="w-full px-2.5 py-2 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] read-only:opacity-60 read-only:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                className={`w-full px-2.5 py-2 text-xs bg-[#F7F7F7] border rounded-lg outline-none transition-colors text-[#141414] placeholder:text-[#999999] ${
                  isEmailInvalid
                    ? "border-red-400 focus:border-red-500"
                    : "border-[#DDDDDD] focus:border-[#141414]"
                }`}
              />
              {isEmailInvalid && (
                <p className="text-[10px] text-red-500">Correo electrónico no válido</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">
                Teléfono de contacto
              </label>
              <div className="flex gap-1.5">
                <select
                  value={draft.indicativo}
                  disabled={isLoadingOptions}
                  onChange={(e) => setDraft((d) => ({ ...d, indicativo: e.target.value }))}
                  className="w-16 px-1.5 py-2 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] text-center"
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
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, telefono: e.target.value.replace(/\D/g, "") }))
                  }
                  className={`flex-1 px-2.5 py-2 text-xs bg-[#F7F7F7] border rounded-lg outline-none transition-colors text-[#141414] placeholder:text-[#999999] ${
                    isPhoneInvalid
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#DDDDDD] focus:border-[#141414]"
                  }`}
                />
              </div>
              {isPhoneInvalid && (
                <p className="text-[10px] text-red-500">{phoneErrorMessage(draft.indicativo)}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[#666666]">Observaciones</label>
              <textarea
                placeholder="Instrucciones especiales para esta entrega"
                maxLength={35}
                value={draft.observaciones}
                onChange={(e) => setDraft((d) => ({ ...d, observaciones: e.target.value }))}
                rows={3}
                className="w-full px-2.5 py-2 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
              />
              <p className="text-[10px] text-[#999999]">Máximo 35 caracteres</p>
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
            onClick={handleSave}
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

      <ModalConfirmAction
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="No puedes guardar esta entrega"
        content={
          <Flex vertical gap="0.5rem">
            <p>Cada entrega debe ser mínimo de {formatMoney(MINIMUM_ORDER_AMOUNT)}</p>
            <p>Reasigna cantidades a esta entrega para continuar.</p>
          </Flex>
        }
        cancelText="Entendido"
        hideOkButton
      />

      <ModalConfirmAction
        isOpen={showOnlyCanulasOrAguaModal}
        onClose={() => setShowOnlyCanulasOrAguaModal(false)}
        title="No puedes guardar esta entrega"
        content={
          <Flex vertical gap="0.5rem">
            <p>No se pueden facturar solo cánulas ni aguas</p>
            <p>Agrega otros productos a esta entrega para continuar.</p>
          </Flex>
        }
        cancelText="Entendido"
        hideOkButton
      />

      <ModalConfirmAction
        isOpen={showCanulasModal}
        onClose={() => setShowCanulasModal(false)}
        onOk={handleConfirmCanulas}
        title="¿Está seguro que desea continuar?"
        content={
          <Flex vertical gap="0.5rem">
            <p>No has seleccionado Cánulas y/o Agua estéril en esta entrega</p>
            <p>Te recomendamos revisar la orden</p>
          </Flex>
        }
        okText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}
