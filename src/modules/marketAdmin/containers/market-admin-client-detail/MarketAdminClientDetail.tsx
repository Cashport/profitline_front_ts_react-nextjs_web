"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Tag, Users, MapPin, Settings } from "lucide-react";
import { CLIENTES_MOCK, LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";
import {
  DEFAULT_DIRECCIONES,
  DEFAULT_NEGOCIACIONES,
  DEFAULT_USUARIOS,
  DIRECCIONES_CLIENTE,
  LINEAS_CATALOGO,
  NEGOCIACIONES_INIT,
  PRODUCTOS_INIT,
  USUARIOS_CLIENTE,
  type Direccion,
  type Negociacion,
  type ProductoLinea
} from "@/modules/marketAdmin/mocks/clientDetail";
import DescuentosTab from "@/modules/marketAdmin/components/market-admin-client-detail/DescuentosTab";
import DireccionesTab from "@/modules/marketAdmin/components/market-admin-client-detail/DireccionesTab";
import UsuariosTab from "@/modules/marketAdmin/components/market-admin-client-detail/UsuariosTab";
import ProductosTab from "@/modules/marketAdmin/components/market-admin-client-detail/ProductosTab";
import ConfiguracionesTab, {
  type ConfigForm
} from "@/modules/marketAdmin/components/market-admin-client-detail/ConfiguracionesTab";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#999999]">{label}</span>
      <span className="text-sm font-bold text-[#141414]">{value}</span>
    </div>
  );
}

export default function MarketAdminClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const cliente = CLIENTES_MOCK.find((c) => c.id === id) ?? CLIENTES_MOCK[0];

  // Tab — new order: descuentos, direcciones, usuarios, productos
  const [activeTab, setActiveTab] = useState<
    "descuentos" | "direcciones" | "usuarios" | "productos" | "configuraciones"
  >("descuentos");

  // Persistent data (must survive tab switches — tabs unmount on switch)
  const [configForm, setConfigForm] = useState<ConfigForm>({ cupoCredito: "", tipoPago: "" });
  const [productos, setProductos] = useState<ProductoLinea[]>(PRODUCTOS_INIT[id] ?? []);
  const [negociaciones, setNegociaciones] = useState<Negociacion[]>(
    NEGOCIACIONES_INIT[id] ?? DEFAULT_NEGOCIACIONES
  );
  const [direcciones, setDirecciones] = useState<Direccion[]>(
    DIRECCIONES_CLIENTE[id] ?? DEFAULT_DIRECCIONES
  );
  const [usuarios, setUsuarios] = useState(USUARIOS_CLIENTE[id] ?? DEFAULT_USUARIOS);

  // ── Mutation handlers ─────────────────────────────────────────────────────
  const addDireccion = (values: Omit<Direccion, "id">) =>
    setDirecciones((prev) => [...prev, { id: `dir${Date.now()}`, ...values }]);

  const updateDireccion = (did: string, values: Omit<Direccion, "id">) =>
    setDirecciones((prev) => prev.map((d) => (d.id === did ? { ...d, ...values } : d)));

  const deleteDireccion = (did: string) =>
    setDirecciones((prev) => prev.filter((d) => d.id !== did));

  const createNegociacion = (nueva: Negociacion) => setNegociaciones((prev) => [nueva, ...prev]);

  const removeUsuario = (uid: string) => setUsuarios((prev) => prev.filter((u) => u.id !== uid));

  const toggleProducto = (pid: string) =>
    setProductos((prev) => prev.map((p) => (p.id === pid ? { ...p, activo: !p.activo } : p)));

  const agregarLinea = (linea: string) => {
    if (productos.some((p) => p.linea === linea)) return;
    setProductos((prev) => [
      ...prev,
      ...(LINEAS_CATALOGO[linea] ?? []).map((p) => ({ ...p, linea, activo: true }))
    ]);
  };

  const TABS = [
    { id: "descuentos", label: "Descuentos", icon: Tag },
    { id: "direcciones", label: `Direcciones (${direcciones.length})`, icon: MapPin },
    { id: "usuarios", label: `Usuarios (${usuarios.length})`, icon: Users },
    { id: "productos", label: "Productos", icon: Package },
    { id: "configuraciones", label: "Configuraciones", icon: Settings }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">{cliente.nombre}</h1>

      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <Link
            href="/market-admin/clientes"
            className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              cliente.estado === "Activo"
                ? "bg-[#E6F9E6] text-[#1A7A1A]"
                : "bg-[#EEEEEE] text-[#999999]"
            }`}
          >
            {cliente.estado}
          </span>
        </div>

        {/* Información general */}
        <div className="px-6 pb-6">
          <p className="text-sm font-bold text-[#141414] mb-4">Información general</p>
          <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-6">
            <Field label="NIT" value={cliente.nit} />
            <Field label="Ciudad" value={cliente.ciudad} />
            <Field label="Canal" value={cliente.canal} />
            <Field
              label="Líneas de negocio"
              value={
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {cliente.lineas.map((l) => {
                    const c = LINEA_COLORS[l] ?? { bg: "#AAAAAA", text: "#fff" };
                    return (
                      <span
                        key={l}
                        className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white/30 flex items-center justify-center text-[8px]">
                          {lineaAbrev(l)}
                        </span>
                        {l}
                      </span>
                    );
                  })}
                </div>
              }
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 border-t border-[#F0F0F0]">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setActiveTab(tid as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tid
                  ? "text-[#141414] border-[#141414]"
                  : "text-[#999999] border-transparent hover:text-[#141414]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "descuentos" && (
            <DescuentosTab negociaciones={negociaciones} onCreate={createNegociacion} />
          )}
          {activeTab === "direcciones" && (
            <DireccionesTab
              direcciones={direcciones}
              onAdd={addDireccion}
              onUpdate={updateDireccion}
              onDelete={deleteDireccion}
            />
          )}
          {activeTab === "usuarios" && <UsuariosTab usuarios={usuarios} onRemove={removeUsuario} />}
          {activeTab === "productos" && (
            <ProductosTab
              productos={productos}
              onToggle={toggleProducto}
              onAgregarLinea={agregarLinea}
            />
          )}
          {activeTab === "configuraciones" && (
            <ConfiguracionesTab form={configForm} onChange={setConfigForm} />
          )}
        </div>
      </div>
    </div>
  );
}
