"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "use-intl";
import { Gift, Plus } from "lucide-react";
import Header from "@/components/organisms/header";
import HeaderBackTitle from "../header-back-title/HeaderBackTitle";
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
import { buildManualBonusPayload, summarizeManualBonus } from "./buildManualBonusPayload";
import { ASIGNACIONES_INICIALES } from "./mockAsignaciones";

export default function MarketAdminManualBonus({ onBack }: { onBack: () => void }) {
  const t = useTranslations("marketAdmin.manualBonus");
  const tCommon = useTranslations("common.fields");
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
      const resumen = summarizeManualBonus(data.grupos, productos);
      const nueva: AsignacionManual = {
        id: `a${Date.now()}`,
        clienteId: data.cliente.nit,
        clienteNombre: data.cliente.nombre,
        clienteNit: data.cliente.nit,
        productoBonificadoId: String(data.grupos[0]?.productos[0]?.productId ?? ""),
        productoBonificadoNombre: resumen.productos,
        unidadesAsignadas: resumen.unidades,
        unidadesDisponibles: resumen.unidades,
        estado: "pendiente",
        creadoEn: new Date().toISOString().split("T")[0],
        nota: data.nota
      };
      setAsignaciones((prev) => [nueva, ...prev]);
      showMessage("success", t("feedback.created"));
      setShowModal(false);
    } catch {
      showMessage("error", t("feedback.createError"));
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
    <div className="cp-page min-h-full">
      {/* Header compartido (docs/DESIGN.md §4): volver a la vista anterior + acción principal */}
      <Header
        title={t("title")}
        titleNode={<HeaderBackTitle title={t("title")} onBack={onBack} />}
        titleExtra={
          <>
            <span>{t("subtitle")}</span>
            {pendientes > 0 && (
              <span className="px-2 py-0.5 text-[13px] font-semibold bg-amber-100 text-amber-700 rounded-full">
                {t("pendingCount", { count: pendientes })}
              </span>
            )}
          </>
        }
        actionsExtra={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 h-[var(--control-h)] bg-[#141414] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Plus size={18} /> {t("newAssignment.button")}
          </button>
        }
      />

      <div className="cp-card overflow-hidden">
        {/* Filters */}
        <AsignacionesFilters
          search={search}
          onSearchChange={setSearch}
          filtroEstado={filtroEstado}
          onFiltroChange={setFiltroEstado}
        />

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_80px_80px_100px_120px] px-6 py-3 border-b border-[#EEEEEE] bg-[#FAFAFA]">
          <span className="text-[13px] font-medium text-[#AAAAAA]">{tCommon("customer")}</span>
          <span className="text-[13px] font-medium text-[#AAAAAA]">
            {t("columns.freeGoodsProduct")}
          </span>
          <span className="text-[13px] font-medium text-[#AAAAAA] text-center">
            {t("columns.assigned")}
          </span>
          <span className="text-[13px] font-medium text-[#AAAAAA] text-center">
            {t("columns.available")}
          </span>
          <span className="text-[13px] font-medium text-[#AAAAAA] text-center">
            {tCommon("status")}
          </span>
          <span className="text-[13px] font-medium text-[#AAAAAA] text-right">
            {tCommon("actions")}
          </span>
        </div>

        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Gift size={28} className="text-[#DDDDDD]" />
            <p className="text-sm text-[#999999]">{t("empty")}</p>
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
