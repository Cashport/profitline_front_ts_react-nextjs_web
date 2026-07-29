"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Gift } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel, IPromocion } from "@/types/marketAdmin/IMarketAdmin";
import NivelRow from "./NivelRow";

const MAX_USAGE_FIELDS = [
  ["Máx. usos por pedido", "maxUsagePerOrder"],
  ["Máx. usos por cliente", "maxUsagePerClient"],
  ["Máx. usos por cliente/mes", "maxUsagePerClientPerMonth"],
  ["Máx. usos global", "maxGlobalUsage"]
] as const;

export default function PromocionCard({
  promo,
  products,
  onChange,
  onDelete
}: {
  promo: IPromocion;
  products: Product[];
  onChange: (p: IPromocion) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

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
                  productos: [{ id: ppId, productId: products[0]?.id ?? 0 }],
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

  const updateNivel = (nId: string, nivel: INivel) => {
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

          {/* Vigencia y límites */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-medium text-[#666666]">Vigencia y límites</label>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999]">Fecha inicio</span>
                <input
                  type="date"
                  value={promo.fechaInicio ?? ""}
                  onChange={(e) => onChange({ ...promo, fechaInicio: e.target.value })}
                  className="px-3 py-2 text-sm text-[#141414] bg-white border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-[#999999]">Fecha fin</span>
                <input
                  type="date"
                  value={promo.fechaFin ?? ""}
                  onChange={(e) => onChange({ ...promo, fechaFin: e.target.value })}
                  className="px-3 py-2 text-sm text-[#141414] bg-white border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1 w-28">
                <span className="text-[11px] text-[#999999]">Acumulable</span>
                <input
                  type="number"
                  min={0}
                  value={promo.accumulable}
                  onChange={(e) =>
                    onChange({ ...promo, accumulable: parseInt(e.target.value) || 0 })
                  }
                  className="px-3 py-2 text-sm text-[#141414] bg-white border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors"
                />
              </label>
            </div>

            {promo.tipoCondicion === "combinacion" && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {MAX_USAGE_FIELDS.map(([label, key]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#999999]">{label}</span>
                    <input
                      type="number"
                      min={0}
                      value={promo[key] ?? ""}
                      onChange={(e) =>
                        onChange({ ...promo, [key]: parseInt(e.target.value) || 0 })
                      }
                      className="px-3 py-2 text-sm text-[#141414] bg-white border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors"
                    />
                  </label>
                ))}
              </div>
            )}
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
                products={products}
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
