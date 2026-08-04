"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";
import { LINEAS_CATALOGO, type ProductoLinea } from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  productos: ProductoLinea[];
  onToggle: (id: string) => void;
  onAgregarLinea: (linea: string) => void;
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

export default function ProductosTab({ productos, onToggle, onAgregarLinea }: Props) {
  const [showLineaPicker, setShowLineaPicker] = useState(false);

  const grupos = productos.reduce<Record<string, ProductoLinea[]>>((acc, p) => {
    (acc[p.linea] = acc[p.linea] ?? []).push(p);
    return acc;
  }, {});
  const lineasActuales = Object.keys(grupos);
  const lineasDisponibles = Object.keys(LINEAS_CATALOGO).filter((l) => !lineasActuales.includes(l));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#666666]">
          {productos.length} productos en {lineasActuales.length} líneas
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
                        onAgregarLinea(l);
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

      {lineasActuales.length === 0 && (
        <p className="text-sm text-[#999999] py-8 text-center">
          No hay líneas asignadas. Agrega una línea para ver sus productos.
        </p>
      )}

      {lineasActuales.map((linea) => {
        const c = LINEA_COLORS[linea] ?? { bg: "#AAAAAA", text: "#fff" };
        return (
          <div key={linea} className="mb-5 border border-[#EEEEEE] rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FAFAFA] border-b border-[#EEEEEE]">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                {lineaAbrev(linea)}
              </span>
              <span className="text-sm font-bold text-[#141414]">{linea}</span>
              <span className="text-xs text-[#999999] ml-auto">
                {grupos[linea].length} productos
              </span>
            </div>
            <div className="grid grid-cols-[1fr_80px] gap-4 px-4 py-2 border-b border-[#F5F5F5]">
              <span className="text-xs font-bold text-[#141414]">Producto</span>
              <span className="text-xs font-bold text-[#141414]">Activo</span>
            </div>
            {grupos[linea].map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1fr_80px] gap-4 px-4 py-3 border-b border-[#F5F5F5] last:border-0 items-center"
              >
                <span
                  className={`text-sm ${p.activo ? "text-[#141414]" : "text-[#AAAAAA] line-through"}`}
                >
                  {p.nombre}
                </span>
                <Toggle checked={p.activo} onChange={() => onToggle(p.id)} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
