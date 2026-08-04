"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Product } from "@/types/products/products";
import { ClienteOption, NuevaAsignacionData } from "@/types/marketAdmin/IMarketAdmin";
import ClienteSearchSelect from "./ClienteSearchSelect";

const hoy = () => new Date().toISOString().split("T")[0];

export default function NuevaAsignacionModal({
  clientes,
  productos,
  saving,
  onClose,
  onSave
}: {
  clientes: ClienteOption[];
  productos: Product[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: NuevaAsignacionData) => void;
}) {
  const [cliente, setCliente] = useState<ClienteOption | null>(null);
  const [productoId, setProductoId] = useState<number | "">("");
  const [unidades, setUnidades] = useState(1);
  const [fechaInicio, setFechaInicio] = useState(hoy());
  const [fechaFin, setFechaFin] = useState("");
  const [nota, setNota] = useState("");

  const productoSeleccionado = productos.find((p) => p.id === productoId);

  const isValid =
    !!cliente &&
    productoId !== "" &&
    unidades > 0 &&
    !!fechaInicio &&
    !!fechaFin &&
    fechaFin >= fechaInicio;

  const handleSave = () => {
    if (!isValid || !cliente || !productoSeleccionado || saving) return;
    onSave({
      cliente,
      producto: { id: productoSeleccionado.id, nombre: productoSeleccionado.description },
      unidades,
      fechaInicio,
      fechaFin,
      nota
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl border border-[#DDDDDD] w-[480px] max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEE]">
          <h3 className="text-sm font-bold text-[#141414]">Nueva asignación manual</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#999999] hover:bg-[#F7F7F7]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Cliente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Cliente</label>
            <ClienteSearchSelect
              clientes={clientes}
              selectedNit={cliente?.nit ?? ""}
              onSelect={setCliente}
            />
          </div>

          {/* Producto bonificado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Producto bonificado</label>
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value ? Number(e.target.value) : "")}
              className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
            >
              <option value="">Selecciona un producto...</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.description}
                </option>
              ))}
            </select>
          </div>

          {/* Unidades */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Unidades a asignar</label>
            <input
              type="number"
              min={1}
              value={unidades}
              onChange={(e) => setUnidades(parseInt(e.target.value) || 1)}
              className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] w-32"
            />
          </div>

          {/* Fechas */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#666666]">Fecha de inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#666666]">Fecha de fin</label>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
              />
            </div>
          </div>

          {/* Nota / comentarios */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Comentarios (opcional)</label>
            <textarea
              rows={2}
              placeholder="Motivo de la asignación..."
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414] placeholder:text-[#999999] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-[#EEEEEE]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-[#666666] border border-[#DDDDDD] rounded-lg hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="flex-1 py-2.5 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando…" : "Enviar a aprobación"}
          </button>
        </div>
      </div>
    </div>
  );
}
