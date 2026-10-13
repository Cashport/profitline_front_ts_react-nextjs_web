"use client";

import { Plus, Trash2 } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel, IProductoCondicion, TipoCondicion } from "@/types/marketAdmin/IMarketAdmin";
import ProductSelect from "./ProductSelect";

function formatNumber(n: number): string {
  return n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function parseFormattedNumber(str: string): number {
  return parseInt(str.replace(/\./g, "")) || 0;
}

export default function CondicionObjetivo({
  nivel,
  tipo,
  products,
  onChange
}: {
  nivel: INivel;
  tipo: TipoCondicion;
  products: Product[];
  onChange: (n: INivel) => void;
}) {
  const firstAvailableId = (used: number[]) => products.find((p) => !used.includes(p.id))?.id ?? 0;

  const productosCondicion = nivel.productosCondicion ?? [];
  const sinProductosDisponibles = productosCondicion.length >= products.length;

  const addProductoCondicion = () => {
    onChange({
      ...nivel,
      productosCondicion: [
        ...productosCondicion,
        {
          id: `pc${Date.now()}`,
          productId: firstAvailableId(productosCondicion.map((pc) => pc.productId)),
          cantidad: 1
        }
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
              productos: [
                ...pk.productos,
                {
                  id: `pkp${Date.now()}`,
                  productId: firstAvailableId(pk.productos.map((p) => p.productId))
                }
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

  return (
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
          {productosCondicion.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-[#999999]">Productos individuales</p>
              {productosCondicion.map((pc) => (
                <div key={pc.id} className="flex items-center gap-2">
                  <ProductSelect
                    products={products}
                    value={pc.productId}
                    excludedIds={productosCondicion
                      .filter((x) => x.id !== pc.id)
                      .map((x) => x.productId)}
                    onChange={(productId) => updateProductoCondicion(pc.id, "productId", productId)}
                    className="[&_.ant-select-selector]:!bg-[#F7F7F7]"
                  />
                  <div className="flex items-stretch h-8 border border-[#DDDDDD] rounded-lg overflow-hidden w-20 flex-shrink-0">
                    <span className="flex items-center px-2 text-xs text-[#999999] bg-[#F7F7F7] border-r border-[#DDDDDD]">
                      x
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={pc.cantidad}
                      onChange={(e) =>
                        updateProductoCondicion(pc.id, "cantidad", parseInt(e.target.value) || 1)
                      }
                      className="w-10 px-2 text-sm text-[#141414] outline-none bg-white text-center"
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
                        <ProductSelect
                          products={products}
                          value={pp.productId}
                          size="small"
                          excludedIds={pak.productos
                            .filter((x) => x.id !== pp.id)
                            .map((x) => x.productId)}
                          onChange={(productId) =>
                            updateProductoInPaquete(pak.id, pp.id, productId)
                          }
                          className="[&_.ant-select-selector]:!bg-[#F7F7F7] [&_.ant-select-selector]:!text-xs"
                        />
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
                  disabled={pak.productos.length >= products.length}
                  className="flex items-center gap-1 text-[11px] text-[#0067B1] hover:underline w-fit disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
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
              disabled={sinProductosDisponibles}
              className="flex items-center gap-1.5 text-xs text-[#0067B1] hover:underline w-fit disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
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
  );
}
