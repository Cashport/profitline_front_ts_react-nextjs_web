"use client";

import { useState } from "react";
import { Plus, Check, X, ArrowLeft, Search, Gift } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type EstadoAprobacion = "pendiente" | "aprobado" | "rechazado";

type AsignacionManual = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteNit: string;
  productoBonificadoId: string;
  productoBonificadoNombre: string;
  unidadesAsignadas: number;
  unidadesDisponibles: number;
  estado: EstadoAprobacion;
  creadoEn: string;
  nota: string;
};

// ── Mock data ──────────────────────────────────────────────────────────────
const CLIENTES_MOCK = [
  { id: "1", nombre: "Clínica Dermatológica Piel Sana", nit: "900.123.456-7" },
  { id: "2", nombre: "Centro Médico Estético Galderma", nit: "800.987.654-3" },
  { id: "3", nombre: "Dermatología Avanzada S.A.S.", nit: "901.234.567-1" },
  { id: "4", nombre: "The Wellness Center Los Cacicazgos", nit: "700.111.222-9" }
];

const PRODUCTOS_BONIFICADOS = [
  { id: "b1", nombre: "SCULPTRA INJPRO 2 VIAL" },
  { id: "b2", nombre: "RESTYLANE SB VITAL LIDO 1ml" },
  { id: "b3", nombre: "RESTYLANE VOLYME 1ml" },
  { id: "b4", nombre: "RESTYLANE REFYNE 1ml" },
  { id: "b5", nombre: "REST LYFT LIDO 1ml" },
  { id: "b6", nombre: "RESTYLANE LIDOCAINA 1ml" },
  { id: "b7", nombre: "RESTYLANE KYSSE 1ml" },
  { id: "b8", nombre: "RESTYLANE DEFYNE 1ml" }
];

const ASIGNACIONES_INICIALES: AsignacionManual[] = [
  {
    id: "a1",
    clienteId: "1",
    clienteNombre: "Clínica Dermatológica Piel Sana",
    clienteNit: "900.123.456-7",
    productoBonificadoId: "b1",
    productoBonificadoNombre: "SCULPTRA INJPRO 2 VIAL",
    unidadesAsignadas: 10,
    unidadesDisponibles: 6,
    estado: "aprobado",
    creadoEn: "2026-04-10",
    nota: "Premio por volumen Q1"
  },
  {
    id: "a2",
    clienteId: "2",
    clienteNombre: "Centro Médico Estético Galderma",
    clienteNit: "800.987.654-3",
    productoBonificadoId: "b2",
    productoBonificadoNombre: "RESTYLANE SB VITAL LIDO 1ml",
    unidadesAsignadas: 5,
    unidadesDisponibles: 5,
    estado: "pendiente",
    creadoEn: "2026-04-18",
    nota: ""
  },
  {
    id: "a3",
    clienteId: "3",
    clienteNombre: "Dermatología Avanzada S.A.S.",
    clienteNit: "901.234.567-1",
    productoBonificadoId: "b7",
    productoBonificadoNombre: "RESTYLANE KYSSE 1ml",
    unidadesAsignadas: 8,
    unidadesDisponibles: 0,
    estado: "rechazado",
    creadoEn: "2026-04-05",
    nota: "Solicitud revisada y rechazada por gerencia"
  }
];

// ── Helpers ────────────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoAprobacion, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-amber-50 text-amber-600 border border-amber-200" },
  aprobado: { label: "Aprobado", className: "bg-green-50 text-green-700 border border-green-200" },
  rechazado: { label: "Rechazado", className: "bg-red-50 text-red-600 border border-red-200" }
};

