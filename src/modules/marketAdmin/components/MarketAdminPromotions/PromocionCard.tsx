"use client";

import { useState } from "react";
import { Select } from "antd";
import { Plus, Trash2, ChevronDown, ChevronUp, Gift, Info } from "lucide-react";
import { Product } from "@/types/products/products";
import { INivel, IPromocion } from "@/types/marketAdmin/IMarketAdmin";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import NivelRow from "./NivelRow";

const MAX_USAGE_FIELDS = [
  ["Máx. usos por pedido", "maxUsagePerOrder", "maxUsagePerOrder"],
  ["Máx. usos por cliente", "maxUsagePerClient", "maxUsagePerClient"],
  ["Máx. usos por cliente/mes", "maxUsagePerClientPerMonth", "maxUsagePerClientPerMonth"],
  ["Máx. usos global", "maxGlobalUsage", "maxGlobalUsage"]
] as const;

// ── Textos de tooltips (español, hardcoded según convención del proyecto) ──
const TOOLTIPS = {
  accumulable:
    "Multiplicador del regalo. Cuando vale ≥ 2 y la promoción tiene un solo rango, el regalo se entrega hasta 'accumulable' veces según cuántas veces se cumpla la condición mínima (ej. si vale 3 y la condición mínima es 1, el cliente puede llevarse hasta 3 regalos si compra 3 unidades que cumplen el mínimo).",
  maxUsagePerOrder:
    "Número máximo de veces que el cliente puede aplicar esta promoción en un solo pedido. Déjalo vacío para sin límite.",
  maxUsagePerClient:
    "Número máximo de veces que el cliente puede usar esta promoción en total (histórico). Déjalo vacío para sin límite.",
  maxUsagePerClientPerMonth:
    "Máximo de redenciones por cliente en el mes en curso. Vacío o 0 = sin restricción mensual.",
  maxGlobalUsage:
    "Máximo de redenciones totales entre todos los clientes del proyecto. Déjalo vacío para sin límite global.",
  businessUnit:
    "Restringe la promoción a una sola unidad de negocio (ej. 'Institucional', 'Retail'). Si queda vacío, aplica a todas las unidades del proyecto. Solo se mostrará a clientes cuya BU en client_marketplace coincida.",
  isFlex:
    "Promoción 'flex': el cliente recibe el regalo automáticamente, sin tener que elegir entre las opciones A/B/C. Si está apagada, el cliente debe elegir una opción.",
  takeFirstEligibleRangeDiscount:
    "Si está activo, se aplica SOLO el primer rango elegible del descuento que esté aplicando. Por defecto (apagado), se aplica el mejor rango disponible.",
  isPromotionCompatibleWithAllNegotiations:
    "Permite que esta promoción se acumule con los precios negociados del cliente. Si está apagada, la promoción NO se aplica cuando el cliente tiene negociaciones activas."
} as const;

