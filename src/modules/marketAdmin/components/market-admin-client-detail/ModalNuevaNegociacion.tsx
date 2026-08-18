"use client";

import { useState, useRef } from "react";
import { Modal } from "antd";
import { ClipboardList, X, Upload, Eye, Percent } from "lucide-react";
import { LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";
import {
  BLANK_NEG,
  LINEAS_CATALOGO,
  type Negociacion,
  type NegLineaItem,
  type NegociacionForm
} from "@/modules/marketAdmin/mocks/clientDetail";

type Props = {
  onClose: () => void;
  onSubmit: (nueva: Negociacion) => void;
};

const allCatalogItems: NegLineaItem[] = Object.entries(LINEAS_CATALOGO).flatMap(([linea, prods]) =>
  prods.map((p) => ({
    productoId: p.id,
    productoNombre: p.nombre,
    linea,
    descuento: 0,
    selected: false
  }))
);

// Group catalog items by linea for the selector
const catalogByLinea = Object.entries(LINEAS_CATALOGO);

export default function ModalNuevaNegociacion({ onClose, onSubmit }: Props) {
  const [negForm, setNegForm] = useState<NegociacionForm>({
    ...BLANK_NEG,
    items: allCatalogItems
  });
  const [negGlobalInput, setNegGlobalInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleNegItem = (pid: string) =>
    setNegForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.productoId === pid ? { ...i, selected: !i.selected } : i))
    }));

  const toggleNegLinea = (linea: string) => {
    const lineaItems = negForm.items.filter((i) => i.linea === linea);
    const allSelected = lineaItems.every((i) => i.selected);
    setNegForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.linea === linea ? { ...i, selected: !allSelected } : i))
    }));
  };

  const applyGlobalDiscount = () => {
    const val = Math.min(100, Math.max(0, Number(negGlobalInput)));
    if (!negGlobalInput) return;
    setNegForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.selected ? { ...i, descuento: val } : i))
    }));
  };

  const setItemDescuento = (pid: string, val: number) =>
    setNegForm((f) => ({
      ...f,
      items: f.items.map((i) => (i.productoId === pid ? { ...i, descuento: val } : i))
    }));

  const selectedItems = negForm.items.filter((i) => i.selected);
  const allNegSelected = negForm.items.length > 0 && negForm.items.every((i) => i.selected);
  const someNegSelected = negForm.items.some((i) => i.selected) && !allNegSelected;

  const toggleAllNeg = () => {
    const next = !allNegSelected;
    setNegForm((f) => ({ ...f, items: f.items.map((i) => ({ ...i, selected: next })) }));
  };

  const saveNegociacion = () => {
    if (!negForm.nombre.trim() || selectedItems.length === 0) return;
    const nueva: Negociacion = {
      id: `neg${Date.now()}`,
      nombre: negForm.nombre,
      estado: "En aprobación",
      fechaCreacion: new Date().toISOString().slice(0, 10),
      fechaVencimiento: negForm.vigencia,
      adjunto: negForm.adjunto?.name ?? null,
      autorizadoPor: null,
      creadoPor: "Usuario actual",
      lineas: selectedItems.map((i) => ({
        productoId: i.productoId,
        productoNombre: i.productoNombre,
        descuento: i.descuento
      }))
    };
    onSubmit(nueva);
  };

  return (
    <Modal
      open
      onCancel={onClose}
      centered
      width={720}
      title={
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-[#141414]" />
          <span className="text-base font-bold text-[#141414]">Nueva negociación</span>
        </div>
      }
      styles={{ body: { maxHeight: "65vh", overflowY: "auto" } }}
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#999999]">
            {selectedItems.length} producto{selectedItems.length !== 1 ? "s" : ""} seleccionado
            {selectedItems.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-sm text-[#666666] px-4 py-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveNegociacion}
              disabled={!negForm.nombre.trim() || selectedItems.length === 0}
              className="text-sm font-semibold bg-[#CBE71E] text-[#141414] px-5 py-2 rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enviar a aprobación
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Fila 1: nombre + vigencia */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">
              Nombre de la negociación
            </label>
            <input
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors"
              placeholder="Ej. Promo Q3 2025"
              value={negForm.nombre}
              onChange={(e) => setNegForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#141414] block mb-1.5">
              Fecha de vigencia
            </label>
            <input
              type="date"
              className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#141414] transition-colors text-[#141414]"
              value={negForm.vigencia}
              onChange={(e) => setNegForm((f) => ({ ...f, vigencia: e.target.value }))}
            />
          </div>
        </div>

        {/* Adjunto */}
        <div>
          <label className="text-xs font-bold text-[#141414] block mb-1.5">
            Adjunto (contrato / acuerdo)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => setNegForm((f) => ({ ...f, adjunto: e.target.files?.[0] ?? null }))}
          />
          <div className="flex items-center gap-2">
            {/* Filename or placeholder */}
            <span
              className={`flex-1 text-sm truncate ${negForm.adjunto ? "text-[#141414]" : "text-[#BBBBBB]"}`}
            >
              {negForm.adjunto ? negForm.adjunto.name : "Sin archivo adjunto"}
            </span>
            {/* Upload icon button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Subir archivo"
              className="w-8 h-8 flex items-center justify-center border border-[#DDDDDD] rounded-md text-[#666666] hover:border-[#141414] hover:text-[#141414] transition-colors flex-shrink-0"
            >
              <Upload size={14} />
            </button>
            {/* View icon button — only active when file selected */}
            <button
              type="button"
              disabled={!negForm.adjunto}
              onClick={() => {
                if (negForm.adjunto) {
                  const url = URL.createObjectURL(negForm.adjunto);
                  window.open(url, "_blank");
                }
              }}
              title="Ver archivo"
              className={`w-8 h-8 flex items-center justify-center border rounded-md transition-colors flex-shrink-0 ${
                negForm.adjunto
                  ? "border-[#DDDDDD] text-[#666666] hover:border-[#141414] hover:text-[#141414]"
                  : "border-[#EEEEEE] text-[#CCCCCC] cursor-not-allowed"
              }`}
            >
              <Eye size={14} />
            </button>
            {/* Remove — only when file selected */}
            {negForm.adjunto && (
              <button
                type="button"
                onClick={() => setNegForm((f) => ({ ...f, adjunto: null }))}
                title="Quitar archivo"
                className="w-8 h-8 flex items-center justify-center border border-[#DDDDDD] rounded-md text-[#AAAAAA] hover:border-[#E53E3E] hover:text-[#E53E3E] transition-colors flex-shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Productos — selector masivo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#141414]">
              Productos
              {selectedItems.length > 0 && (
                <span className="ml-1.5 text-[#999999] font-normal">
                  ({selectedItems.length} seleccionados)
                </span>
              )}
            </label>
            {/* Descuento global */}
            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#666666]">Aplicar a selección:</span>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 text-sm border border-[#DDDDDD] rounded-lg px-3 py-1.5 pr-6 focus:outline-none focus:border-[#141414] appearance-none"
                    placeholder="0"
                    value={negGlobalInput}
                    onChange={(e) => setNegGlobalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyGlobalDiscount();
                        setNegGlobalInput("");
                      }
                    }}
                  />
                  <Percent
                    size={11}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none"
                  />
                </div>
                <button
                  onClick={() => {
                    applyGlobalDiscount();
                    setNegGlobalInput("");
                  }}
                  className="text-xs font-semibold bg-[#141414] text-white px-3 py-1.5 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}
          </div>

          <div className="border border-[#EEEEEE] rounded-xl overflow-hidden">
            {/* Select all header */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#FAFAFA] border-b border-[#EEEEEE]">
              <input
                type="checkbox"
                checked={allNegSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someNegSelected;
                }}
                onChange={toggleAllNeg}
                className="w-[15px] h-[15px] rounded-sm accent-[#141414] cursor-pointer flex-shrink-0"
              />
              <span className="text-xs font-bold text-[#141414] flex-1">Producto</span>
              <span className="text-xs font-bold text-[#141414] w-24 text-right">Descuento %</span>
            </div>

            {/* Grouped by linea */}
            {catalogByLinea.map(([linea]) => {
              const lineaItems = negForm.items.filter((i) => i.linea === linea);
              const allLineaSel = lineaItems.every((i) => i.selected);
              const someLineaSel = lineaItems.some((i) => i.selected) && !allLineaSel;
              const c = LINEA_COLORS[linea] ?? { bg: "#AAAAAA", text: "#fff" };
              return (
                <div key={linea}>
                  {/* Linea subheader */}
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F5F5F5] border-b border-[#EEEEEE]">
                    <input
                      type="checkbox"
                      checked={allLineaSel}
                      ref={(el) => {
                        if (el) el.indeterminate = someLineaSel;
                      }}
                      onChange={() => toggleNegLinea(linea)}
                      className="w-[15px] h-[15px] rounded-sm accent-[#141414] cursor-pointer flex-shrink-0"
                    />
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {lineaAbrev(linea)}
                    </span>
                    <span className="text-xs font-bold text-[#141414]">{linea}</span>
                  </div>
                  {/* Products */}
                  {lineaItems.map((item) => (
                    <div
                      key={item.productoId}
                      className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#F5F5F5] last:border-0 transition-colors ${item.selected ? "bg-[#FAFFF0]" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleNegItem(item.productoId)}
                        className="w-[15px] h-[15px] rounded-sm accent-[#141414] cursor-pointer flex-shrink-0"
                      />
                      <span
                        className={`text-sm flex-1 ${item.selected ? "text-[#141414]" : "text-[#999999]"}`}
                      >
                        {item.productoNombre}
                      </span>
                      <div className="relative w-24">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={!item.selected}
                          className="w-full text-sm border border-[#DDDDDD] rounded-lg px-3 py-1.5 pr-6 focus:outline-none focus:border-[#141414] appearance-none disabled:bg-[#F5F5F5] disabled:text-[#CCCCCC] transition-colors text-right"
                          value={item.descuento === 0 ? "" : item.descuento}
                          placeholder="0"
                          onChange={(e) =>
                            setItemDescuento(
                              item.productoId,
                              Math.min(100, Math.max(0, Number(e.target.value)))
                            )
                          }
                        />
                        <Percent
                          size={11}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Aviso */}
        <div className="flex items-center gap-2 bg-[#FFF8E1] rounded-lg px-4 py-3">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309]">
            En aprobación
          </span>
          <span className="text-xs text-[#B45309]">
            Esta negociación quedará pendiente de aprobación y firma.
          </span>
        </div>
      </div>
    </Modal>
  );
}
