"use client";

import { useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Gift, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { getClientsByProject } from "@/services/banksPayments/banksPayments";
import { getProductsByProject } from "@/services/products/products";
import { createManualBonus } from "@/services/marketAdmin/marketAdmin";
import {
  AsignacionManual,
  ClienteOption,
  EstadoAprobacion,
  NuevaAsignacionData
} from "@/types/marketAdmin/IMarketAdmin";
import AsignacionesFilters from "./AsignacionesFilters";
import AsignacionRow from "./AsignacionRow";
import NuevaAsignacionModal from "./NuevaAsignacionModal";
import { buildManualBonusPayload } from "./buildManualBonusPayload";
import { ASIGNACIONES_INICIALES } from "./mockAsignaciones";

export default function MarketAdminManualBonus({ onBack }: { onBack: () => void }) {
  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const { data: clientsRes } = useSWR(ID ? ["ma-clients", ID] : null, () =>
    getClientsByProject(ID)
  );
  const { data: productsRes } = useSWR(ID ? ["ma-products", ID] : null, () =>
    getProductsByProject(ID)
  );
  // getClientsByProject → [{ [nombreCliente]: nit }] → { nit, nombre }[]
  const clientes: ClienteOption[] = (clientsRes ?? []).map((c) => {
    const nombre = Object.keys(c)[0] ?? "";
    return { nit: String(c[nombre] ?? ""), nombre };
  });
  const productos = productsRes?.data ?? [];

  const [asignaciones, setAsignaciones] = useState<AsignacionManual[]>(ASIGNACIONES_INICIALES);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoAprobacion | "todos">("todos");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCrear = async (data: NuevaAsignacionData) => {
    try {
      setSaving(true);
      await createManualBonus(buildManualBonusPayload(data));
      const nueva: AsignacionManual = {
        id: `a${Date.now()}`,
        clienteId: data.cliente.nit,
        clienteNombre: data.cliente.nombre,
        clienteNit: data.cliente.nit,
        productoBonificadoId: String(data.producto.id),
        productoBonificadoNombre: data.producto.nombre,
        unidadesAsignadas: data.unidades,
        unidadesDisponibles: data.unidades,
        estado: "pendiente",
        creadoEn: new Date().toISOString().split("T")[0],
        nota: data.nota
      };
      setAsignaciones((prev) => [nueva, ...prev]);
      showMessage("success", "Bonificado creado exitosamente.");
      setShowModal(false);
    } catch {
      showMessage("error", "Ocurrió un error al crear el bonificado.");
    } finally {
      setSaving(false);
    }
  };

  const aprobar = (id: string) => {
    setAsignaciones((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "aprobado" } : a)));
  };

  const rechazar = (id: string) => {
    setAsignaciones((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "rechazado" } : a)));
  };

  const filtradas = asignaciones.filter((a) => {
    const matchEstado = filtroEstado === "todos" || a.estado === filtroEstado;
    const matchSearch =
      a.clienteNombre.toLowerCase().includes(search.toLowerCase()) ||
      a.productoBonificadoNombre.toLowerCase().includes(search.toLowerCase());
    return matchEstado && matchSearch;
  });

  const pendientes = asignaciones.filter((a) => a.estado === "pendiente").length;

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-lg overflow-hidden">
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
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#141414]">Bonificados manuales</h1>
                {pendientes > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-700 rounded-full">
                    {pendientes} pendiente{pendientes > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#999999]">
                Asignaciones por cliente con flujo de aprobación
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Plus size={14} /> Nueva asignación
          </button>
        </div>

        {/* Filters */}
        <AsignacionesFilters
          search={search}
          onSearchChange={setSearch}
          filtroEstado={filtroEstado}
          onFiltroChange={setFiltroEstado}
        />

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_80px_80px_100px_120px] px-6 py-3 border-b border-[#EEEEEE] bg-[#FAFAFA]">
          <span className="text-xs font-medium text-[#AAAAAA]">Cliente</span>
          <span className="text-xs font-medium text-[#AAAAAA]">Producto bonificado</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-center">Asignadas</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-center">Disponibles</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-center">Estado</span>
          <span className="text-xs font-medium text-[#AAAAAA] text-right">Acciones</span>
        </div>

        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Gift size={28} className="text-[#DDDDDD]" />
            <p className="text-sm text-[#999999]">No hay asignaciones</p>
          </div>
        ) : (
          filtradas.map((a, idx) => (
            <AsignacionRow
              key={a.id}
              asignacion={a}
              isLast={idx === filtradas.length - 1}
              onAprobar={() => aprobar(a.id)}
              onRechazar={() => rechazar(a.id)}
            />
          ))
        )}
      </div>
      {showModal && (
        <NuevaAsignacionModal
          clientes={clientes}
          productos={productos}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={handleCrear}
        />
      )}
    </div>
  );
}
