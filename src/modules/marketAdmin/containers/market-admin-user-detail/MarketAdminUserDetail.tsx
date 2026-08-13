"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProfitLoader from "@/components/ui/profit-loader";
import { useDebounce } from "@/hooks/useDeabouce";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminUserDetail } from "@/modules/marketAdmin/hooks/useMarketAdminUserDetail";
import { useMarketAdminClients } from "@/modules/marketAdmin/hooks/useMarketAdminClients";
import {
  assignClientToMarketAdminUser,
  removeClientFromMarketAdminUser
} from "@/services/marketAdmin/marketAdmin";
import { ROL_STYLES } from "@/modules/marketAdmin/mocks/users";
import ClientesAsignadosTable from "@/modules/marketAdmin/components/market-admin-user-detail/ClientesAsignadosTable";
import AgregarClientesTable from "@/modules/marketAdmin/components/market-admin-user-detail/AgregarClientesTable";

const PAGE_SIZE = 10;

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

  const [search, setSearch] = useState("");
  const [clientesPage, setClientesPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const {
    data: clientes,
    pagination,
    isLoading: isLoadingClientes
  } = useMarketAdminClients({
    page: clientesPage,
    limit: PAGE_SIZE,
    search: debouncedSearch
  });

  const asignados = usuario?.clients ?? [];
  const asignadosNits = new Set(asignados.map((c) => c.nit));
  const disponibles = clientes.filter((c) => !asignadosNits.has(c.client_id));

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
        <div className="grid grid-cols-2 divide-x divide-[#EEEEEE] border-b border-[#EEEEEE]">
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

        <div className="p-6 flex flex-col gap-6">
          <ClientesAsignadosTable clientes={asignados} onQuitar={quitar} disabled={isSaving} />
          <div className="border-t border-[#EEEEEE]" />
          <AgregarClientesTable
            clientes={disponibles}
            onAgregar={agregar}
            onSearchChange={(value) => {
              setSearch(value);
              setClientesPage(1);
            }}
            page={clientesPage}
            total={pagination.totalRows}
            pageSize={PAGE_SIZE}
            onPageChange={setClientesPage}
            isLoading={isLoadingClientes}
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
