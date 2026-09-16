"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Package, Tag, Users, MapPin, Settings } from "lucide-react";
import ProfitLoader from "@/components/ui/profit-loader";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { LINEA_COLORS, lineaAbrev } from "@/modules/marketAdmin/mocks/clients";
import { useMarketAdminClientDetail } from "@/modules/marketAdmin/hooks/useMarketAdminClientDetail";
import { useMarketAdminClientDiscounts } from "@/modules/marketAdmin/hooks/useMarketAdminClientDiscounts";
import { useMarketAdminClientBonifications } from "@/modules/marketAdmin/hooks/useMarketAdminClientBonifications";
import { useMarketAdminClientAddresses } from "@/modules/marketAdmin/hooks/useMarketAdminClientAddresses";
import { useMarketAdminClientUsers } from "@/modules/marketAdmin/hooks/useMarketAdminClientUsers";
import { useMarketAdminClientConfig } from "@/modules/marketAdmin/hooks/useMarketAdminClientConfig";
import { useMarketAdminClientProducts } from "@/modules/marketAdmin/hooks/useMarketAdminClientProducts";
import {
  createManualBonus,
  createMarketAdminClientAddress,
  deleteMarketAdminClientAddress,
  updateMarketAdminClientAddress,
  updateMarketAdminClientConfig
} from "@/services/marketAdmin/marketAdmin";
import { getProductsByProject } from "@/services/products/products";
import { changeStatus } from "@/services/discount/discount.service";
import {
  ICreateMarketAdminClientAddressBody,
  IUpdateMarketAdminClientConfigBody,
  NuevaAsignacionData
} from "@/types/marketAdmin/IMarketAdmin";
import { buildManualBonusPayload } from "@/modules/marketAdmin/components/MarketAdminManualBonus/buildManualBonusPayload";
import PromocionesTab from "@/modules/marketAdmin/components/market-admin-client-detail/PromocionesTab";
import DireccionesTab from "@/modules/marketAdmin/components/market-admin-client-detail/DireccionesTab";
import UsuariosTab from "@/modules/marketAdmin/components/market-admin-client-detail/UsuariosTab";
import ProductosTab from "@/modules/marketAdmin/components/market-admin-client-detail/ProductosTab";
import ConfiguracionesTab from "@/modules/marketAdmin/components/market-admin-client-detail/ConfiguracionesTab";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#999999]">{label}</span>
      <span className="text-sm font-bold text-[#141414]">{value}</span>
    </div>
  );
}

const splitLineas = (lineas: string | null | undefined) =>
  lineas
    ?.split(",")
    .map((l) => l.trim())
    .filter(Boolean) ?? [];

