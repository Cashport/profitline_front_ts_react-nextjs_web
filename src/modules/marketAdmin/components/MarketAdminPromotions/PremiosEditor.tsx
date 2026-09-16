"use client";

import { Plus, Trash2, Gift } from "lucide-react";
import { Product } from "@/types/products/products";
import { IGrupoPremio, INivel } from "@/types/marketAdmin/IMarketAdmin";
import GrupoPremioEditor from "./GrupoPremioEditor";

const getLetra = (index: number): string => String.fromCharCode(65 + index);

export default function PremiosEditor({
  nivel,
  products,
  onChange
}: {
  nivel: INivel;
  products: Product[];
  onChange: (n: INivel) => void;
}) {
  const defaultProductId = products[0]?.id ?? 0;

  const addPremio = () => {
    const ppId = `pp${Date.now()}`;
    const gId = `g${Date.now()}`;
    onChange({
      ...nivel,
      premios: [
        ...nivel.premios,
        {
          id: `pr${Date.now()}`,
          grupos: [
            {
              id: gId,
              modo: "fijo",
              productos: [{ id: ppId, productId: defaultProductId }],
              cantidadesFijas: { [ppId]: 1 }
            }
          ]
        }
      ]
    });
  };

  const removePremio = (prId: string) => {
    onChange({
      ...nivel,
      premios: nivel.premios.filter((pr) => pr.id !== prId)
    });
  };

  const addGrupoToPremio = (prId: string, modo: "fijo" | "pool") => {
    const ppId = `pp${Date.now()}`;
    const gId = `g${Date.now()}`;
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: [
                ...pr.grupos,
                {
                  id: gId,
                  modo,
                  productos: [{ id: ppId, productId: defaultProductId }],
                  cantidadesFijas: modo === "fijo" ? { [ppId]: 1 } : undefined,
                  unidadesPool: modo === "pool" ? 5 : undefined
                }
              ]
            }
          : pr
      )
    });
  };

  const removeGrupo = (prId: string, gId: string) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId ? { ...pr, grupos: pr.grupos.filter((g) => g.id !== gId) } : pr
      )
    });
  };

  const updateGrupo = (prId: string, grupo: IGrupoPremio) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? { ...pr, grupos: pr.grupos.map((g) => (g.id === grupo.id ? grupo : g)) }
          : pr
      )
    });
  };

  return (
    <div className="p-4 flex flex-col gap-3 bg-[#FDFFF5]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#E8F5C0] flex items-center justify-center">
            <Gift size={10} className="text-[#6AB000]" />
          </span>
          <p className="text-xs font-semibold text-[#141414]">Regalos</p>
        </div>
        {nivel.premios.length > 1 && (
          <span className="text-[10px] text-[#999999] bg-[#F0F0F0] px-2 py-0.5 rounded-full">
            El cliente elige una opción
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {nivel.premios.map((pr, prIdx) => (
          <div key={pr.id} className="bg-white rounded-lg overflow-hidden">
            {/* Header de la opción */}
            <div className="flex items-center justify-between px-3 py-2 bg-[#F7FDE8] border-b border-[#E8F5C0]">
              <div className="flex items-center gap-2">
                {nivel.premios.length > 1 && (
                  <span className="w-5 h-5 rounded bg-[#CBE71E] flex items-center justify-center text-[10px] font-bold text-[#141414]">
                    {getLetra(prIdx)}
                  </span>
                )}
                <span className="text-[11px] font-medium text-[#141414]">
                  {nivel.premios.length > 1 ? `Opción ${getLetra(prIdx)}` : "Regalo"}
                </span>
              </div>
              {nivel.premios.length > 1 && (
                <button
                  onClick={() => removePremio(pr.id)}
                  className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>

            {/* Grupos de esta opción */}
            <div className="p-3 flex flex-col gap-3">
              {pr.grupos.map((g) => (
                <GrupoPremioEditor
                  key={g.id}
                  grupo={g}
                  products={products}
                  canRemove={pr.grupos.length > 1}
                  onChange={(grupo) => updateGrupo(pr.id, grupo)}
                  onRemove={() => removeGrupo(pr.id, g.id)}
                />
              ))}

              {/* Agregar grupo */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => addGrupoToPremio(pr.id, "fijo")}
                  className="flex items-center gap-1 text-[10px] text-[#666666] hover:text-[#141414] hover:underline"
                >
                  <Plus size={9} /> Agregar grupo fijo
                </button>
                <span className="text-[#DDDDDD]">|</span>
                <button
                  onClick={() => addGrupoToPremio(pr.id, "pool")}
                  className="flex items-center gap-1 text-[10px] text-[#92400E] hover:underline"
                >
                  <Plus size={9} /> Agregar grupo a elegir
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addPremio}
          className="flex items-center gap-1.5 text-xs text-[#6AB000] hover:underline w-fit"
        >
          <Plus size={11} /> Agregar opción de regalo
        </button>
      </div>
    </div>
  );
}