// Etiqueta con icono de info y tooltip Radix.
function TooltipLabel({
  htmlFor,
  text,
  tooltip
}: {
  htmlFor?: string;
  text: string;
  tooltip: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{text}</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info
            size={12}
            className="text-[#999999] cursor-help hover:text-[#666666] transition-colors"
            aria-label={`Información sobre ${text}`}
          />
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="max-w-xs bg-[#141414] text-white text-xs leading-relaxed p-3"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

// Botón toggle estilo "switch" (idéntico al que ya usa `activa`).
function Toggle({
  value,
  onChange,
  label
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        value ? "bg-[#141414]" : "bg-[#DDDDDD]"
      }`}
    >
      <span
        className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${
          value ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function PromocionCard({
  promo,
  products,
  businessUnits,
  onChange,
  onDelete
}: {
  promo: IPromocion;
  products: Product[];
  businessUnits: string[];
  onChange: (p: IPromocion) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showBehavior, setShowBehavior] = useState(false);

  const businessUnitEnabled = Boolean(promo.businessUnit);

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
    <div className="bg-white rounded-lg overflow-hidden">
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
        <Toggle
          value={promo.activa}
          onChange={(v) => onChange({ ...promo, activa: v })}
          label="Promoción activa"
        />

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
                <span className="text-[11px] text-[#999999]">
                  <TooltipLabel text="Acumulable" tooltip={TOOLTIPS.accumulable} />
                </span>
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

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {MAX_USAGE_FIELDS.map(([label, key, tooltipKey]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#999999]">
                    <TooltipLabel text={label} tooltip={TOOLTIPS[tooltipKey]} />
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={promo[key] ?? ""}
                    // Si el input queda vacío, persistimos undefined para que
                    // el backend almacene NULL (= sin límite). Antes se
                    // guardaba 0, lo que violaba la validación min: 1 del
                    // backend para max_usage_per_order y max_global_usage.
                    onChange={(e) => {
                      const raw = e.target.value;
                      const next = raw === "" ? undefined : parseInt(raw, 10);
                      onChange({ ...promo, [key]: Number.isNaN(next as number) ? undefined : next });
                    }}
                    placeholder="Sin límite"
                    className="px-3 py-2 text-sm text-[#141414] bg-white border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* ── Comportamiento (colapsable) ─────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowBehavior((v) => !v)}
              className="flex items-center gap-2 self-start text-xs font-medium text-[#666666] hover:text-[#141414] transition-colors"
            >
              {showBehavior ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Comportamiento
              <span className="text-[10px] text-[#AAAAAA] font-normal">
                (configuración avanzada)
              </span>
            </button>

            {showBehavior && (
              <div className="flex flex-col gap-3 pl-1 border-l-2 border-[#EEEEEE]">
                {/* Fila 1 — businessUnit (toggle + select) */}
                <div className="flex flex-wrap items-center gap-3">
                  <Toggle
                    value={businessUnitEnabled}
                    label="Restringir por unidad de negocio"
                    onChange={(v) => {
                      // Al desactivar, vaciamos businessUnit para que no se envíe al backend.
                      if (!v) {
                        onChange({ ...promo, businessUnit: undefined });
                      } else if (!promo.businessUnit && businessUnits.length > 0) {
                        onChange({ ...promo, businessUnit: businessUnits[0] });
                      }
                    }}
                  />
                  <TooltipLabel
                    text="Unidad de negocio"
                    tooltip={TOOLTIPS.businessUnit}
                  />
                  <Select
                    disabled={!businessUnitEnabled}
                    value={promo.businessUnit}
                    placeholder={
                      businessUnits.length === 0
                        ? "Sin BUs configuradas en el proyecto"
                        : "Selecciona una unidad de negocio"
                    }
                    options={businessUnits.map((bu) => ({ value: bu, label: bu }))}
                    onChange={(value) => onChange({ ...promo, businessUnit: value })}
                    style={{ minWidth: 220 }}
                    size="middle"
                    className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD]"
                  />
                </div>

                {/* Fila 2 — isFlex */}
                <div className="flex items-center gap-3">
                  <Toggle
                    value={Boolean(promo.isFlex)}
                    label="Es promoción flex"
                    onChange={(v) => onChange({ ...promo, isFlex: v })}
                  />
                  <TooltipLabel text="Es promoción flex" tooltip={TOOLTIPS.isFlex} />
                </div>

                {/* Fila 3 — takeFirstEligibleRangeDiscount */}
                <div className="flex items-center gap-3">
                  <Toggle
                    value={Boolean(promo.takeFirstEligibleRangeDiscount)}
                    label="Tomar primer rango elegible"
                    onChange={(v) =>
                      onChange({ ...promo, takeFirstEligibleRangeDiscount: v })
                    }
                  />
                  <TooltipLabel
                    text="Tomar primer rango elegible"
                    tooltip={TOOLTIPS.takeFirstEligibleRangeDiscount}
                  />
                </div>

                {/* Fila 4 — isPromotionCompatibleWithAllNegotiations */}
                <div className="flex items-center gap-3">
                  <Toggle
                    value={Boolean(promo.isPromotionCompatibleWithAllNegotiations)}
                    label="Compatible con negociaciones"
                    onChange={(v) =>
                      onChange({
                        ...promo,
                        isPromotionCompatibleWithAllNegotiations: v
                      })
                    }
                  />
                  <TooltipLabel
                    text="Compatible con negociaciones"
                    tooltip={TOOLTIPS.isPromotionCompatibleWithAllNegotiations}
                  />
                </div>
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