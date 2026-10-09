"use client";

import { Plus } from "lucide-react";
import { Product } from "@/types/products/products";
import { IGrupoPremio } from "@/types/marketAdmin/IMarketAdmin";
import GrupoPremioEditor from "@/modules/marketAdmin/components/MarketAdminPromotions/GrupoPremioEditor";

// El producto arranca en 0 (placeholder) porque el catálogo puede llegar después de abrir el modal.
export const createGrupoBonificado = (modo: IGrupoPremio["modo"]): IGrupoPremio => {
  const ppId = `pp${Date.now()}`;
  return {
    id: `g${Date.now()}`,
    modo,
    productos: [{ id: ppId, productId: 0 }],
    cantidadesFijas: modo === "fijo" ? { [ppId]: 1 } : undefined,
    unidadesPool: modo === "pool" ? 5 : undefined
  };
};

export default function GruposBonificadoEditor({
  grupos,
  products,
  onChange
}: {
  grupos: IGrupoPremio[];
  products: Product[];
  onChange: (grupos: IGrupoPremio[]) => void;
}) {
  const addGrupo = (modo: IGrupoPremio["modo"]) =>
    onChange([...grupos, createGrupoBonificado(modo)]);

  const updateGrupo = (grupo: IGrupoPremio) =>
    onChange(grupos.map((g) => (g.id === grupo.id ? grupo : g)));

  const removeGrupo = (gId: string) => onChange(grupos.filter((g) => g.id !== gId));

  return (
    <div className="flex flex-col gap-3">
      {grupos.map((g) => (
        <GrupoPremioEditor
          key={g.id}
          grupo={g}
          products={products}
          canRemove={grupos.length > 1}
          onChange={updateGrupo}
          onRemove={() => removeGrupo(g.id)}
        />
      ))}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => addGrupo("fijo")}
          className="flex items-center gap-1 text-[10px] text-[#666666] hover:text-[#141414] hover:underline"
        >
          <Plus size={9} /> Agregar grupo fijo
        </button>
        <span className="text-[#DDDDDD]">|</span>
        <button
          type="button"
          onClick={() => addGrupo("pool")}
          className="flex items-center gap-1 text-[10px] text-[#92400E] hover:underline"
        >
          <Plus size={9} /> Agregar grupo a elegir
        </button>
      </div>
    </div>
  );
}