export default function MarketAdminClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { showMessage } = useMessageApi();
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  // Tab — new order: promociones, direcciones, usuarios, productos
  const [activeTab, setActiveTab] = useState<
    "promociones" | "direcciones" | "usuarios" | "productos" | "configuraciones"
  >("promociones");

  const { data: cliente, isLoading, error } = useMarketAdminClientDetail(id);
  const {
    data: direcciones,
    isLoading: isLoadingDirecciones,
    mutate: mutateDirecciones
  } = useMarketAdminClientAddresses(id);
  const { data: usuarios, isLoading: isLoadingUsuarios } = useMarketAdminClientUsers(id);
  const {
    data: config,
    isLoading: isLoadingConfig,
    mutate: mutateConfig
  } = useMarketAdminClientConfig(id);
  const { data: productos, isLoading: isLoadingProductos } = useMarketAdminClientProducts(id);

  // Los descuentos se consultan por el NIT que devuelve el detalle, no por el id de ruta.
  const {
    data: descuentos,
    isLoading: isLoadingDescuentos,
    mutate: mutateDescuentos
  } = useMarketAdminClientDiscounts(cliente?.nit);

  // Catálogo del proyecto para el select de producto bonificado (misma fuente que
  // la pantalla general de bonificados manuales).
  const { data: bonusProductsRes } = useSWR(projectId ? ["ma-products", projectId] : null, () =>
    getProductsByProject(projectId)
  );
  const bonusProducts = bonusProductsRes?.data ?? [];

  // Bonificados manuales del cliente, también consultados por NIT.
  const {
    data: bonificaciones,
    isLoading: isLoadingBonificados,
    mutate: mutateBonificados
  } = useMarketAdminClientBonifications(cliente?.nit);

  // ── Mutation handlers ─────────────────────────────────────────────────────
  // Muestran el mensaje de error y lo relanzan para que el tab no cierre el modal.
  const addDireccion = async (values: ICreateMarketAdminClientAddressBody) => {
    try {
      await createMarketAdminClientAddress(id, values);
      await mutateDirecciones();
      showMessage("success", "Dirección creada correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al crear la dirección."
      );
      throw err;
    }
  };

  const updateDireccion = async (
    addressId: number,
    values: ICreateMarketAdminClientAddressBody
  ) => {
    try {
      await updateMarketAdminClientAddress(id, addressId, values);
      await mutateDirecciones();
      showMessage("success", "Dirección actualizada correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al actualizar la dirección."
      );
      throw err;
    }
  };

  const deleteDireccion = async (addressId: number) => {
    try {
      await deleteMarketAdminClientAddress(id, addressId);
      await mutateDirecciones();
      showMessage("success", "Dirección eliminada correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al eliminar la dirección."
      );
      throw err;
    }
  };

  const createBonificado = async (data: NuevaAsignacionData) => {
    try {
      await createManualBonus(buildManualBonusPayload(data));
      await mutateBonificados();
      showMessage("success", "Bonificado creado exitosamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al crear el bonificado."
      );
      throw err;
    }
  };

  const toggleDescuento = async (discountId: number, newStatus: boolean) => {
    // Optimistic: flip the row locally, roll back with a revalidate if the API fails
    mutateDescuentos(
      (prev) =>
        prev && {
          ...prev,
          data: prev.data.map((d) =>
            d.id === discountId ? { ...d, status: newStatus ? 1 : 0 } : d
          )
        },
      { revalidate: false }
    );
    try {
      const res = await changeStatus(discountId, newStatus);
      if (!res.success) throw new Error(res.message);
      showMessage("success", `Descuento ${newStatus ? "activado" : "desactivado"} con éxito.`);
    } catch (err) {
      mutateDescuentos();
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al cambiar el estado."
      );
    }
  };

  const saveConfig = async (body: IUpdateMarketAdminClientConfigBody) => {
    try {
      await updateMarketAdminClientConfig(id, body);
      await mutateConfig();
      showMessage("success", "Configuración actualizada correctamente.");
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al actualizar la configuración."
      );
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ProfitLoader />
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[#999999]">No se pudo cargar el cliente.</p>
      </div>
    );
  }

  const direccionesCount = isLoadingDirecciones ? cliente.addresses_count : direcciones.length;
  const usuariosCount = isLoadingUsuarios ? cliente.users_count : usuarios.length;
  const productosCount = isLoadingProductos
    ? cliente.products_count
    : productos.reduce((n, c) => n + c.products.length, 0);

  const TABS = [
    { id: "promociones", label: "Promociones", icon: Tag },
    { id: "direcciones", label: `Direcciones (${direccionesCount})`, icon: MapPin },
    { id: "usuarios", label: `Usuarios (${usuariosCount})`, icon: Users },
    { id: "productos", label: `Productos (${productosCount})`, icon: Package },
    { id: "configuraciones", label: "Configuraciones", icon: Settings }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">{cliente.client_name}</h1>

      <div className="bg-white rounded-lg overflow-hidden p-8 flex flex-col gap-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/market-admin/clientes"
            className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              cliente.is_active === 1
                ? "bg-[#E6F9E6] text-[#1A7A1A]"
                : "bg-[#EEEEEE] text-[#999999]"
            }`}
          >
            {cliente.is_active === 1 ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Información general */}
        <div>
          <p className="text-sm font-bold text-[#141414] mb-4">Información general</p>
          <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-6">
            <Field label="NIT" value={cliente.nit} />
            {/* TODO: el detalle aún no devuelve la ciudad — pendiente en backend */}
            <Field label="Ciudad" value={cliente.city || "—"} />
            <Field label="Canal" value={cliente.bu || "—"} />
            <Field
              label="Líneas de negocio"
              value={
                <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                  {splitLineas(cliente.lineas).map((l) => {
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
        <div className="flex items-center gap-0 border-t border-[#F0F0F0]">
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
        <div>
          {activeTab === "promociones" && (
            <PromocionesTab
              descuentos={descuentos}
              isLoadingDescuentos={isLoadingDescuentos}
              onToggleDescuento={toggleDescuento}
              bonificados={bonificaciones?.groups ?? []}
              bonificadosTotals={bonificaciones?.totals}
              isLoadingBonificados={isLoadingBonificados}
              cliente={{ nit: cliente.nit, nombre: cliente.client_name }}
              productos={bonusProducts}
              onCreateBonificado={createBonificado}
            />
          )}
          {activeTab === "direcciones" && (
            <DireccionesTab
              direcciones={direcciones}
              isLoading={isLoadingDirecciones}
              onAdd={addDireccion}
              onUpdate={updateDireccion}
              onDelete={deleteDireccion}
            />
          )}
          {activeTab === "usuarios" && (
            <UsuariosTab usuarios={usuarios} isLoading={isLoadingUsuarios} />
          )}
          {activeTab === "productos" && (
            <ProductosTab categorias={productos} isLoading={isLoadingProductos} />
          )}
          {activeTab === "configuraciones" && (
            <ConfiguracionesTab config={config} isLoading={isLoadingConfig} onSave={saveConfig} />
          )}
        </div>
      </div>
    </div>
  );
}