// ── New assignment modal ───────────────────────────────────────────────────
function NuevaAsignacionModal({
  onClose,
  onSave
}: {
  onClose: () => void;
  onSave: (
    a: Omit<AsignacionManual, "id" | "estado" | "creadoEn" | "unidadesDisponibles">
  ) => void;
}) {
  const [clienteId, setClienteId] = useState("");
  const [productoId, setProductoId] = useState(PRODUCTOS_BONIFICADOS[0].id);
  const [unidades, setUnidades] = useState(1);
  const [nota, setNota] = useState("");
  const [searchCliente, setSearchCliente] = useState("");

  const clientesFiltrados = CLIENTES_MOCK.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) || c.nit.includes(searchCliente)
  );

  const clienteSeleccionado = CLIENTES_MOCK.find((c) => c.id === clienteId);
  const productoSeleccionado = PRODUCTOS_BONIFICADOS.find((p) => p.id === productoId);

  const isValid = clienteId && productoId && unidades > 0;

  const handleSave = () => {
    if (!isValid || !clienteSeleccionado || !productoSeleccionado) return;
    onSave({
      clienteId,
      clienteNombre: clienteSeleccionado.nombre,
      clienteNit: clienteSeleccionado.nit,
      productoBonificadoId: productoId,
      productoBonificadoNombre: productoSeleccionado.nombre,
      unidadesAsignadas: unidades,
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
            <div className="border border-[#DDDDDD] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#EEEEEE]">
                <Search size={13} className="text-[#999999]" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-[#141414] placeholder:text-[#999999]"
                />
              </div>
              <ul className="max-h-36 overflow-y-auto">
                {clientesFiltrados.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setClienteId(c.id)}
                      className={`w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-[#F7F7F7] transition-colors ${clienteId === c.id ? "bg-[#F7F7F7]" : ""}`}
                    >
                      <div className="flex-1">
                        <p className="text-sm text-[#141414]">{c.nombre}</p>
                        <p className="text-xs text-[#999999]">NIT: {c.nit}</p>
                      </div>
                      {clienteId === c.id && <Check size={13} className="text-[#141414]" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Producto bonificado */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Producto bonificado</label>
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className="px-3 py-2.5 text-sm bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg outline-none focus:border-[#141414] transition-colors text-[#141414]"
            >
              {PRODUCTOS_BONIFICADOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
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

          {/* Nota */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#666666]">Nota interna (opcional)</label>
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
            disabled={!isValid}
            className="flex-1 py-2.5 text-sm font-semibold text-[#141414] bg-[#CBE71E] rounded-lg hover:bg-[#b8d11a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Enviar a aprobación
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function MarketAdminManualBonus({ onBack }: { onBack: () => void }) {
  const [asignaciones, setAsignaciones] = useState<AsignacionManual[]>(ASIGNACIONES_INICIALES);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<EstadoAprobacion | "todos">("todos");
  const [search, setSearch] = useState("");

  const handleNueva = (
    data: Omit<AsignacionManual, "id" | "estado" | "creadoEn" | "unidadesDisponibles">
  ) => {
    const nueva: AsignacionManual = {
      ...data,
      id: `a${Date.now()}`,
      estado: "pendiente",
      creadoEn: new Date().toISOString().split("T")[0],
      unidadesDisponibles: data.unidadesAsignadas
    };
    setAsignaciones((prev) => [nueva, ...prev]);
    setShowModal(false);
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
    <div className="flex flex-col h-full bg-[#F7F7F7]">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-b border-[#DDDDDD] flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#999999] hover:text-[#141414] transition-colors">
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
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-[#EEEEEE] flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg">
          <Search size={13} className="text-[#999999]" />
          <input
            type="text"
            placeholder="Buscar cliente o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none bg-transparent text-[#141414] placeholder:text-[#999999] w-56"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["todos", "pendiente", "aprobado", "rechazado"] as const).map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                filtroEstado === e ? "bg-[#141414] text-white" : "text-[#666666] hover:bg-[#F7F7F7]"
              }`}
            >
              {e === "todos" ? "Todos" : ESTADO_CONFIG[e].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_80px_80px_100px_120px] px-5 py-3 border-b border-[#EEEEEE] bg-[#FAFAFA]">
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
            filtradas.map((a, idx) => {
              const cfg = ESTADO_CONFIG[a.estado];
              return (
                <div
                  key={a.id}
                  className={`grid grid-cols-[2fr_1.5fr_80px_80px_100px_120px] items-center px-5 py-4 ${idx < filtradas.length - 1 ? "border-b border-[#F4F4F4]" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-[#141414] truncate" title={a.clienteNombre}>
                      {a.clienteNombre}
                    </p>
                    <p className="text-xs text-[#999999]">NIT: {a.clienteNit}</p>
                  </div>
                  <p
                    className="text-sm text-[#141414] truncate pr-2"
                    title={a.productoBonificadoNombre}
                  >
                    {a.productoBonificadoNombre}
                  </p>
                  <p className="text-sm font-semibold text-[#141414] text-center">
                    {a.unidadesAsignadas}
                  </p>
                  <p
                    className={`text-sm font-semibold text-center ${a.unidadesDisponibles === 0 ? "text-red-400" : "text-green-600"}`}
                  >
                    {a.unidadesDisponibles}
                  </p>
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 text-[11px] font-semibold rounded-lg ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    {a.estado === "pendiente" && (
                      <>
                        <button
                          onClick={() => aprobar(a.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Check size={11} /> Aprobar
                        </button>
                        <button
                          onClick={() => rechazar(a.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X size={11} /> Rechazar
                        </button>
                      </>
                    )}
                    {a.estado !== "pendiente" && (
                      <span className="text-xs text-[#CCCCCC]">{a.creadoEn}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <NuevaAsignacionModal onClose={() => setShowModal(false)} onSave={handleNueva} />
      )}
    </div>
  );
}
