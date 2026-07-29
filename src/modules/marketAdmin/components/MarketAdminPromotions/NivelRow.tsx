"use client";

import { Plus, Trash2, Gift } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel, IProductoCondicion, TipoCondicion } from "@/types/marketAdmin/IMarketAdmin";

function formatNumber(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseFormattedNumber(str: string): number {
  return parseInt(str.replace(/\./g, "")) || 0;
}

const getLetra = (index: number): string => String.fromCharCode(65 + index);

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
  const defaultProductId = products[0]?.id ?? 0;

  const addProductoCondicion = () => {
    onChange({
      ...nivel,
      productosCondicion: [
        ...(nivel.productosCondicion ?? []),
        { id: `pc${Date.now()}`, productId: defaultProductId, cantidad: 1 }
      ]
    });
  };

  const updateProductoCondicion = (
    pcId: string,
    field: keyof Omit<IProductoCondicion, "id">,
    value: number
  ) => {
    onChange({
      ...nivel,
      productosCondicion: nivel.productosCondicion?.map((pc) =>
        pc.id === pcId ? { ...pc, [field]: value } : pc
      )
    });
  };

  const removeProductoCondicion = (pcId: string) => {
    onChange({
      ...nivel,
      productosCondicion: nivel.productosCondicion?.filter((pc) => pc.id !== pcId)
    });
  };

  const addPaqueteCondicion = () => {
    onChange({
      ...nivel,
      paquetesCondicion: [
        ...(nivel.paquetesCondicion ?? []),
        { id: `pak${Date.now()}`, unidades: 8, minProductos: 5, productos: [] }
      ]
    });
  };

  const updatePaqueteCondicion = (
    pakId: string,
    field: "unidades" | "minProductos",
    value: number
  ) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.map((pk) =>
        pk.id === pakId ? { ...pk, [field]: value } : pk
      )
    });
  };

  const addProductoToPaquete = (pakId: string) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.map((pk) =>
        pk.id === pakId
          ? {
              ...pk,
              productos: [...pk.productos, { id: `pkp${Date.now()}`, productId: defaultProductId }]
            }
          : pk
      )
    });
  };

  const removeProductoFromPaquete = (pakId: string, ppId: string) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.map((pk) =>
        pk.id === pakId ? { ...pk, productos: pk.productos.filter((p) => p.id !== ppId) } : pk
      )
    });
  };

  const updateProductoInPaquete = (pakId: string, ppId: string, productId: number) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.map((pk) =>
        pk.id === pakId
          ? { ...pk, productos: pk.productos.map((p) => (p.id === ppId ? { ...p, productId } : p)) }
          : pk
      )
    });
  };

  const removePaqueteCondicion = (pakId: string) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.filter((pk) => pk.id !== pakId)
    });
  };

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
                      productos: [...g.productos, { id: ppId, productId: defaultProductId }],
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
    <div className="rounded-xl border border-[#EEEEEE] overflow-hidden bg-white">
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
        {/* ── Izquierda: Condición / Objetivo ───────────────────────────── */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-[#F0F0F0] flex items-center justify-center text-[10px] font-bold text-[#666666]">
              1
            </span>
            <p className="text-xs font-semibold text-[#141414]">Objetivo</p>
          </div>

          {tipo === "monto" ? (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-[#999999]">Rango de compra</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-[#DDDDDD] rounded-lg overflow-hidden">
                  <span className="px-2.5 py-2 text-xs text-[#999999] bg-[#F7F7F7] border-r border-[#DDDDDD]">
                    $
                  </span>
                  <input
                    type="text"
                    value={nivel.montoMinimo ? formatNumber(nivel.montoMinimo) : ""}
                    onChange={(e) =>
                      onChange({ ...nivel, montoMinimo: parseFormattedNumber(e.target.value) })
                    }
                    className="w-28 px-2.5 py-2 text-sm font-medium text-[#141414] outline-none bg-white"
                    placeholder="2.000.000"
                  />
                </div>
                <span className="text-xs text-[#999999]">a</span>
                <div className="flex items-center border border-[#DDDDDD] rounded-lg overflow-hidden">
                  <span className="px-2.5 py-2 text-xs text-[#999999] bg-[#F7F7F7] border-r border-[#DDDDDD]">
                    $
                  </span>
                  <input
                    type="text"
                    value={nivel.montoMaximo ? formatNumber(nivel.montoMaximo) : ""}
                    onChange={(e) =>
                      onChange({ ...nivel, montoMaximo: parseFormattedNumber(e.target.value) })
                    }
                    className="w-28 px-2.5 py-2 text-sm font-medium text-[#141414] outline-none bg-white"
                    placeholder="3.000.000"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Productos individuales */}
              {(nivel.productosCondicion ?? []).length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-[#999999]">Productos individuales</p>
                  {(nivel.productosCondicion ?? []).map((pc) => (
                    <div key={pc.id} className="flex items-center gap-2">
                      <select
                        value={pc.productId}
                        onChange={(e) =>
                          updateProductoCondicion(pc.id, "productId", Number(e.target.value))
                        }
                        className="flex-1 px-3 py-2 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.description}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center border border-[#DDDDDD] rounded-lg overflow-hidden w-20 flex-shrink-0">
                        <span className="px-2 py-2 text-xs text-[#999999] bg-[#F7F7F7] border-r border-[#DDDDDD]">
                          x
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={pc.cantidad}
                          onChange={(e) =>
                            updateProductoCondicion(
                              pc.id,
                              "cantidad",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-10 px-2 py-2 text-sm text-[#141414] outline-none bg-white text-center"
                        />
                      </div>
                      <button
                        onClick={() => removeProductoCondicion(pc.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Paquetes */}
              {(nivel.paquetesCondicion ?? []).map((pak) => (
                <div key={pak.id} className="border border-[#DDDDDD] rounded-lg overflow-hidden">
                  {/* Header del paquete */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#F7F7F7] border-b border-[#EEEEEE]">
                    <span className="text-[11px] font-semibold text-[#141414]">
                      Paquete de productos
                    </span>
                    <button
                      onClick={() => removePaqueteCondicion(pak.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <div className="p-3 flex flex-col gap-2.5">
                    {/* Unidades + min productos */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#999999]">Pide</span>
                        <input
                          type="number"
                          min={1}
                          value={pak.unidades}
                          onChange={(e) =>
                            updatePaqueteCondicion(pak.id, "unidades", parseInt(e.target.value) || 1)
                          }
                          className="w-14 px-2 py-1.5 text-sm text-center font-semibold text-[#141414] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] bg-white"
                        />
                        <span className="text-[11px] text-[#999999]">unidades</span>
                      </div>
                      <span className="text-[11px] text-[#CCCCCC]">entre</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={1}
                          value={pak.minProductos}
                          onChange={(e) =>
                            updatePaqueteCondicion(
                              pak.id,
                              "minProductos",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-14 px-2 py-1.5 text-sm text-center font-semibold text-[#141414] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] bg-white"
                        />
                        <span className="text-[11px] text-[#999999]">productos diferentes</span>
                      </div>
                    </div>

                    {/* Productos elegibles */}
                    {pak.productos.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] text-[#AAAAAA] font-semibold uppercase tracking-wide">
                          Productos elegibles
                        </p>
                        {pak.productos.map((pp) => (
                          <div key={pp.id} className="flex items-center gap-2">
                            <select
                              value={pp.productId}
                              onChange={(e) =>
                                updateProductoInPaquete(pak.id, pp.id, Number(e.target.value))
                              }
                              className="flex-1 px-2.5 py-1.5 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.description}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeProductoFromPaquete(pak.id, pp.id)}
                              className="w-6 h-6 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => addProductoToPaquete(pak.id)}
                      className="flex items-center gap-1 text-[11px] text-[#0067B1] hover:underline w-fit"
                    >
                      <Plus size={10} /> Agregar producto elegible
                    </button>
                  </div>
                </div>
              ))}

              {/* Botones de agregar */}
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={addProductoCondicion}
                  className="flex items-center gap-1.5 text-xs text-[#0067B1] hover:underline w-fit"
                >
                  <Plus size={11} /> Agregar producto
                </button>
                <span className="text-[#DDDDDD] text-xs">|</span>
                <button
                  onClick={addPaqueteCondicion}
                  className="flex items-center gap-1.5 text-xs text-[#0067B1] hover:underline w-fit"
                >
                  <Plus size={11} /> Agregar paquete de productos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Derecha: Premios / Regalos ─────────────────────────────────── */}
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
              <div
                key={pr.id}
                className="bg-white border border-[#E8F5C0] rounded-lg overflow-hidden"
              >
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
                            <select
                              value={pp.productId}
                              onChange={(e) =>
                                updateProductoInGrupo(pr.id, g.id, pp.id, Number(e.target.value))
                              }
                              className="flex-1 px-2 py-1.5 text-sm bg-white border border-[#EEEEEE] rounded outline-none focus:border-[#141414] transition-colors text-[#141414]"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.description}
                                </option>
                              ))}
                            </select>
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
                          className="flex items-center gap-1 text-[10px] text-[#6AB000] hover:underline w-fit"
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
      </div>
    </div>
  );
}
