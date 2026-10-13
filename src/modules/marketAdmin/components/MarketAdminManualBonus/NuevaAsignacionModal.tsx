"use client";

import { useState } from "react";
import { Modal } from "antd";
import { Product } from "@/types/products/products";
import { ClienteOption, IGrupoPremio, NuevaAsignacionData } from "@/types/marketAdmin/IMarketAdmin";
import ClienteSearchSelect from "./ClienteSearchSelect";
import GruposBonificadoEditor, { createGrupoBonificado } from "./GruposBonificadoEditor";
import { grupoMaxSelectionQty } from "./buildManualBonusPayload";

const isGrupoValid = (g: IGrupoPremio) =>
  g.productos.length > 0 &&
  g.productos.every((p) => p.productId > 0) &&
  (g.modo === "fijo"
    ? g.productos.every((p) => (g.cantidadesFijas?.[p.id] ?? 0) >= 1)
    : (g.unidadesPool ?? 0) >= 1);

export default function NuevaAsignacionModal({
  cliente: clienteFijo,
  clientes = [],
  productos,
  saving,
  onClose,
  onSave
}: {
  // Cliente preseleccionado (p. ej. desde el detalle del cliente): oculta el buscador.
  cliente?: ClienteOption;
  clientes?: ClienteOption[];
  productos: Product[];
  saving: boolean;
  onClose: () => void;
  onSave: (data: NuevaAsignacionData) => void;
}) {
  const [cliente, setCliente] = useState<ClienteOption | null>(clienteFijo ?? null);
  const [grupos, setGrupos] = useState<IGrupoPremio[]>(() => [createGrupoBonificado("fijo")]);
  const [fechaExpiracion, setFechaExpiracion] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [nota, setNota] = useState("");

  const totalUnidades = grupos.reduce((sum, g) => sum + grupoMaxSelectionQty(g), 0);

  const isValid =
    !!cliente &&
    grupos.length > 0 &&
    grupos.every(isGrupoValid) &&
    !!fechaExpiracion &&
    !!fechaFin &&
    fechaFin >= fechaExpiracion;

  const handleSave = () => {
    if (!isValid || !cliente || saving) return;
    onSave({ cliente, grupos, fechaExpiracion, fechaFin, nota });
  };

  return (
    <Modal
      open
      onCancel={onClose}
      centered
      width={560}
      title={<span className="text-base font-bold text-[#141414]">Crear bonificado</span>}
      styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
      footer={
        <div className="flex gap-3">
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
            {saving ? "Guardando…" : "Crear"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Cliente */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#666666]">Cliente</label>
          {clienteFijo ? (
            <div className="px-3 py-2.5 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg">
              <p className="text-sm text-[#141414]">{clienteFijo.nombre}</p>
              <p className="text-xs text-[#999999]">NIT: {clienteFijo.nit}</p>
            </div>
          ) : (
            <ClienteSearchSelect
              clientes={clientes}
              selectedNit={cliente?.nit ?? ""}
              onSelect={setCliente}
            />
          )}
        </div>

        {/* Productos bonificados (grupos fijos / a elegir) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[#666666]">Productos bonificados</label>
            <span className="text-xs text-[#999999]">
              Total a asignar: <span className="font-semibold text-[#141414]">{totalUnidades}</span>{" "}
              und.
            </span>
          </div>
          <GruposBonificadoEditor grupos={grupos} products={productos} onChange={setGrupos} />
        </div>

        {/* Fechas */}
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Fecha de expiración</label>
            <input
              type="date"
              value={fechaExpiracion}
              onChange={(e) => setFechaExpiracion(e.target.value)}
              className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Fecha de fin</label>
            <input
              type="date"
              value={fechaFin}
              min={fechaExpiracion}
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
    </Modal>
  );
}
