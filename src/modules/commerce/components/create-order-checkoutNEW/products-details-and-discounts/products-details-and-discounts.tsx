"use client";

import { useContext, useState } from "react";
import { ArrowLeft, Check, Pencil } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { DiscountItem, IExecutiveDiscount } from "@/types/commerce/ICommerce";

const getPrimaryMaxPct = (item: DiscountItem) =>
  item.discount?.primary?.discount_applied?.max_discount ??
  item.discount?.primary?.discount_applied?.discount ??
  0;

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
  const { client, confirmOrderData, setCheckingOut, executiveDiscounts, setExecutiveDiscounts } =
    useContext(OrderViewContext);

  const discountItems: DiscountItem[] = confirmOrderData?.discounts?.discountItems ?? [];

  const otrosDescuentosItems = discountItems.filter((it) => it.discount?.secondary);

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

  const toggleSecondaryDiscount = (item: DiscountItem) => {
    setExecutiveDiscounts((prev) => {
      const idx = prev.findIndex((e) => e.product_sku === item.product_sku);
      const original = getSecondaryMaxPct(item);
      const currentSecondary = idx >= 0 ? prev[idx].secondary_discount_pct : original;
      const currentPrimary = idx >= 0 ? prev[idx].primary_discount_pct : getPrimaryMaxPct(item);
      const nextEntry: IExecutiveDiscount = {
        product_sku: item.product_sku,
        primary_discount_pct: currentPrimary,
        secondary_discount_pct: currentSecondary > 0 ? 0 : original
      };
      return idx >= 0 ? prev.map((e, i) => (i === idx ? nextEntry : e)) : [...prev, nextEntry];
    });
  };

  const totalCantidad = discountItems.reduce((s, i) => s + i.quantity, 0);
  const totalMonto = discountItems.reduce((s, i) => {
    const pf = i.discount?.primary?.new_price ?? i.price;
    return s + pf * i.quantity;
  }, 0);

  const subtotalProductos = totalMonto;

  const cols = multiEntrega
    ? "grid-cols-[2fr_90px_100px_120px_100px_70px_110px_56px]"
    : "grid-cols-[2fr_90px_100px_120px_100px_70px_110px]";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F7]">
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
        <div className="flex-1 flex flex-col overflow-hidden mx-5 rounded-xl border border-[#EEEEEE]">
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
          </div>

          {/* Rows */}
          <div className="overflow-y-auto flex-1">
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
                    >
                      {restante}
                    </p>
                  )}
                </div>
              );
            })}
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
          </div>
        </div>

        {/* Otros descuentos */}
        {otrosDescuentosItems.length > 0 && (
          <div className="mx-5 mt-4 mb-5 rounded-xl border border-[#EEEEEE] overflow-hidden flex-shrink-0">
            <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE]">
              <p className="text-xs font-semibold text-[#141414]">Otros descuentos</p>
            </div>
            <div className="flex flex-col divide-y divide-[#F4F4F4]">
              {otrosDescuentosItems.map((it) => {
                const sec = it.discount.secondary!;
                const key = `${it.product_sku}-${sec.discount_applied.id}`;
                const entry = executiveDiscounts.find((e) => e.product_sku === it.product_sku);
                const activo = entry ? entry.secondary_discount_pct > 0 : true;
                const porcentaje = sec.discount_applied.discount;
                const monto = Math.round((subtotalProductos * porcentaje) / 100);
                const label = sec.discount_applied.discount_name || sec.description;
                return (
                  <div key={key} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex-1 text-sm text-[#141414]">{label}</span>
                    <span className="text-sm font-semibold text-red-500 w-8 text-right">
                      {porcentaje}%
                    </span>
                    <span className="text-sm text-[#666666] w-24 text-right">
                      {formatPrice(subtotalProductos - monto)}
                    </span>
                    <button
                      onClick={() => toggleSecondaryDiscount(it)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${
                        activo
                          ? "bg-[#141414] border-[#141414] text-white"
                          : "bg-white border-[#DDDDDD] hover:border-[#141414]"
                      }`}
                    >
                      {activo && <Check size={11} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
