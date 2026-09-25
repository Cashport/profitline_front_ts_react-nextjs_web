"use client";

import { Trash2 } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel, TipoCondicion } from "@/types/marketAdmin/IMarketAdmin";
import CondicionObjetivo from "./CondicionObjetivo";
import PremiosEditor from "./PremiosEditor";

export default function NivelRow({
  nivel,
  idx,
  tipo,
  products,
  onChange,
  onRemove
}: {
  nivel: INivel;
  idx: number;
  tipo: TipoCondicion;
  products: Product[];
  onChange: (n: INivel) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg overflow-hidden bg-white">
      {/* Nivel header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAFA] border-b border-[#EEEEEE]">
        <span className="text-xs font-semibold text-[#141414]">Nivel {idx + 1}</span>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 divide-x divide-[#EEEEEE]">
        <CondicionObjetivo nivel={nivel} tipo={tipo} products={products} onChange={onChange} />
        <PremiosEditor nivel={nivel} products={products} onChange={onChange} />
      </div>
    </div>
  );
}
