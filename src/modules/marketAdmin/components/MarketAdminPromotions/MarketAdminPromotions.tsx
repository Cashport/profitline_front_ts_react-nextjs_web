"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Gift, ArrowLeft } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type TipoCondicion = "monto" | "combinacion";

type ProductoCondicion = {
  id: string;
  nombre: string;
  cantidad: number;
};

// Un paquete: X unidades totales repartidas entre Y productos diferentes
type PaqueteCondicion = {
  id: string;
  unidades: number; // ej: 8 unidades totales
  minProductos: number; // ej: entre 5 productos diferentes
  productos: { id: string; nombre: string }[]; // productos elegibles del paquete
};

type ProductoPremio = {
  id: string;
  productoBonificadoId: string;
  productoBonificadoNombre: string;
};

type GrupoPremio = {
  id: string;
  // Productos en este grupo
  productos: ProductoPremio[];
  // Modo: "fijo" = cada producto tiene cantidad fija, "pool" = el cliente reparte X unidades entre los productos
  modo: "fijo" | "pool";
  // Para modo fijo: cantidad por producto
  cantidadesFijas?: Record<string, number>;
  // Para modo pool: total de unidades a repartir
  unidadesPool?: number;
};

type PremioOpcion = {
  id: string;
  // Grupos de productos en esta opción (puede haber varios grupos fijos + pool en la misma opción)
  grupos: GrupoPremio[];
};

type Nivel = {
  id: string;
  // Condición monto (rango)
  montoMinimo?: number;
  montoMaximo?: number;
  // Condición combinación — productos individuales con cantidad fija
  productosCondicion?: ProductoCondicion[];
  // Condición combinación — paquetes (X unidades entre Y productos)
  paquetesCondicion?: PaqueteCondicion[];
  // Premios (opciones A, B, etc.)
  premios: PremioOpcion[];
};

type Promocion = {
  id: string;
  nombre: string;
  tipoCondicion: TipoCondicion;
  activa: boolean;
  niveles: Nivel[];
};

// ── Mock data ──────────────────────────────────────────────────────────────
const PRODUCTOS_CATALOGO = [
  { id: "h1", nombre: "Crema Hidratante Diaria 250ml" },
  { id: "h2", nombre: "Loción Humectante 473ml" },
  { id: "l1", nombre: "Limpiador Facial Diario Piel Grasa 237ml" },
  { id: "s1", nombre: "Vitamin C Serum 30ml" },
  { id: "p1", nombre: "Protector Solar SPF 50+ 100ml" },
  { id: "b1", nombre: "SCULPTRA INJPRO 2 VIAL", precio: 0 },
  { id: "b2", nombre: "RESTYLANE SB VITAL LIDO 1ml", precio: 0 },
  { id: "b3", nombre: "RESTYLANE VOLYME 1ml", precio: 0 },
  { id: "b4", nombre: "RESTYLANE REFYNE 1ml", precio: 0 },
  { id: "b5", nombre: "REST LYFT LIDO 1ml", precio: 0 },
  { id: "b6", nombre: "RESTYLANE LIDOCAINA 1ml", precio: 0 },
  { id: "b7", nombre: "RESTYLANE KYSSE 1ml", precio: 0 },
  { id: "b8", nombre: "RESTYLANE DEFYNE 1ml", precio: 0 }
];

const PRODUCTOS_BONIFICADOS = PRODUCTOS_CATALOGO.filter((p) => p.id.startsWith("b"));

