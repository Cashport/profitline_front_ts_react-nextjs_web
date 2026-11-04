"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Globe, Layers, Settings, Users } from "lucide-react";
import { useTranslations } from "use-intl";
import ProfitLoader from "@/components/ui/profit-loader";
import { useMessageApi } from "@/context/MessageContext";
import { useMarketAdminUserDetail } from "@/modules/marketAdmin/hooks/useMarketAdminUserDetail";
import { useMarketAdminFacturadores } from "@/modules/marketAdmin/hooks/useMarketAdminFacturadores";
import { useMarketAdminUserProductCategories } from "@/modules/marketAdmin/hooks/useMarketAdminUserProductCategories";
import {
  assignClientToMarketAdminUser,
  assignMarketAdminUserBiller,
  removeClientFromMarketAdminUser,
  removeMarketAdminUserBiller,
  updateMarketAdminUserProductCategories
} from "@/services/marketAdmin/marketAdmin";
import { ROL_STYLES } from "@/modules/marketAdmin/mocks/users";
import { useClientsGroupsSimplified } from "@/hooks/useClientsGroupsSimplified";
import { getGroupsByUser, getUserById, updateUserCountries } from "@/services/users/users";
import {
  addUserToClientGroups,
  removeUserFromClientGroups
} from "@/services/groupClients/groupClients";
import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { ICountries } from "@/types/countries/ICountries";
import { checkUserViewPermissions } from "@/utils/utils";
import ClientesTab from "@/modules/marketAdmin/components/market-admin-user-detail/ClientesTab";
import GruposTab from "@/modules/marketAdmin/components/market-admin-user-detail/GruposTab";
import PaisesSection from "@/modules/marketAdmin/components/market-admin-user-detail/PaisesSection";
import ConfiguracionFacturadorTab from "@/modules/marketAdmin/components/market-admin-user-detail/ConfiguracionFacturadorTab";
import LineasCategoriasSection from "@/modules/marketAdmin/components/market-admin-user-detail/LineasCategoriasSection";
import Header from "@/components/organisms/header";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] text-[#999999]">{label}</span>
      <span className="text-sm font-bold text-[#141414]">{value}</span>
    </div>
  );
}

