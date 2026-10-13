"use client";

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
  if (!prices || prices.length === 0) {
    return (
      <div>
        <p className="text-xs font-bold text-[#141414] mb-3">Listas de precio</p>
        <p className="text-sm text-[#999999]">Sin listas de precio asignadas.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold text-[#141414] mb-3">Listas de precio</p>
      <div className={`${gridCols} pb-2`}>
        <span className="text-xs font-bold text-[#141414]">Lista de precio</span>
        <span className="text-xs font-bold text-[#141414] text-right">Precio</span>
      </div>
      {prices.map((p) => (
        <div
          key={p.id}
          className={`${gridCols} py-3 border-t border-[#F5F5F5] items-center`}
        >
          <span className="text-sm text-[#141414]">{p.description}</span>
          <span className="text-sm font-bold text-[#141414] text-right">
            {formatCurrencyMoney(p.price)}
          </span>
        </div>
      ))}
    </div>
  );
}