const PROMOCIONES_INICIALES: Promocion[] = [
  {
    id: "p1",
    nombre: "Promo Q1 — Escala por monto",
    tipoCondicion: "monto",
    activa: true,
    niveles: [
      {
        id: "n1",
        montoMinimo: 2000000,
        montoMaximo: 3000000,
        premios: [
          {
            id: "pr1a",
            grupos: [
              {
                id: "g1",
                modo: "fijo",
                productos: [
                  {
                    id: "pp1",
                    productoBonificadoId: "b1",
                    productoBonificadoNombre: "SCULPTRA INJPRO 2 VIAL"
                  },
                  {
                    id: "pp2",
                    productoBonificadoId: "b2",
                    productoBonificadoNombre: "RESTYLANE SB VITAL LIDO 1ml"
                  }
                ],
                cantidadesFijas: { pp1: 2, pp2: 1 }
              }
            ]
          },
          {
            id: "pr1b",
            grupos: [
              {
                id: "g2",
                modo: "pool",
                productos: [
                  {
                    id: "pp3",
                    productoBonificadoId: "b3",
                    productoBonificadoNombre: "RESTYLANE VOLYME 1ml"
                  },
                  {
                    id: "pp4",
                    productoBonificadoId: "b4",
                    productoBonificadoNombre: "RESTYLANE REFYNE 1ml"
                  },
                  {
                    id: "pp5",
                    productoBonificadoId: "b5",
                    productoBonificadoNombre: "REST LYFT LIDO 1ml"
                  },
                  {
                    id: "pp6",
                    productoBonificadoId: "b6",
                    productoBonificadoNombre: "RESTYLANE LIDOCAINA 1ml"
                  },
                  {
                    id: "pp7",
                    productoBonificadoId: "b7",
                    productoBonificadoNombre: "RESTYLANE KYSSE 1ml"
                  },
                  {
                    id: "pp8",
                    productoBonificadoId: "b8",
                    productoBonificadoNombre: "RESTYLANE DEFYNE 1ml"
                  }
                ],
                unidadesPool: 5
              },
              {
                id: "g3",
                modo: "fijo",
                productos: [
                  {
                    id: "pp9",
                    productoBonificadoId: "b1",
                    productoBonificadoNombre: "SCULPTRA INJPRO 2 VIAL"
                  }
                ],
                cantidadesFijas: { pp9: 3 }
              }
            ]
          }
        ]
      },
      {
        id: "n2",
        montoMinimo: 3000001,
        montoMaximo: 5000000,
        premios: [
          {
            id: "pr2a",
            grupos: [
              {
                id: "g4",
                modo: "fijo",
                productos: [
                  {
                    id: "pp10",
                    productoBonificadoId: "b2",
                    productoBonificadoNombre: "RESTYLANE SB VITAL LIDO 1ml"
                  }
                ],
                cantidadesFijas: { pp10: 5 }
              }
            ]
          }
        ]
      }
    ]
  }
];

