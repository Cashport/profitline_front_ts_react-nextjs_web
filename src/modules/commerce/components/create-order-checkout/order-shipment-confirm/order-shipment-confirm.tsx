"use client";

import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Gift, GitBranch, Pencil, Plus, Trash2, X } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import {
  DiscountItem,
  IBonificatedProductsPost,
  ICommerceAdresses,
  IOrderSplitDetail,
  IOrderSplitShippingInfo
} from "@/types/commerce/ICommerce";
import { useContactModalOptions } from "@/hooks/useContactModalOptions";
import { getAdresses as getAdressesAndNumber } from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";
import { formatNumber } from "@/utils/utils";

import ModalShippingInfo from "../modal-shipping-info";
import {
  NEW_ADDRESS_OPTION,
  isValidEmail,
  isValidPhone,
  phoneErrorMessage
} from "@/modules/commerce/utils/constants/checkout";
import { IShippingInfo } from "../../create-order-checkout/create-order-checkout";

export type BonusRow = {
  product_id: number;
  product_sku: string;
  description: string;
  quantity: number;
};

interface OrderShipmentConfirmProps {
  multiEntrega: boolean;
  setMultiEntrega: (v: boolean) => void;
  entregas: IShippingInfo[];
  setEntregas: Dispatch<SetStateAction<IShippingInfo[]>>;
  cantidadesAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  bonusAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  otherBonusAsignadasExcluyendo: (productSku: string, excludeId: string | null) => number;
  onConfirm: () => void;
  onDraft: () => void;
  loadingFinish?: boolean;
  loadingDraft?: boolean;
}

type SingleForm = {
  addressSelectValue: string;
  addressId?: number;
  city: string;
  dispatch_address: string;
  email: string;
  indicativo: string;
  telefono: string;
  observaciones: string;
};

