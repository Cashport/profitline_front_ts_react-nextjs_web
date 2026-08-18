"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Users } from "lucide-react";
import ProfitLoader from "@/components/ui/profit-loader";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminUserDetail } from "@/modules/marketAdmin/hooks/useMarketAdminUserDetail";
import {
  assignClientToMarketAdminUser,
  removeClientFromMarketAdminUser
} from "@/services/marketAdmin/marketAdmin";
import { ROL_STYLES } from "@/modules/marketAdmin/mocks/users";
import {
  DEFAULT_GRUPOS_USUARIO,
  GRUPOS_POR_USUARIO_INIT
} from "@/modules/marketAdmin/mocks/userGroups";
import ClientesTab from "@/modules/marketAdmin/components/market-admin-user-detail/ClientesTab";
import GruposTab from "@/modules/marketAdmin/components/market-admin-user-detail/GruposTab";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#999999]">{label}</span>
      <span className="text-sm font-bold text-[#141414]">{value}</span>
    </div>
  );
}

export default function MarketAdminUserDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { showMessage } = useMessageApi();

  const { data: usuario, isLoading, error, mutate } = useMarketAdminUserDetail(id);

  const [activeTab, setActiveTab] = useState<"clientes" | "grupos">("clientes");
  const [isSaving, setIsSaving] = useState(false);

  // Los grupos de clientes aún no tienen endpoint de asignación: estado local sobre mocks.
  const [grupos, setGrupos] = useState<string[]>(
    GRUPOS_POR_USUARIO_INIT[id] ?? DEFAULT_GRUPOS_USUARIO
  );

  const asignados = usuario?.clients ?? [];

  const agregarGrupo = (grupoId: string) => setGrupos((prev) => [...prev, grupoId]);
  const quitarGrupo = (grupoId: string) => setGrupos((prev) => prev.filter((g) => g !== grupoId));

  const agregar = async (nit: string) => {
    try {
      setIsSaving(true);
      await assignClientToMarketAdminUser(id, { client_nit: nit });
      await mutate();
      showMessage("success", "Cliente asignado correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al asignar el cliente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const quitar = async (nit: string) => {
    try {
      setIsSaving(true);
      await removeClientFromMarketAdminUser(id, nit);
      await mutate();
      showMessage("success", "Cliente removido correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al quitar el cliente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProfitLoader />
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#999999]">No se pudo cargar el usuario.</p>
      </div>
    );
  }

  const TABS = [
    { id: "clientes", label: `Clientes (${asignados.length})`, icon: Users },
    { id: "grupos", label: `Grupos de clientes (${grupos.length})`, icon: Layers }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">{usuario.name}</h1>

      <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <Link
            href="/market-admin/usuarios"
            className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${ROL_STYLES[usuario.role_name] ?? "bg-[#F5F5F5] text-[#666666]"}`}
          >
            {usuario.role_name || "—"}
          </span>
        </div>

        {/* Información general + Asignaciones */}
        <div className="grid grid-cols-2 divide-x divide-[#EEEEEE]">
          <div className="px-6 py-5 flex flex-col gap-5">
            <p className="text-sm font-bold text-[#141414]">Información general</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" value={usuario.email} />
              <Field label="Estado" value={usuario.is_active === 1 ? "Activo" : "Inactivo"} />
            </div>
          </div>
          <div className="px-6 py-5 flex flex-col gap-5">
            <p className="text-sm font-bold text-[#141414]">Asignaciones</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Clientes asignados" value={String(asignados.length)} />
              <Field label="Rol" value={usuario.role_name || "—"} />
            </div>
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
          {activeTab === "clientes" && (
            <ClientesTab
              clientes={asignados}
              onAgregar={agregar}
              onQuitar={quitar}
              disabled={isSaving}
            />
          )}
          {activeTab === "grupos" && (
            <GruposTab gruposIds={grupos} onAgregar={agregarGrupo} onQuitar={quitarGrupo} />
          )}
        </div>
      </div>
    </div>
  );
}
