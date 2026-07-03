"use client";

import { useContext, useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";

import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { DiscountItem, IBonus, IExecutiveDiscount } from "@/types/commerce/ICommerce";
import ProductsTable, {
  formatPrice,
  ProductsTableBonusItem,
  ProductsTableCategory
} from "@/modules/commerce/components/products-table";

type CheckoutItem = Omit<DiscountItem, "discount"> & { discount?: DiscountItem["discount"] };

const getSecondaryMaxPct = (item: CheckoutItem) =>
  item.discount?.secondary?.discount_applied?.max_discount ??
  item.discount?.secondary?.discount_applied?.discount ??
  0;

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
    setBonus,
    toggleCart
  } = useContext(OrderViewContext);

  const promoBonificados = (bonus?.bonusOptions ?? []).flatMap((option, optionIdx) =>
    option.cards.flatMap((card, cardIdx) =>
      card.items.map((item) => ({
        key: `promo-${optionIdx}-${cardIdx}-${item.product_id}`,
        kind: "promo" as const,
        optionIdx,
        cardIdx,
        product_id: item.product_id,
        fixed: card.fixed,
        description: item.description,
        qty: item.qty
      }))
    )
  );

  const otherBonificados = (bonus?.otherBonificated ?? []).map((item) => ({
    key: `other-${item.product_id}`,
    kind: "other" as const,
    product_id: item.product_id,
    fixed: true,
    description: item.description,
    qty: item.qty
  }));

  const bonificados = [...promoBonificados, ...otherBonificados];

  const handleRemovePromoBonus = (optionIdx: number, cardIdx: number, productId: number) => {
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

    if (nextOptions.length === 0 && bonus.otherBonificated.length === 0) {
      setBonus(undefined);
      return;
    }
    const next: IBonus = { ...bonus, bonusOptions: nextOptions };
    setBonus(next);
  };

  const handleRemoveOtherBonus = (productId: number) => {
    if (!bonus) return;
    const nextOther = bonus.otherBonificated.filter((it) => it.product_id !== productId);
    if (bonus.bonusOptions.length === 0 && nextOther.length === 0) {
      setBonus(undefined);
      return;
    }
    const next: IBonus = { ...bonus, otherBonificated: nextOther };
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

  const discountBySku = new Map(discountItems.map((d) => [d.product_sku, d]));

  // Sin descuentos el backend no devuelve `discounts`; los productos llegan en `products`.
  const productsBySku = new Map(
    (confirmOrderData?.products ?? []).map((p) => [p.product_sku, p])
  );

  const secondaryDiscount = confirmOrderData?.discounts?.secondaryDiscount;

  const [orderTotalDiscount, setOrderTotalDiscount] = useState(0);

  useEffect(() => {
    const incoming = confirmOrderData?.discounts?.totalOrderDiscount ?? 0;
    if (incoming > 0) {
      setOrderTotalDiscount(incoming);
    }
  }, [confirmOrderData?.discounts?.totalOrderDiscount]);

  const updatePrimaryDiscount = (item: CheckoutItem, newValue: number) => {
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

  const tableCategories: ProductsTableCategory[] = selectedCategories.map((category) => ({
    key: category.category_id,
    name: category.products[0]?.category_name ?? "",
    rows: category.products.map((product) => {
      const item: CheckoutItem = discountBySku.get(product.SKU) ??
        productsBySku.get(product.SKU) ?? {
          product_sku: product.SKU,
          quantity: product.quantity,
          shipment_unit: product.shipment_unit,
          price: product.price,
          price_taxes: product.price_taxes,
          taxes: 0,
          image: product.image,
          category_id: product.category_id,
          line_id: 0,
          product_id: product.id,
          description: product.name
        };
      const finalPrice = item.discount?.primary?.new_price ?? item.price;
      const maxPercentage = item.discount?.primary?.discount_applied?.max_discount ?? 0;
      const executiveEntry = executiveDiscounts.find((e) => e.product_sku === item.product_sku);
      return {
        key: `${product.id}-${product.SKU}`,
        description: item.description,
        sku: item.product_sku,
        originalPrice: item.price,
        finalPrice,
        quantity: item.quantity,
        discountPct: executiveEntry?.primary_discount_pct ?? maxPercentage,
        maxDiscountPct: maxPercentage,
        restante: item.quantity - cantidadesAsignadas(item.item_uuid || item.product_sku),
        onDiscountChange: (v: number) => updatePrimaryDiscount(item, v),
        onRemove: () => handleRemoveProduct(item.product_sku)
      };
    })
  }));

  const allRows = tableCategories.flatMap((c) => c.rows);
  const totalCantidad = allRows.reduce((s, r) => s + r.quantity, 0);
  const totalMonto = allRows.reduce((s, r) => s + r.finalPrice * r.quantity, 0);

  const tableBonus: ProductsTableBonusItem[] = bonificados.map((b, idx) => ({
    key: `${b.key}-${idx}`,
    description: b.description,
    qty: b.qty,
    fixed: b.fixed,
    onRemove: () =>
      b.kind === "promo"
        ? handleRemovePromoBonus(b.optionIdx, b.cardIdx, b.product_id)
        : handleRemoveOtherBonus(b.product_id)
  }));

  const handleGoBack = () => {
    setCheckingOut(false);
    toggleCart?.();
  };

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#F7F7F7]">
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-[#DDDDDD]">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DDDDDD] flex-shrink-0">
          <button
            onClick={handleGoBack}
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
        <ProductsTable
          className="flex-1 min-h-0 mx-5"
          categories={tableCategories}
          bonusItems={tableBonus}
          multiEntrega={multiEntrega}
          showActionsColumn
          totalCantidad={totalCantidad}
          totalMonto={totalMonto}
        />

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