export default function MarketAdminUserDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const t = useTranslations("marketAdmin.userDetail");
  const tCommon = useTranslations("common");
  const { showMessage } = useMessageApi();
  const selectedProject = useAppStore((state) => state.selectedProject);
  const projectId = selectedProject.ID;
  const canManageUserCountries = checkUserViewPermissions(selectedProject, "MarketAdmin");

  const { data: usuario, isLoading, error, mutate } = useMarketAdminUserDetail(id);
  const { data: allGrupos } = useClientsGroupsSimplified();

  // El facturador se puede asignar a cualquier usuario, sin importar su rol.
  const { data: facturadores, isLoading: isLoadingFacturadores } =
    useMarketAdminFacturadores(!!usuario);
  const {
    data: productLines,
    isLoading: isLoadingProductLines,
    error: productLinesError,
    mutate: mutateProductLines
  } = useMarketAdminUserProductCategories(id);
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  const [activeTab, setActiveTab] = useState<"clientes" | "grupos" | "paises" | "configuraciones">(
    "clientes"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBiller, setIsSavingBiller] = useState(false);
  const [isSavingGrupos, setIsSavingGrupos] = useState(false);
  const [grupos, setGrupos] = useState<number[]>([]);
  const [gruposLoaded, setGruposLoaded] = useState(false);
  const [gruposError, setGruposError] = useState<string | null>(null);

  const loadGrupos = useCallback(async () => {
    if (!usuario?.id || !projectId) return;
    setGruposError(null);
    setGruposLoaded(false);
    try {
      const response = await getGroupsByUser(usuario.id, projectId);
      setGrupos(response.data.map((g: { group_id: number }) => g.group_id));
    } catch (error) {
      setGruposError(error instanceof Error ? error.message : t("feedback.groupsLoadError"));
    } finally {
      setGruposLoaded(true);
    }
  }, [usuario?.id, projectId, t]);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  // Los países asignados viven en data.user_data_scope y no vienen en el detalle
  // de marketplace-admin, así que se piden al endpoint genérico de usuario.
  const [countryIds, setCountryIds] = useState<number[]>([]);
  const [paisesLoaded, setPaisesLoaded] = useState(false);
  const [paisesError, setPaisesError] = useState<string | null>(null);
  const [isSavingPaises, setIsSavingPaises] = useState(false);
  const paisesLoadRequest = useRef(0);
  const {
    data: countriesData,
    isLoading: isLoadingCountries,
    error: countriesError,
    mutate: reloadCountries
  } = useSWR<ICountries>(
    projectId && canManageUserCountries ? `/country?project_id=${projectId}` : null,
    fetcher
  );
  const allPaises = countriesData?.data ?? [];

  const loadPaises = useCallback(async () => {
    if (!canManageUserCountries || !usuario?.id || !projectId) return false;

    const requestId = ++paisesLoadRequest.current;
    setPaisesLoaded(false);
    setPaisesError(null);
    try {
      const response = await getUserById(`${usuario.id}`);
      if (requestId !== paisesLoadRequest.current) return false;
      setCountryIds(response.data.COUNTRY_IDS);
      return true;
    } catch (error) {
      if (requestId !== paisesLoadRequest.current) return false;
      setPaisesError(error instanceof Error ? error.message : t("feedback.userCountriesLoadError"));
      return false;
    } finally {
      if (requestId === paisesLoadRequest.current) {
        setPaisesLoaded(true);
      }
    }
  }, [canManageUserCountries, projectId, usuario?.id, t]);

  useEffect(() => {
    if (canManageUserCountries && usuario?.id && projectId) {
      setCountryIds([]);
      void loadPaises();
    } else {
      paisesLoadRequest.current += 1;
      setCountryIds([]);
      setPaisesLoaded(true);
    }
  }, [canManageUserCountries, loadPaises, projectId, usuario?.id]);

  useEffect(() => {
    if (!canManageUserCountries && activeTab === "paises") {
      setActiveTab("clientes");
    }
  }, [activeTab, canManageUserCountries]);

  const asignados = usuario?.clients ?? [];

  const agregarGrupo = async (grupoIds: number[]) => {
    if (!usuario) return false;
    const prev = grupos;
    setGrupos((p) => [...p, ...grupoIds]);
    try {
      setIsSavingGrupos(true);
      await addUserToClientGroups(grupoIds, projectId, usuario.id);
      showMessage("success", t("feedback.groupsAdded", { count: grupoIds.length }));
      await loadGrupos();
      return true;
    } catch (err) {
      setGrupos(prev);
      showMessage("error", err instanceof Error ? err.message : t("feedback.groupAddError"));
      return false;
    } finally {
      setIsSavingGrupos(false);
    }
  };

  const quitarGrupo = async (grupoId: number) => {
    if (!usuario) return;
    const prev = grupos;
    setGrupos((p) => p.filter((g) => g !== grupoId));
    try {
      setIsSavingGrupos(true);
      await removeUserFromClientGroups([grupoId], projectId, usuario.id);
      showMessage("success", t("feedback.groupRemoved"));
      await loadGrupos();
    } catch (err) {
      setGrupos(prev);
      showMessage("error", err instanceof Error ? err.message : t("feedback.groupRemoveError"));
    } finally {
      setIsSavingGrupos(false);
    }
  };

  const agregarPaises = async (ids: number[]) => {
    if (!usuario) return false;
    const prev = countryIds;
    const next = Array.from(new Set([...countryIds, ...ids]));
    setCountryIds(next);
    try {
      setIsSavingPaises(true);
      await updateUserCountries(usuario.id, projectId, next);
      const reloaded = await loadPaises();
      showMessage(
        reloaded ? "success" : "error",
        reloaded
          ? t("feedback.countriesAdded", { count: ids.length })
          : t("feedback.countrySavedReloadError")
      );
      return true;
    } catch (err) {
      setCountryIds(prev);
      showMessage("error", err instanceof Error ? err.message : t("feedback.countryAddError"));
      return false;
    } finally {
      setIsSavingPaises(false);
    }
  };

  const quitarPais = async (countryId: number) => {
    if (!usuario) return;
    const prev = countryIds;
    const next = countryIds.filter((cid) => cid !== countryId);
    setCountryIds(next);
    try {
      setIsSavingPaises(true);
      await updateUserCountries(usuario.id, projectId, next);
      const reloaded = await loadPaises();
      showMessage(
        reloaded ? "success" : "error",
        reloaded ? t("feedback.countryRemoved") : t("feedback.countryRemovedReloadError")
      );
    } catch (err) {
      setCountryIds(prev);
      showMessage("error", err instanceof Error ? err.message : t("feedback.countryRemoveError"));
    } finally {
      setIsSavingPaises(false);
    }
  };

  const agregar = async (nits: string[]) => {
    try {
      setIsSaving(true);
      await assignClientToMarketAdminUser(id, { client_nits: nits });
      await mutate();
      showMessage("success", t("feedback.customersAssigned", { count: nits.length }));
      return true;
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("feedback.customerAssignError"));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const quitar = async (nit: string) => {
    try {
      setIsSaving(true);
      await removeClientFromMarketAdminUser(id, nit);
      await mutate();
      showMessage("success", t("feedback.customerRemoved"));
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("feedback.customerRemoveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const saveBiller = async (billerUserId: number | null) => {
    try {
      setIsSavingBiller(true);
      if (billerUserId === null) {
        await removeMarketAdminUserBiller(id);
      } else {
        await assignMarketAdminUserBiller(id, billerUserId);
      }
      await mutate();
      // Refresca el listado para que la columna "Facturador" quede sincronizada.
      await globalMutate(
        (key) => typeof key === "string" && key.startsWith("/marketplace-admin/users"),
        undefined,
        { revalidate: true }
      );
      showMessage(
        "success",
        billerUserId === null ? t("feedback.billerRemoved") : t("feedback.billerUpdated")
      );
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : t("feedback.billerUpdateError"));
    } finally {
      setIsSavingBiller(false);
    }
  };

  const saveProductCategories = async (categoryIds: number[]) => {
    try {
      setIsSavingCategories(true);
      await updateMarketAdminUserProductCategories(id, categoryIds);
      await mutateProductLines();
      showMessage("success", t("feedback.categoriesUpdated"));
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : t("feedback.categoriesUpdateError")
      );
    } finally {
      setIsSavingCategories(false);
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
        <p className="text-sm text-[#999999]">{t("loadError")}</p>
      </div>
    );
  }

  const TABS = [
    { id: "clientes", label: t("tabs.customers", { count: asignados.length }), icon: Users },
    { id: "grupos", label: t("tabs.customerGroups", { count: grupos.length }), icon: Layers },
    ...(canManageUserCountries
      ? [{ id: "paises", label: t("tabs.countries", { count: countryIds.length }), icon: Globe }]
      : []),
    { id: "configuraciones", label: t("tabs.settings"), icon: Settings }
  ];

  return (
    <div className="cp-page min-h-full">
      {/* Volver y rol van en el header compartido (docs/DESIGN.md §4) */}
      <Header
        title={usuario.name}
        back="/market-admin/users"
        actionsExtra={
          <span
            className={`text-[13px] font-semibold px-3 py-1 rounded-full ${ROL_STYLES[usuario.role_name] ?? "bg-[#F5F5F5] text-[#666666]"}`}
          >
            {usuario.role_name || "—"}
          </span>
        }
      />

      <div className="cp-card cp-list-card overflow-hidden px-[18px] py-[14px] flex flex-col gap-8">
        {/* Información general + Asignaciones */}
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-5">
            <p className="text-sm font-bold text-[#141414]">{t("generalInfo")}</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label={tCommon("fields.email")} value={usuario.email} />
              <Field
                label={tCommon("fields.status")}
                value={
                  usuario.is_active === 1 ? tCommon("status.active") : tCommon("status.inactive")
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-sm font-bold text-[#141414]">{t("assignments")}</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("assignedCustomers")} value={String(asignados.length)} />
              <Field label={t("role")} value={usuario.role_name || "—"} />
            </div>
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
        <div className="cp-fill">
          {activeTab === "clientes" && (
            <div className="cp-fill">
              <ClientesTab
                clientes={asignados}
                onAgregar={agregar}
                onQuitar={quitar}
                isLoading={isSaving}
                disabled={isSaving}
              />
            </div>
          )}
          {activeTab === "paises" && canManageUserCountries && (
            <PaisesSection
              asignadosIds={countryIds}
              allPaises={allPaises}
              loading={!paisesLoaded || isLoadingCountries}
              error={paisesError || (countriesError ? t("feedback.countryCatalogLoadError") : null)}
              onRetry={() => {
                void loadPaises();
                reloadCountries().catch((error) => {
                  setPaisesError(
                    error instanceof Error ? error.message : t("feedback.countriesLoadError")
                  );
                });
              }}
              disabled={isSavingPaises}
              onAgregar={agregarPaises}
              onQuitar={quitarPais}
            />
          )}
          {activeTab === "grupos" &&
            (gruposError ? (
              <div role="alert">
                <p className="text-red-600">{gruposError}</p>
                <button onClick={loadGrupos} className="mt-2 text-sm underline">
                  {tCommon("actions.retry")}
                </button>
              </div>
            ) : (
              <GruposTab
                asignadosIds={grupos}
                allGrupos={allGrupos ?? []}
                loading={!gruposLoaded}
                disabled={isSavingGrupos}
                onAgregar={agregarGrupo}
                onQuitar={quitarGrupo}
              />
            ))}
          {activeTab === "configuraciones" && (
            <div className="cp-list-scroll space-y-10 pr-1">
              <ConfiguracionFacturadorTab
                currentBillerId={usuario.biller_id}
                facturadores={facturadores}
                isLoading={isLoadingFacturadores}
                isSaving={isSavingBiller}
                onSave={saveBiller}
              />
              <LineasCategoriasSection
                lines={productLines}
                loading={isLoadingProductLines}
                error={productLinesError ? t("feedback.linesLoadError") : null}
                isSaving={isSavingCategories}
                onRetry={() => void mutateProductLines()}
                onSave={saveProductCategories}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
