"use client";

import { useTranslations } from "use-intl";
import { formatCurrencyMoney } from "@/utils/utils";

type PriceRow = { id: number; sku: string; description: string; price: number };

type Props = {
  prices: PriceRow[];
};

// Columnas: "Lista de precio" (description) y "Precio".
// `auto` en la última para que header y filas queden alineados al estilo de
// ProductSkusTable / ProductLotes.
const gridCols = "grid grid-cols-[1fr_auto] gap-4";

export default function ProductPricesTable({ prices }: Props) {
  const t = useTranslations("marketAdmin.productDetail.prices");
  if (!prices || prices.length === 0) {
    return (
      <div>
        <p className="text-[13px] font-bold text-[#141414] mb-3">{t("title")}</p>
        <p className="text-sm text-[#999999]">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[13px] font-bold text-[#141414] mb-3">{t("title")}</p>
      <div className={`${gridCols} pb-2`}>
        <span className="text-[13px] font-bold text-[#141414]">{t("priceList")}</span>
        <span className="text-[13px] font-bold text-[#141414] text-right">{t("price")}</span>
      </div>
      {prices.map((p) => (
        <div key={p.id} className={`${gridCols} py-3 border-t border-[#F5F5F5] items-center`}>
          <span className="text-sm text-[#141414]">{p.description}</span>
          <span className="text-sm font-bold text-[#141414] text-right">
            {formatCurrencyMoney(p.price)}
          </span>
        </div>
      ))}
    </div>
  );
}