function formatNumber(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseFormattedNumber(str: string): number {
  return parseInt(str.replace(/\./g, "")) || 0;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function NivelRow({
  nivel,
  idx,
  tipo,
  onChange,
  onRemove
}: {
  nivel: Nivel;
  idx: number;
  tipo: TipoCondicion;
  onChange: (n: Nivel) => void;
  onRemove: () => void;
}) {
  const addProductoCondicion = () => {
    onChange({
      ...nivel,
      productosCondicion: [
        ...(nivel.productosCondicion ?? []),
        { id: `pc${Date.now()}`, nombre: PRODUCTOS_CATALOGO[0].nombre, cantidad: 1 }
      ]
    });
  };

  const updateProductoCondicion = (
    pcId: string,
    field: keyof ProductoCondicion,
    value: string | number
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
    field: keyof Omit<PaqueteCondicion, "id" | "productos">,
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
              productos: [
                ...pk.productos,
                { id: `pkp${Date.now()}`, nombre: PRODUCTOS_CATALOGO[0].nombre }
              ]
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

  const updateProductoInPaquete = (pakId: string, ppId: string, nombre: string) => {
    onChange({
      ...nivel,
      paquetesCondicion: nivel.paquetesCondicion?.map((pk) =>
        pk.id === pakId
          ? { ...pk, productos: pk.productos.map((p) => (p.id === ppId ? { ...p, nombre } : p)) }
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
              productos: [
                {
                  id: ppId,
                  productoBonificadoId: PRODUCTOS_BONIFICADOS[0].id,
                  productoBonificadoNombre: PRODUCTOS_BONIFICADOS[0].nombre
                }
              ],
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

  // Grupo functions
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
                  productos: [
                    {
                      id: ppId,
                      productoBonificadoId: PRODUCTOS_BONIFICADOS[0].id,
                      productoBonificadoNombre: PRODUCTOS_BONIFICADOS[0].nombre
                    }
                  ],
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
                          productoBonificadoId: PRODUCTOS_BONIFICADOS[0].id,
                          productoBonificadoNombre: PRODUCTOS_BONIFICADOS[0].nombre
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

  const updateProductoInGrupo = (prId: string, gId: string, ppId: string, nombre: string) => {
    const p = PRODUCTOS_BONIFICADOS.find((b) => b.nombre === nombre);
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
                        pp.id === ppId
                          ? {
                              ...pp,
                              productoBonificadoNombre: nombre,
                              productoBonificadoId: p?.id ?? ""
                            }
                          : pp
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

  const LETRAS = ["A", "B", "C", "D", "E", "F"];

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
                        value={pc.nombre}
                        onChange={(e) => updateProductoCondicion(pc.id, "nombre", e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
                      >
                        {PRODUCTOS_CATALOGO.slice(0, 5).map((p) => (
                          <option key={p.id}>{p.nombre}</option>
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
                            updatePaqueteCondicion(
                              pak.id,
                              "unidades",
                              parseInt(e.target.value) || 1
                            )
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
                              value={pp.nombre}
                              onChange={(e) =>
                                updateProductoInPaquete(pak.id, pp.id, e.target.value)
                              }
                              className="flex-1 px-2.5 py-1.5 text-xs bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
                            >
                              {PRODUCTOS_CATALOGO.slice(0, 5).map((p) => (
                                <option key={p.id}>{p.nombre}</option>
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
                        {LETRAS[prIdx] ?? prIdx + 1}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-[#141414]">
                      {nivel.premios.length > 1 ? `Opción ${LETRAS[prIdx]}` : "Regalo"}
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
                              value={pp.productoBonificadoNombre}
                              onChange={(e) =>
                                updateProductoInGrupo(pr.id, g.id, pp.id, e.target.value)
                              }
                              className="flex-1 px-2 py-1.5 text-sm bg-white border border-[#EEEEEE] rounded outline-none focus:border-[#141414] transition-colors text-[#141414]"
                            >
                              {PRODUCTOS_BONIFICADOS.map((p) => (
                                <option key={p.id}>{p.nombre}</option>
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

function PromocionCard({
  promo,
  onChange,
  onDelete
}: {
  promo: Promocion;
  onChange: (p: Promocion) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const addNivel = () => {
    const id = `n${Date.now()}`;
    const ppId = `pp${Date.now()}`;
    const gId = `g${Date.now()}`;
    onChange({
      ...promo,
      niveles: [
        ...promo.niveles,
        {
          id,
          montoMinimo: 0,
          productosCondicion: [],
          premios: [
            {
              id: `pr${Date.now()}`,
              grupos: [
                {
                  id: gId,
                  modo: "fijo",
                  productos: [
                    {
                      id: ppId,
                      productoBonificadoId: PRODUCTOS_BONIFICADOS[0].id,
                      productoBonificadoNombre: PRODUCTOS_BONIFICADOS[0].nombre
                    }
                  ],
                  cantidadesFijas: { [ppId]: 1 }
                }
              ]
            }
          ]
        }
      ]
    });
    setExpanded(true);
  };

  const updateNivel = (nId: string, nivel: Nivel) => {
    onChange({ ...promo, niveles: promo.niveles.map((n) => (n.id === nId ? nivel : n)) });
  };

  const removeNivel = (nId: string) => {
    onChange({ ...promo, niveles: promo.niveles.filter((n) => n.id !== nId) });
  };

  return (
    <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-[#CBE71E] flex items-center justify-center flex-shrink-0">
          <Gift size={15} className="text-[#141414]" />
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={promo.nombre}
            onChange={(e) => onChange({ ...promo, nombre: e.target.value })}
            className="text-sm font-semibold text-[#141414] outline-none bg-transparent w-full hover:bg-[#F7F7F7] focus:bg-[#F7F7F7] px-1.5 py-0.5 rounded transition-colors"
          />
          <p className="text-xs text-[#999999] px-1.5">
            {promo.tipoCondicion === "monto" ? "Por monto" : "Por combinación"} ·{" "}
            {promo.niveles.length} nivel(es)
          </p>
        </div>

        {/* Activa toggle */}
        <button
          onClick={() => onChange({ ...promo, activa: !promo.activa })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${promo.activa ? "bg-[#141414]" : "bg-[#DDDDDD]"}`}
        >
          <span
            className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${promo.activa ? "translate-x-4" : "translate-x-0.5"}`}
          />
        </button>

        <button
          onClick={onDelete}
          className="w-7 h-7 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 rounded flex items-center justify-center text-[#999999] hover:bg-[#F7F7F7] transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-[#EEEEEE] px-5 py-4 flex flex-col gap-4 bg-[#FAFAFA]">
          {/* Tipo de condición como radio buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[#666666]">Tipo de condición</label>
            <div className="flex gap-3">
              <label
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  promo.tipoCondicion === "monto"
                    ? "border-[#141414] bg-white"
                    : "border-[#DDDDDD] bg-white hover:border-[#AAAAAA]"
                }`}
              >
                <input
                  type="radio"
                  name={`tipo-${promo.id}`}
                  value="monto"
                  checked={promo.tipoCondicion === "monto"}
                  onChange={() => onChange({ ...promo, tipoCondicion: "monto" })}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    promo.tipoCondicion === "monto" ? "border-[#141414]" : "border-[#CCCCCC]"
                  }`}
                >
                  {promo.tipoCondicion === "monto" && (
                    <span className="w-2 h-2 rounded-full bg-[#141414]" />
                  )}
                </span>
                <span className="text-sm text-[#141414]">Por monto de compra</span>
              </label>
              <label
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  promo.tipoCondicion === "combinacion"
                    ? "border-[#141414] bg-white"
                    : "border-[#DDDDDD] bg-white hover:border-[#AAAAAA]"
                }`}
              >
                <input
                  type="radio"
                  name={`tipo-${promo.id}`}
                  value="combinacion"
                  checked={promo.tipoCondicion === "combinacion"}
                  onChange={() => onChange({ ...promo, tipoCondicion: "combinacion" })}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    promo.tipoCondicion === "combinacion" ? "border-[#141414]" : "border-[#CCCCCC]"
                  }`}
                >
                  {promo.tipoCondicion === "combinacion" && (
                    <span className="w-2 h-2 rounded-full bg-[#141414]" />
                  )}
                </span>
                <span className="text-sm text-[#141414]">Por combinación de productos</span>
              </label>
            </div>
          </div>

          {/* Niveles */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-[#666666]">Niveles / escalones</p>
            {promo.niveles.map((nivel, idx) => (
              <NivelRow
                key={nivel.id}
                nivel={nivel}
                idx={idx}
                tipo={promo.tipoCondicion}
                onChange={(n) => updateNivel(nivel.id, n)}
                onRemove={() => removeNivel(nivel.id)}
              />
            ))}
            <button
              onClick={addNivel}
              className="flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#DDDDDD] rounded-xl text-xs text-[#999999] hover:border-[#141414] hover:text-[#141414] transition-colors"
            >
              <Plus size={12} /> Agregar nivel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MarketAdminPromotions({ onBack }: { onBack: () => void }) {
  const [promociones, setPromociones] = useState<Promocion[]>(PROMOCIONES_INICIALES);

  const addPromocion = () => {
    const id = `p${Date.now()}`;
    setPromociones((prev) => [
      ...prev,
      {
        id,
        nombre: "Nueva promoción",
        tipoCondicion: "monto",
        activa: true,
        niveles: []
      }
    ]);
  };

  const updatePromocion = (id: string, p: Promocion) => {
    setPromociones((prev) => prev.map((x) => (x.id === id ? p : x)));
  };

  const deletePromocion = (id: string) => {
    setPromociones((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-[#999999] hover:text-[#141414] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#141414]">Promociones automáticas</h1>
              <p className="text-xs text-[#999999]">
                Define condiciones y productos bonificados por escalones
              </p>
            </div>
          </div>
          <button
            onClick={addPromocion}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Plus size={14} /> Nueva promoción
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {promociones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Gift size={32} className="text-[#DDDDDD]" />
              <p className="text-sm text-[#999999]">No hay promociones creadas</p>
              <button
                onClick={addPromocion}
                className="px-4 py-2 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
              >
                Crear primera promoción
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {promociones.map((promo) => (
                <PromocionCard
                  key={promo.id}
                  promo={promo}
                  onChange={(p) => updatePromocion(promo.id, p)}
                  onDelete={() => deletePromocion(promo.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
