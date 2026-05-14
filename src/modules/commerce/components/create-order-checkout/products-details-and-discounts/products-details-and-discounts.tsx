"use client";

import { useContext, useEffect, useState } from "react";
import { ArrowLeft, Check, Gift, Pencil, Trash2 } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { DiscountItem, IBonus, IExecutiveDiscount } from "@/types/commerce/ICommerce";

const getSecondaryMaxPct = (item: DiscountItem) =>
  item.discount?.secondary?.discount_applied?.max_discount ??
  item.discount?.secondary?.discount_applied?.discount ??
  0;

function formatPrice(n: number) {
  return "$" + (n ?? 0).toLocaleString("es-CO");
}

function DescuentoCell({
  value,
  max,
  onChange
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const enabled = max > 0;

  if (!enabled) {
    return <span className="text-xs text-[#999999] italic">Sin desc.</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            type="number"
            min={0}
            max={max}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              const n = parseInt(draft);
              if (!isNaN(n) && n >= 0 && n <= max) onChange(n);
              else setDraft(String(value));
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setDraft(String(value));
                setEditing(false);
              }
            }}
            className="w-12 text-center text-xs font-semibold border border-[#141414] rounded px-1 py-0.5 outline-none bg-white"
          />
          <span className="text-xs text-[#666666]">%</span>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="flex items-center gap-0.5 text-xs font-semibold text-red-500 hover:underline"
        >
          -{value}%
          <Pencil size={10} className="text-[#999999]" />
        </button>
      )}
    </div>
  );
}

interface ProductsDetailsAndDiscountsProps {
  multiEntrega: boolean;
  cantidadesAsignadas: (productSku: string) => number;
}

