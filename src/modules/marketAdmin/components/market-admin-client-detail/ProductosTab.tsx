"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ProfitLoader from "@/components/ui/profit-loader";
import { LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";
import { LINEAS_CATALOGO } from "@/modules/marketAdmin/mocks/clientDetail";
import { IMarketAdminClientProductCategory } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  categorias: IMarketAdminClientProductCategory[];
  isLoading?: boolean;
};

type GrupoProductos = {
  key: string;
  nombre: string;
  productos: { key: string; nombre: string }[];
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-[#141414]" : "bg-[#DDDDDD]"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`}
      />
    </button>
  );
}

export default function ProductosTab({ categorias, isLoading }: Props) {
  const [showLineaPicker, setShowLineaPicker] = useState(false);
  // Estado efímero: el endpoint no expone activación por producto ni alta de líneas.
  const [inactivos, setInactivos] = useState<Set<string>>(new Set());
  const [lineasLocales, setLineasLocales] = useState<string[]>([]);

  const grupos: GrupoProductos[] = [
    ...categorias.map((c) => ({
      key: `cat-${c.category_id}`,
      nombre: c.category,
      productos: c.products.map((p) => ({ key: `api-${p.id}`, nombre: p.description }))
    })),
    ...lineasLocales.map((l) => ({
      key: `linea-${l}`,
      nombre: l,
      productos: (LINEAS_CATALOGO[l] ?? []).map((p) => ({ key: `local-${p.id}`, nombre: p.nombre }))
    }))
  ];

  const totalProductos = grupos.reduce((n, g) => n + g.productos.length, 0);
  const lineasDisponibles = Object.keys(LINEAS_CATALOGO).filter(
    (l) => !grupos.some((g) => g.nombre === l)
  );

  const toggleProducto = (key: string) =>
    setInactivos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const agregarLinea = (linea: string) => setLineasLocales((prev) => [...prev, linea]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <ProfitLoader />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#666666]">
          {totalProductos} productos en {grupos.length} categorías
        </p>
        <div className="relative">
          <button
            onClick={() => setShowLineaPicker((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#CBE71E] text-[#141414] px-4 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors"
          >
            <Plus size={14} /> Agregar línea
          </button>
          {showLineaPicker && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-20 min-w-[200px] py-1">
              {lineasDisponibles.length === 0 ? (
                <p className="text-sm text-[#999999] px-4 py-2">No hay más líneas disponibles</p>
              ) : (
                lineasDisponibles.map((l) => {
                  const c = LINEA_COLORS[l] ?? { bg: "#AAAAAA", text: "#fff" };
                  return (
                    <button
                      key={l}
                      onClick={() => {
                        agregarLinea(l);
                        setShowLineaPicker(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[#F5F5F5] text-left transition-colors"
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {lineaAbrev(l)}
                      </span>
                      <span className="text-sm text-[#141414]">{l}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {grupos.length === 0 && (
        <p className="text-sm text-[#999999] py-8 text-center">
          Este cliente no tiene productos disponibles.
        </p>
      )}

      {grupos.map((grupo) => {
        const c = LINEA_COLORS[grupo.nombre] ?? { bg: "#AAAAAA", text: "#fff" };
        return (
          <div key={grupo.key} className="mb-5 border border-[#EEEEEE] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE]">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {lineaAbrev(grupo.nombre)}
              </span>
              <span className="text-sm font-bold text-[#141414]">{grupo.nombre}</span>
              <span className="text-xs text-[#999999] ml-auto">
                {grupo.productos.length} productos
              </span>
            </div>
            <div className="grid grid-cols-[1fr_80px] gap-4 px-4 py-2 border-b border-[#F5F5F5]">
              <span className="text-xs font-bold text-[#141414]">Producto</span>
              <span className="text-xs font-bold text-[#141414]">Activo</span>
            </div>
            {grupo.productos.map((p) => {
              const activo = !inactivos.has(p.key);
              return (
                <div
                  key={p.key}
                  className="grid grid-cols-[1fr_80px] gap-4 px-4 py-3 border-b border-[#F5F5F5] last:border-0 items-center"
                >
                  <span
                    className={`text-sm ${activo ? "text-[#141414]" : "text-[#AAAAAA] line-through"}`}
                  >
                    {p.nombre}
                  </span>
                  <Toggle checked={activo} onChange={() => toggleProducto(p.key)} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
