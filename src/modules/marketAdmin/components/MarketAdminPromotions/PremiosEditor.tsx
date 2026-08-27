"use client";

import { Plus, Trash2, Gift } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel } from "@/types/marketAdmin/IMarketAdmin";
import ProductSelect from "./ProductSelect";

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

  const firstAvailableId = (used: number[]) => products.find((p) => !used.includes(p.id))?.id ?? 0;

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

  const updateGrupoPool = (prId: string, gId: string, unidades: number) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: pr.grupos.map((g) => (g.id === gId ? { ...g, unidadesPool: unidades } : g))
            }
          : pr
      )
    });
  };

  const addProductoToGrupo = (prId: string, gId: string) => {
    const ppId = `pp${Date.now()}`;
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: pr.grupos.map((g) =>
                g.id === gId
                  ? {
                      ...g,
                      productos: [
                        ...g.productos,
                        {
                          id: ppId,
                          productId: firstAvailableId(g.productos.map((pp) => pp.productId))
                        }
                      ],
                      cantidadesFijas:
                        g.modo === "fijo"
                          ? { ...(g.cantidadesFijas ?? {}), [ppId]: 1 }
                          : g.cantidadesFijas
                    }
                  : g
              )
            }
          : pr
      )
    });
  };

  const updateProductoInGrupo = (prId: string, gId: string, ppId: string, productId: number) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: pr.grupos.map((g) =>
                g.id === gId
                  ? {
                      ...g,
                      productos: g.productos.map((pp) =>
                        pp.id === ppId ? { ...pp, productId } : pp
                      )
                    }
                  : g
              )
            }
          : pr
      )
    });
  };

  const updateCantidadFija = (prId: string, gId: string, ppId: string, cantidad: number) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: pr.grupos.map((g) =>
                g.id === gId
                  ? { ...g, cantidadesFijas: { ...(g.cantidadesFijas ?? {}), [ppId]: cantidad } }
                  : g
              )
            }
          : pr
      )
    });
  };

  const removeProductoFromGrupo = (prId: string, gId: string, ppId: string) => {
    onChange({
      ...nivel,
      premios: nivel.premios.map((pr) =>
        pr.id === prId
          ? {
              ...pr,
              grupos: pr.grupos.map((g) =>
                g.id === gId
                  ? {
                      ...g,
                      productos: g.productos.filter((pp) => pp.id !== ppId),
                      cantidadesFijas: Object.fromEntries(
                        Object.entries(g.cantidadesFijas ?? {}).filter(([k]) => k !== ppId)
                      )
                    }
                  : g
              )
            }
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
                <div
                  key={g.id}
                  className={`rounded-lg border ${g.modo === "pool" ? "border-[#FDE68A] bg-[#FFFEF5]" : "border-[#EEEEEE] bg-[#FAFAFA]"} overflow-hidden`}
                >
                  {/* Grupo header */}
                  <div
                    className={`flex items-center justify-between px-2.5 py-1.5 ${g.modo === "pool" ? "bg-[#FFFBEB]" : "bg-[#F5F5F5]"}`}
                  >
                    <div className="flex items-center gap-2">
                      {g.modo === "pool" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#92400E]">El cliente elige</span>
                          <input
                            type="number"
                            min={1}
                            value={g.unidadesPool ?? 5}
                            onChange={(e) =>
                              updateGrupoPool(pr.id, g.id, parseInt(e.target.value) || 1)
                            }
                            className="w-10 px-1.5 py-0.5 text-xs font-semibold text-[#92400E] bg-white border border-[#FDE68A] rounded text-center outline-none"
                          />
                          <span className="text-[10px] text-[#92400E]">und. entre:</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#666666] font-medium">Fijo</span>
                      )}
                    </div>
                    {pr.grupos.length > 1 && (
                      <button
                        onClick={() => removeGrupo(pr.id, g.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>

                  {/* Productos del grupo */}
                  <div className="p-2 flex flex-col gap-1.5">
                    {g.productos.map((pp) => (
                      <div key={pp.id} className="flex items-center gap-2">
                        <ProductSelect
                          products={products}
                          value={pp.productId}
                          excludedIds={g.productos
                            .filter((x) => x.id !== pp.id)
                            .map((x) => x.productId)}
                          onChange={(productId) =>
                            updateProductoInGrupo(pr.id, g.id, pp.id, productId)
                          }
                          className="[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-[#EEEEEE]"
                        />
                        {g.modo === "fijo" && (
                          <div className="flex items-center border border-[#EEEEEE] rounded overflow-hidden w-[72px] flex-shrink-0">
                            <span className="px-1.5 py-1 text-[10px] text-[#999999] bg-[#F7F7F7] border-r border-[#EEEEEE]">
                              und.
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={g.cantidadesFijas?.[pp.id] ?? 1}
                              onChange={(e) =>
                                updateCantidadFija(
                                  pr.id,
                                  g.id,
                                  pp.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-8 px-1 py-1 text-sm text-[#141414] outline-none bg-white text-center"
                            />
                          </div>
                        )}
                        {g.productos.length > 1 && (
                          <button
                            onClick={() => removeProductoFromGrupo(pr.id, g.id, pp.id)}
                            className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addProductoToGrupo(pr.id, g.id)}
                      disabled={g.productos.length >= products.length}
                      className="flex items-center gap-1 text-[10px] text-[#6AB000] hover:underline w-fit disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      <Plus size={9} /> Agregar producto
                    </button>
                  </div>
                </div>
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