export default function ProductsDetailsAndDiscounts({
  multiEntrega,
  cantidadesAsignadas
}: ProductsDetailsAndDiscountsProps) {
  const {
    client,
    confirmOrderData,
    setCheckingOut,
    executiveDiscounts,
    setExecutiveDiscounts,
    selectedCategories,
    setSelectedCategories,
    deactivateCrossSelling,
    setDeactivateCrossSelling,
    bonus,
    setBonus
  } = useContext(OrderViewContext);

  const bonificados = (bonus?.bonusOptions ?? []).flatMap((option, optionIdx) =>
    option.cards.flatMap((card, cardIdx) =>
      card.items.map((item) => ({
        key: `${optionIdx}-${cardIdx}-${item.product_id}`,
        optionIdx,
        cardIdx,
        product_id: item.product_id,
        fixed: card.fixed,
        description: item.description,
        qty: item.qty
      }))
    )
  );

  const handleRemoveBonus = (optionIdx: number, cardIdx: number, productId: number) => {
    if (!bonus) return;
    const nextOptions = bonus.bonusOptions
      .map((option, oi) => {
        if (oi !== optionIdx) return option;
        const nextCards = option.cards
          .map((card, ci) => {
            if (ci !== cardIdx) return card;
            return { ...card, items: card.items.filter((it) => it.product_id !== productId) };
          })
          .filter((card) => card.items.length > 0);
        return { ...option, cards: nextCards };
      })
      .filter((option) => option.cards.length > 0);

    if (nextOptions.length === 0) {
      setBonus(undefined);
      return;
    }
    const next: IBonus = { ...bonus, bonusOptions: nextOptions };
    setBonus(next);
  };

  const handleRemoveProduct = (productSku: string) => {
    const next = selectedCategories
      .map((cat) => ({
        ...cat,
        products: cat.products.filter((p) => p.SKU !== productSku)
      }))
      .filter((cat) => cat.products.length > 0);
    setSelectedCategories(next);
    setExecutiveDiscounts((prev) => prev.filter((e) => e.product_sku !== productSku));
  };

  const discountItems: DiscountItem[] = confirmOrderData?.discounts?.discountItems ?? [];

  const secondaryDiscount = confirmOrderData?.discounts?.secondaryDiscount;

  const [orderTotalDiscount, setOrderTotalDiscount] = useState(0);

  useEffect(() => {
    const incoming = confirmOrderData?.discounts?.totalOrderDiscount ?? 0;
    if (incoming > 0) {
      setOrderTotalDiscount(incoming);
    }
  }, [confirmOrderData?.discounts?.totalOrderDiscount]);

  const updatePrimaryDiscount = (item: DiscountItem, newValue: number) => {
    setExecutiveDiscounts((prev) => {
      const idx = prev.findIndex((e) => e.product_sku === item.product_sku);
      const nextEntry: IExecutiveDiscount = {
        product_sku: item.product_sku,
        primary_discount_pct: newValue,
        secondary_discount_pct:
          idx >= 0 ? prev[idx].secondary_discount_pct : getSecondaryMaxPct(item)
      };
      return idx >= 0 ? prev.map((e, i) => (i === idx ? nextEntry : e)) : [...prev, nextEntry];
    });
  };

  const totalCantidad = discountItems.reduce((s, i) => s + i.quantity, 0);
  const totalMonto = discountItems.reduce((s, i) => {
    const pf = i.discount?.primary?.new_price ?? i.price;
    return s + pf * i.quantity;
  }, 0);

  const cols = multiEntrega
    ? "grid-cols-[2fr_90px_100px_120px_100px_70px_110px_56px_32px]"
    : "grid-cols-[2fr_90px_100px_120px_100px_70px_110px_32px]";

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#F7F7F7]">
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-[#DDDDDD]">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DDDDDD] flex-shrink-0">
          <button
            onClick={() => setCheckingOut(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#F7F7F7] transition-colors"
          >
            <ArrowLeft size={15} className="text-[#666666]" />
          </button>
          <span className="text-sm text-[#141414]">{client?.name}</span>
        </div>

        {/* Section title */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0">
          <h2 className="text-sm font-bold text-[#141414]">Detalle de productos</h2>
        </div>

        {/* Table wrapper */}
        <div className="flex-1 min-h-0 mx-5 rounded-xl border border-[#EEEEEE] overflow-x-auto overflow-y-hidden">
          <div className="min-w-max h-full flex flex-col">
            {/* Table header */}
            <div
              className={`grid ${cols} px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE] rounded-t-xl flex-shrink-0`}
            >
              <span className="text-xs font-medium text-[#AAAAAA]">Producto</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-right">SKU</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-right">P. Original</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-center">Descuento</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-right">P. Final</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-right">Cant.</span>
              <span className="text-xs font-medium text-[#AAAAAA] text-right">Total</span>
              {multiEntrega && (
                <span className="text-xs font-medium text-[#AAAAAA] text-right">Rest.</span>
              )}
              <span />
            </div>

            {/* Rows */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {discountItems.map((item, idx) => {
                const precioFinal = item.discount?.primary?.new_price ?? item.price;
                const totalLinea = precioFinal * item.quantity;
                const restante = item.quantity - cantidadesAsignadas(item.product_sku);
                const maxPercentage = item.discount?.primary?.discount_applied?.max_discount ?? 0;
                const executiveEntry = executiveDiscounts.find(
                  (e) => e.product_sku === item.product_sku
                );
                const cellValue = executiveEntry?.primary_discount_pct ?? maxPercentage;

                return (
                  <div
                    key={item.product_sku}
                    className={`grid ${cols} items-center px-4 py-4 ${
                      idx < discountItems.length - 1 ? "border-b border-[#F4F4F4]" : ""
                    }`}
                  >
                    <p
                      className="text-sm font-medium text-[#141414] leading-tight pr-4 truncate"
                      title={item.description}
                    >
                      {item.description}
                    </p>
                    <p className="text-xs text-[#CCCCCC] text-right">{item.product_sku}</p>
                    <p className="text-xs text-[#CCCCCC] line-through text-right">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex justify-center">
                      <DescuentoCell
                        value={cellValue}
                        max={maxPercentage}
                        onChange={(v) => updatePrimaryDiscount(item, v)}
                      />
                    </div>
                    <p className="text-sm font-semibold text-[#141414] text-right">
                      {formatPrice(precioFinal)}
                    </p>
                    <p className="text-sm text-[#141414] text-right">{item.quantity}</p>
                    <p className="text-sm font-semibold text-[#141414] text-right">
                      {formatPrice(totalLinea)}
                    </p>
                    {multiEntrega && (
                      <p
                        className={`text-sm font-bold text-right ${
                          restante === 0
                            ? "text-green-600"
                            : restante < 0
                              ? "text-red-500"
                              : "text-amber-500"
                        }`}
                        title={String(restante)}
                      >
                        {restante}
                      </p>
                    )}
                    {precioFinal === 0 ? (
                      <button
                        onClick={() => handleRemoveProduct(item.product_sku)}
                        title="Eliminar producto"
                        className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 justify-self-end"
                      >
                        <Trash2 size={12} />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>
                );
              })}
              {/* Sección bonificados */}
              {bonus && bonificados.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#F7FDE8] border-t border-[#EEEEEE]">
                    <Gift size={12} className="text-[#6AB000] flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-[#6AB000] uppercase tracking-wide">
                      Productos bonificados
                    </span>
                  </div>

                  {bonificados.map((b, idx) => (
                    <div
                      key={b.key}
                      className={`grid ${cols} items-center px-4 py-3.5 bg-[#FDFFF5] ${
                        idx < bonificados.length - 1 ? "border-b border-[#F0F9D8]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 pr-4 min-w-0">
                        <p className="text-sm font-medium text-[#141414] truncate">
                          {b.description}
                        </p>
                        <span
                          className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            b.fixed
                              ? "bg-[#E8F5C0] text-[#4A7A00]"
                              : "bg-[#EEF4FF] text-[#3B5BDB]"
                          }`}
                        >
                          {b.fixed ? "Promo auto" : "Manual"}
                        </span>
                      </div>
                      <span />
                      <span />
                      <div className="flex justify-center">
                        <span className="text-xs font-semibold text-[#6AB000]">100% desc.</span>
                      </div>
                      <p className="text-sm font-semibold text-[#6AB000] text-right">
                        {formatPrice(0)}
                      </p>
                      <p className="text-sm text-[#141414] text-right">{b.qty}</p>
                      <p className="text-sm font-semibold text-[#6AB000] text-right">
                        {formatPrice(0)}
                      </p>
                      {multiEntrega && <span />}
                      <button
                        onClick={() => handleRemoveBonus(b.optionIdx, b.cardIdx, b.product_id)}
                        title="Quitar bonificado"
                        className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 justify-self-end"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Totals row */}
            <div
              className={`grid ${cols} items-center px-4 py-3 bg-[#FAFAFA] border-t border-[#EEEEEE] rounded-b-xl flex-shrink-0`}
            >
              <span className="text-xs font-semibold text-[#141414]">Totales</span>
              <span />
              <span />
              <span />
              <span />
              <span className="text-sm font-bold text-[#141414] text-right">{totalCantidad}</span>
              <span className="text-sm font-bold text-[#141414] text-right">
                {formatPrice(totalMonto)}
              </span>
              {multiEntrega && <span />}
              <span />
            </div>
          </div>
        </div>

        {/* Otros descuentos */}
        {secondaryDiscount && (
          <div className="mx-5 mt-4 mb-5 rounded-xl border border-[#EEEEEE] overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE]">
              <p className="text-xs font-semibold text-[#141414]">Otros descuentos</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 text-sm text-[#141414]">{secondaryDiscount.name}</span>
              <span className="text-sm font-semibold text-red-500">
                -{formatPrice(orderTotalDiscount)}
              </span>
              <button
                onClick={() => setDeactivateCrossSelling((prev) => !prev)}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                  deactivateCrossSelling
                    ? "bg-[#141414] border-[#141414] text-white"
                    : "bg-white border-[#DDDDDD] hover:border-[#141414]"
                }`}
              >
                {deactivateCrossSelling && <Check size={11} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