export default function OrderShipmentConfirm({
  multiEntrega,
  setMultiEntrega,
  entregas,
  setEntregas,
  cantidadesAsignadasExcluyendo,
  bonusAsignadasExcluyendo,
  otherBonusAsignadasExcluyendo,
  onConfirm,
  onDraft,
  loadingFinish,
  loadingDraft
}: OrderShipmentConfirmProps) {
  const {
    client,
    confirmOrderData,
    setOrderSplitDetails,
    shippingInfo,
    selectedDiscount,
    bonus,
    channelCode
  } = useContext(OrderViewContext);
  const { callingCodeOptions, isLoading: isLoadingOptions } = useContactModalOptions();
  const draftInfo = useAppStore((state) => state.draftInfo);

  const discountItems: DiscountItem[] = confirmOrderData?.discounts?.discountItems ?? [];

  const bonusItems = useMemo<BonusRow[]>(
    () =>
      (bonus?.bonusOptions ?? []).flatMap((opt) =>
        opt.cards.flatMap((card) =>
          card.items.map((item) => ({
            product_id: item.product_id,
            product_sku: item.sku,
            description: item.description,
            quantity: item.qty
          }))
        )
      ),
    [bonus]
  );

  const otherBonusItems = useMemo<BonusRow[]>(
    () =>
      (bonus?.otherBonificated ?? []).map((item) => ({
        product_id: item.product_id,
        product_sku: item.sku,
        description: item.description,
        quantity: item.qty
      })),
    [bonus]
  );

  const [addresses, setAddresses] = useState<ICommerceAdresses[]>([]);
  const [addressesFetched, setAddressesFetched] = useState(false);

  const [singleForm, setSingleForm] = useState<SingleForm>({
    addressSelectValue: "",
    addressId: undefined,
    city: "",
    dispatch_address: "",
    email: "",
    indicativo: "+57",
    telefono: "",
    observaciones: ""
  });
  const isNewAddressSingle = singleForm.addressSelectValue === NEW_ADDRESS_OPTION.value;
  const didHydrateFromDraftRef = useRef(false);

  const [modalEntrega, setModalEntrega] = useState<null | "new" | string>(null);
  const [modalDraft, setModalDraft] = useState<Omit<IShippingInfo, "id">>({
    addressSelectValue: "",
    addressId: undefined,
    city: "",
    dispatch_address: "",
    email: "",
    indicativo: "+57",
    telefono: "",
    observaciones: "",
    cantidades: {},
    bonusCantidades: {},
    otherBonusCantidades: {}
  });

  // Fetch addresses + saved phone by channel internal_code; fall back to client id
  // for draft/guest flows that never selected a channel.
  useEffect(() => {
    const addressCode = channelCode || client?.id;
    if (!addressCode) return;
    (async () => {
      try {
        const resp = await getAdressesAndNumber(addressCode);
        setAddresses(resp.otherAddresses ?? []);
        if (resp.phone) {
          setSingleForm((f) => ({ ...f, telefono: f.telefono || resp.phone }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAddressesFetched(true);
      }
    })();
  }, [channelCode, client?.id]);

  // Default email from client
  useEffect(() => {
    if (client?.email) {
      setSingleForm((f) => ({ ...f, email: f.email || client.email }));
    }
  }, [client?.email]);

  // Hydrate singleForm from draft's shipping_info (runs once when both
  // shippingInfo and addresses are available, so the <select> already has the
  // matching <option> when we set its value).
  useEffect(() => {
    if (didHydrateFromDraftRef.current) return;
    if (!shippingInfo) return;
    if (!addressesFetched) return;

    const draftAddressId =
      typeof shippingInfo.id === "string" ? Number(shippingInfo.id) : shippingInfo.id;
    const matchedAddress =
      draftAddressId !== undefined ? addresses.find((a) => a.id === draftAddressId) : undefined;

    const phoneRaw = shippingInfo.phone_number || singleForm.telefono || "";
    const phoneMatch = phoneRaw.match(/^(\+\d{1,3})(\d+)$/);
    const indicativo = phoneMatch ? phoneMatch[1] : "+57";
    const telefono = phoneMatch ? phoneMatch[2] : phoneRaw;

    setSingleForm({
      addressSelectValue: matchedAddress ? String(matchedAddress.id) : NEW_ADDRESS_OPTION.value,
      addressId: matchedAddress?.id,
      city: shippingInfo.city ?? "",
      dispatch_address: shippingInfo.dispatch_address ?? "",
      email: shippingInfo.email ?? "",
      indicativo,
      telefono,
      observaciones: shippingInfo.comments ?? ""
    });

    didHydrateFromDraftRef.current = true;
  }, [shippingInfo, addresses, addressesFetched]);

  // Auto-fill city/dispatch_address from selected address (single mode)
  useEffect(() => {
    if (singleForm.addressSelectValue === "") return;
    if (singleForm.addressSelectValue === NEW_ADDRESS_OPTION.value) {
      if (singleForm.addressId !== undefined) {
        setSingleForm((f) => ({
          ...f,
          addressId: undefined,
          city: "",
          dispatch_address: ""
        }));
      }
      return;
    }
    const sel = addresses.find((a) => String(a.id) === singleForm.addressSelectValue);
    if (sel) {
      const same =
        singleForm.addressId === sel.id &&
        singleForm.city === sel.city &&
        singleForm.dispatch_address === sel.address;
      if (!same) {
        setSingleForm((f) => ({
          ...f,
          addressId: sel.id,
          city: sel.city,
          dispatch_address: sel.address,
          email: f.email || sel.email
        }));
      }
    }
  }, [singleForm.addressSelectValue, addresses]);

  const makeBlankEntrega = (): Omit<IShippingInfo, "id"> => ({
    addressSelectValue: "",
    addressId: undefined,
    city: "",
    dispatch_address: "",
    email: client?.email ?? "",
    indicativo: "+57",
    telefono: "",
    observaciones: "",
    cantidades: Object.fromEntries(discountItems.map((i) => [i.item_uuid || i.product_sku, 0])),
    bonusCantidades: Object.fromEntries(bonusItems.map((i) => [i.product_sku, 0])),
    otherBonusCantidades: Object.fromEntries(otherBonusItems.map((i) => [i.product_sku, 0]))
  });

  const openNewModal = () => {
    setModalDraft(makeBlankEntrega());
    setModalEntrega("new");
  };

  const openEditModal = (entrega: IShippingInfo) => {
    setModalDraft({
      addressSelectValue: entrega.addressSelectValue,
      addressId: entrega.addressId,
      city: entrega.city,
      dispatch_address: entrega.dispatch_address,
      email: entrega.email,
      indicativo: entrega.indicativo,
      telefono: entrega.telefono,
      observaciones: entrega.observaciones,
      cantidades: { ...entrega.cantidades },
      bonusCantidades: { ...entrega.bonusCantidades },
      otherBonusCantidades: { ...entrega.otherBonusCantidades }
    });
    setModalEntrega(entrega.id);
  };

  const saveModal = () => {
    if (modalEntrega === "new") {
      const id = `e${Date.now()}`;
      setEntregas((prev) => [...prev, { id, ...modalDraft }]);
    } else if (modalEntrega) {
      setEntregas((prev) => prev.map((e) => (e.id === modalEntrega ? { ...e, ...modalDraft } : e)));
    }
    setModalEntrega(null);
  };

  const removeEntrega = (id: string) =>
    setEntregas((prev) => (prev.length > 1 ? prev.filter((e) => e.id !== id) : prev));

  const splitQty = (totalQty: number, deliveryIdx: number, deliveryCount: number) => {
    if (deliveryCount <= 0) return 0;
    const base = Math.floor(totalQty / deliveryCount);
    const excess = totalQty - base * deliveryCount;
    return base + (deliveryIdx === 0 ? excess : 0);
  };

  const activarMultiEntrega = () => {
    setMultiEntrega(true);
    const e1: IShippingInfo = { id: `e${Date.now()}`, ...makeBlankEntrega() };
    const e2: IShippingInfo = { id: `e${Date.now() + 1}`, ...makeBlankEntrega() };
    if (addresses[0]) {
      e1.addressSelectValue = String(addresses[0].id);
      e1.addressId = addresses[0].id;
      e1.city = addresses[0].city;
      e1.dispatch_address = addresses[0].address;
    }
    if (addresses[1]) {
      e2.addressSelectValue = String(addresses[1].id);
      e2.addressId = addresses[1].id;
      e2.city = addresses[1].city;
      e2.dispatch_address = addresses[1].address;
    }
    bonusItems.forEach((b) => {
      e1.bonusCantidades[b.product_sku] = splitQty(b.quantity, 0, 2);
      e2.bonusCantidades[b.product_sku] = splitQty(b.quantity, 1, 2);
    });
    otherBonusItems.forEach((b) => {
      e1.otherBonusCantidades[b.product_sku] = splitQty(b.quantity, 0, 2);
      e2.otherBonusCantidades[b.product_sku] = splitQty(b.quantity, 1, 2);
    });
    setEntregas([e1, e2]);
  };

  const desactivarMultiEntrega = () => {
    setMultiEntrega(false);
    setEntregas([]);
    setModalEntrega(null);
  };

  const cantidadesAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);
  const bonusAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.bonusCantidades[sku] ?? 0), 0);
  const otherBonusAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.otherBonusCantidades[sku] ?? 0), 0);
  const hayDesbalance =
    discountItems.some((i) => cantidadesAsignadas(i.item_uuid || i.product_sku) !== i.quantity) ||
    bonusItems.some((i) => bonusAsignadas(i.product_sku) !== i.quantity) ||
    otherBonusItems.some((i) => otherBonusAsignadas(i.product_sku) !== i.quantity);

  const isSingleFormValid =
    singleForm.addressSelectValue !== "" &&
    singleForm.city.trim() !== "" &&
    singleForm.dispatch_address.trim() !== "" &&
    isValidEmail(singleForm.email) &&
    isValidPhone(singleForm.telefono, singleForm.indicativo);

  const isSingleEmailInvalid = singleForm.email.trim() !== "" && !isValidEmail(singleForm.email);

  const isSinglePhoneInvalid =
    singleForm.telefono.trim() !== "" && !isValidPhone(singleForm.telefono, singleForm.indicativo);

  // Sync order_split_details on context
  useEffect(() => {
    const buildShipping = (e: {
      addressSelectValue: string;
      addressId?: number;
      city: string;
      dispatch_address: string;
      email: string;
      indicativo: string;
      telefono: string;
      observaciones: string;
    }): IOrderSplitShippingInfo => ({
      // Solo incluir id_address si NO es una nueva dirección
      ...(e.addressSelectValue !== NEW_ADDRESS_OPTION.value && e.addressId !== undefined
        ? { id: e.addressId }
        : {}),
      address: e.dispatch_address,
      city: e.city,
      dispatch_address: e.dispatch_address,
      email: e.email,
      phone_number: `${e.indicativo}${e.telefono}`,
      comments: e.observaciones
    });

    const buildProductsForSplit = (cantidades: Record<string, number>): DiscountItem[] =>
      discountItems
        .map((item) => ({
          ...item,
          quantity: cantidades[item?.item_uuid || item.product_sku] ?? 0
        }))
        .filter((item) => item.quantity > 0);

    const buildBonusForSplit = (
      map: Record<string, number>,
      source: BonusRow[]
    ): IBonificatedProductsPost[] =>
      source
        .map((b) => ({
          product_id: b.product_id,
          quantity: map[b.product_sku] ?? 0,
          product_sku: b.product_sku,
          description: b.description
        }))
        .filter((item) => item.quantity > 0);

    const bonusFull: IBonificatedProductsPost[] = bonusItems.map((b) => ({
      product_id: b.product_id,
      quantity: b.quantity,
      product_sku: b.product_sku,
      description: b.description
    }));
    const otherBonusFull: IBonificatedProductsPost[] = otherBonusItems.map((b) => ({
      product_id: b.product_id,
      quantity: b.quantity,
      product_sku: b.product_sku,
      description: b.description
    }));

    const splits: IOrderSplitDetail[] = multiEntrega
      ? entregas.map((e, idx) => {
          const splitBonus = buildBonusForSplit(e.bonusCantidades, bonusItems);
          const splitOther = buildBonusForSplit(e.otherBonusCantidades, otherBonusItems);
          return {
            index: idx,
            shipping_information: buildShipping(e),
            products: buildProductsForSplit(e.cantidades),
            ...(splitBonus.length > 0 ? { bonificated_products: splitBonus } : {}),
            ...(splitOther.length > 0 ? { other_bonificated_products: splitOther } : {})
          };
        })
      : [
          {
            index: 0,
            shipping_information: buildShipping(singleForm),
            products: discountItems,
            ...(bonusFull.length > 0 ? { bonificated_products: bonusFull } : {}),
            ...(otherBonusFull.length > 0 ? { other_bonificated_products: otherBonusFull } : {})
          }
        ];

    setOrderSplitDetails(splits);
  }, [
    multiEntrega,
    entregas,
    singleForm,
    discountItems,
    bonusItems,
    otherBonusItems,
    setOrderSplitDetails
  ]);

  const totalDescuento = confirmOrderData?.discounts?.totalDiscount ?? 0;
  const descuentoDeOrden = confirmOrderData?.discounts?.totalOrderDiscount ?? 0;
  const descuentoDeProductos = confirmOrderData?.discounts?.totalProductDiscount ?? 0;
  const total = confirmOrderData?.total ?? 0;

  const addressOptions = [
    NEW_ADDRESS_OPTION,
    ...addresses.map((a) => ({ value: String(a.id), label: a.address }))
  ];

  return (
    <div className="flex flex-col w-[420px] flex-shrink-0 bg-[#F7F7F7]">
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDDDDD] flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-[#141414]">
              {multiEntrega ? "Múltiples entregas" : "Datos de envío"}
            </h2>
            <p className="text-xs text-[#999999]">{client?.name}</p>
          </div>
          {!multiEntrega ? (
            <button
              onClick={activarMultiEntrega}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:text-[#141414] transition-colors"
            >
              <GitBranch size={12} />
              Dividir entregas
            </button>
          ) : (
            <button
              onClick={desactivarMultiEntrega}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <X size={12} />
              Un solo envío
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* SINGLE MODE */}
          {!multiEntrega && (
            <div className="px-5 py-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Dirección de entrega</label>
                <select
                  value={singleForm.addressSelectValue}
                  onChange={(e) =>
                    setSingleForm((f) => ({ ...f, addressSelectValue: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] appearance-none"
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
                <label className="text-xs font-semibold text-[#666666]">Ciudad</label>
                <input
                  type="text"
                  placeholder="Bogotá"
                  value={singleForm.city}
                  disabled={!isNewAddressSingle}
                  onChange={(e) => setSingleForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">
                  Dirección de despacho
                </label>
                <input
                  type="text"
                  placeholder="Cl. 76 9-88"
                  value={singleForm.dispatch_address}
                  maxLength={35}
                  readOnly={!isNewAddressSingle}
                  onChange={(e) =>
                    setSingleForm((f) => ({ ...f, dispatch_address: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] read-only:opacity-60 read-only:cursor-not-allowed"
                />
                {isNewAddressSingle && (
                  <p className="text-[10px] text-[#999999]">Máximo 35 caracteres</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={singleForm.email}
                  onChange={(e) => setSingleForm((f) => ({ ...f, email: e.target.value }))}
                  className={`w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border rounded-lg outline-none transition-colors text-[#141414] placeholder:text-[#999999] ${
                    isSingleEmailInvalid
                      ? "border-red-400 focus:border-red-500"
                      : "border-[#DDDDDD] focus:border-[#141414]"
                  }`}
                />
                {isSingleEmailInvalid && (
                  <p className="text-[10px] text-red-500">Correo electrónico no válido</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Teléfono de contacto</label>
                <div className="flex gap-2">
                  <select
                    value={singleForm.indicativo}
                    disabled={isLoadingOptions}
                    onChange={(e) => setSingleForm((f) => ({ ...f, indicativo: e.target.value }))}
                    className="w-20 px-2 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] appearance-none text-center"
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
                    value={singleForm.telefono}
                    onChange={(e) =>
                      setSingleForm((f) => ({ ...f, telefono: e.target.value.replace(/\D/g, "") }))
                    }
                    className={`flex-1 px-3 py-2.5 text-sm bg-[#F7F7F7] border rounded-lg outline-none transition-colors text-[#141414] placeholder:text-[#999999] ${
                      isSinglePhoneInvalid
                        ? "border-red-400 focus:border-red-500"
                        : "border-[#DDDDDD] focus:border-[#141414]"
                    }`}
                  />
                </div>
                {isSinglePhoneInvalid && (
                  <p className="text-[10px] text-red-500">
                    {phoneErrorMessage(singleForm.indicativo)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#666666]">Observaciones</label>
                <textarea
                  placeholder="Ingresar un comentario"
                  maxLength={35}
                  value={singleForm.observaciones}
                  onChange={(e) => setSingleForm((f) => ({ ...f, observaciones: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
                />
                <p className="text-[10px] text-[#999999]">Máximo 35 caracteres</p>
              </div>
            </div>
          )}

          {/* MULTI MODE */}
          {multiEntrega && (
            <div className="flex flex-col px-4 py-4 gap-3">
              {entregas.map((entrega, eIdx) => (
                <div
                  key={entrega.id}
                  className="border border-[#EEEEEE] rounded-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F7F7F7] border-b border-[#EEEEEE]">
                    <span className="w-5 h-5 rounded-full bg-[#141414] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {eIdx + 1}
                    </span>
                    <p className="flex-1 text-xs font-medium text-[#141414] truncate">
                      {entrega.dispatch_address || "Sin dirección"}
                    </p>
                    <button
                      onClick={() => openEditModal(entrega)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#999999] hover:text-[#141414] hover:bg-white transition-colors flex-shrink-0"
                      title="Editar destino"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeEntrega(entrega.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Eliminar destino"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="divide-y divide-[#F7F7F7]">
                    {discountItems.map((item, idx) => {
                      const asignado = entrega.cantidades[item.item_uuid || item.product_sku] ?? 0;
                      return (
                        <div
                          key={`${item.product_sku}::${idx}`}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <p className="flex-1 text-[11px] text-[#666666] line-clamp-1">
                            {item.description}
                          </p>
                          <span
                            className={`text-[11px] font-semibold w-6 text-right ${asignado === 0 ? "text-[#CCCCCC]" : "text-[#141414]"}`}
                          >
                            {asignado}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {bonusItems.length + otherBonusItems.length > 0 && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7FDE8] border-t border-[#F0F9D8]">
                        <Gift size={10} className="text-[#6AB000] flex-shrink-0" />
                        <span className="text-[10px] font-semibold text-[#6AB000] uppercase tracking-wide">
                          Bonificados
                        </span>
                      </div>
                      <div className="divide-y divide-[#F0F9D8] bg-[#FDFFF5]">
                        {bonusItems.map((item) => {
                          const asignado = entrega.bonusCantidades[item.product_sku] ?? 0;
                          return (
                            <div
                              key={`promo-${item.product_sku}`}
                              className="flex items-center gap-2 px-3 py-2"
                            >
                              <p className="flex-1 text-[11px] text-[#666666] line-clamp-1">
                                {item.description}
                              </p>
                              <span
                                className={`text-[11px] font-semibold w-6 text-right ${asignado === 0 ? "text-[#CCCCCC]" : "text-[#6AB000]"}`}
                              >
                                {asignado}
                              </span>
                            </div>
                          );
                        })}
                        {otherBonusItems.map((item) => {
                          const asignado = entrega.otherBonusCantidades[item.product_sku] ?? 0;
                          return (
                            <div
                              key={`other-${item.product_sku}`}
                              className="flex items-center gap-2 px-3 py-2"
                            >
                              <p className="flex-1 text-[11px] text-[#666666] line-clamp-1">
                                {item.description}
                              </p>
                              <span
                                className={`text-[11px] font-semibold w-6 text-right ${asignado === 0 ? "text-[#CCCCCC]" : "text-[#6AB000]"}`}
                              >
                                {asignado}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {(entrega.telefono || entrega.observaciones) && (
                    <div className="px-3 py-2 bg-[#FAFAFA] border-t border-[#F0F0F0] flex flex-col gap-0.5">
                      {entrega.telefono && (
                        <p className="text-[10px] text-[#999999]">
                          {entrega.indicativo} {entrega.telefono}
                        </p>
                      )}
                      {entrega.observaciones && (
                        <p className="text-[10px] text-[#999999] italic line-clamp-1">
                          {entrega.observaciones}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={openNewModal}
                className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#DDDDDD] rounded-xl text-xs text-[#999999] hover:border-[#141414] hover:text-[#141414] transition-colors"
              >
                <Plus size={12} />
                Agregar destino
              </button>
            </div>
          )}

          {modalEntrega !== null && (
            <ModalShippingInfo
              mode={modalEntrega}
              draft={modalDraft}
              setDraft={setModalDraft}
              onSave={saveModal}
              onClose={() => setModalEntrega(null)}
              discountItems={discountItems}
              cantidadesAsignadasExcluyendo={cantidadesAsignadasExcluyendo}
              bonusItems={bonusItems}
              otherBonusItems={otherBonusItems}
              bonusAsignadasExcluyendo={bonusAsignadasExcluyendo}
              otherBonusAsignadasExcluyendo={otherBonusAsignadasExcluyendo}
              addresses={addresses}
              callingCodeOptions={callingCodeOptions}
              isLoadingOptions={isLoadingOptions}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#EEEEEE]  px-5 py-3 pb-4 flex-shrink-0 bg-[#fcffed]">
          {/* Totals */}
          <div className="rounded-[7px] py-3 flex flex-col gap-1">
            <div className="flex justify-between font-medium">
              <p>Subtotal</p>
              <p>${formatNumber(confirmOrderData?.subtotal)}</p>
            </div>
            <div className="flex justify-between text-xs text-[#999999]">
              <p>Descuentos ({selectedDiscount?.name})</p>
              {confirmOrderData?.discounts ? (
                <p>-${formatNumber(descuentoDeProductos)}</p>
              ) : (
                <p>-$0</p>
              )}
            </div>

            <div className="flex justify-between text-xs text-[#999999]">
              <p>Descuento de orden</p>
              <p>-${formatNumber(descuentoDeOrden)}</p>
            </div>

            {totalDescuento > 0 && (
              <div className="flex justify-between text-xs text-[#999999]">
                <span>Descuentos aplicados</span>
                <span>-{formatNumber(totalDescuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-[#141414] pt-1.5 border-t border-[#DDDDDD] mt-0.5">
              <span>Total</span>
              <span>{formatNumber(total)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <p>IVA</p>
              <p>${formatNumber(confirmOrderData?.taxes)}</p>
            </div>
            <div className="flex justify-between font-medium">
              <p>Total con pronto pago</p>
              <p>${formatNumber(confirmOrderData?.total_pronto_pago)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-1 flex-shrink-0">
            <button
              onClick={onDraft}
              disabled={loadingDraft || loadingFinish || !!draftInfo?.id}
              className="flex-1 py-3 text-sm font-semibold bg-[#141414] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loadingDraft ? "Guardando…" : "Guardar borrador"}
            </button>
            <button
              onClick={onConfirm}
              disabled={
                loadingFinish || loadingDraft || (multiEntrega ? hayDesbalance : !isSingleFormValid)
              }
              className="flex-1 py-3 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loadingFinish ? "Procesando…" : "Finalizar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
