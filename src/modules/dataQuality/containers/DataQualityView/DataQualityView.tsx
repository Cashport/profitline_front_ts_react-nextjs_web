import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Spin } from "antd";
import { Users, UserX, Bell, FileText, FileX, Tag, Bot } from "lucide-react";

import { getSummaryCountries } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";
import {
  checkUserComponentPermission,
  canManageAuxiliaries,
  canReadDataQuality,
  cn,
  hasDataQualityManagementPermission
} from "@/utils/utils";
import { DARK_TOOLTIP_ARROW, DARK_TOOLTIP_CONTENT } from "../../constants";

import { Button } from "@/modules/chat/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import Header from "@/components/organisms/header";

import { ISummaryCountries } from "@/types/dataQuality/IDataQuality";
import { AlertsPill } from "../../components/alerts-pill/AlertsPill";
import {
  ITierOption,
  TIER_CODES,
  TIER_META,
  TierSwatch,
  TierQuickFilter,
  useTierFilter
} from "../../tiers";

/** White, borderless header button on the gray page (DESIGN.md §8, same as Clientes). */
const HEADER_BTN =
  "flex h-[var(--control-h)] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-white px-3.5 text-[13px] font-medium text-[#141414] no-underline transition-colors hover:bg-[#f2f2f2] hover:text-[#141414]";

export default function DataQualityView() {
  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const canReadData = canReadDataQuality(selectedProject);
  const canManageAux = canManageAuxiliaries(selectedProject);

  const selectedTiers = useTierFilter((s) => s.selected);
  const tiersKey = selectedTiers.join(",");

  const [summaryData, setSummaryData] = useState<ISummaryCountries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noCountryAccess, setNoCountryAccess] = useState(false);

  const countries = summaryData?.countries || [];
  const totalAlerts = summaryData?.countries.reduce((sum, c) => sum + c.active_alerts, 0) || 0;
  const totalCountries = summaryData?.total_countries || 0;

  // Totals per tier across the visible countries (the breakdown ignores the tier filter).
  const tierOptions: ITierOption[] = TIER_CODES.map((code) => ({
    code,
    name: TIER_META[code].label,
    color: TIER_META[code].color,
    count: countries.reduce(
      (sum, c) => sum + (c.tiers?.find((t) => t.code === code)?.clients ?? 0),
      0
    )
  }));

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsRefreshing(true);
      setError(null);
      setNoCountryAccess(false);
      try {
        const response = await getSummaryCountries(
          ID,
          tiersKey ? (tiersKey.split(",") as typeof selectedTiers) : []
        );
        if (!cancelled) setSummaryData(response);
      } catch (err) {
        if (
          axios.isAxiosError<{ message?: string }>(err) &&
          err.response?.status === 403 &&
          err.response.data?.message === "No tienes alcance de datos asignado para este proyecto"
        ) {
          setNoCountryAccess(true);
          return;
        }
        console.error("Error fetching countries:", err);
        setError("No se pudieron cargar los países. Por favor, intenta de nuevo.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    if (ID && canReadData) {
      fetchData();
    } else {
      setSummaryData(null);
      setError(null);
      setNoCountryAccess(false);
      setIsLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [ID, canReadData, tiersKey]);

  // Rol sin acceso a la vista general (p.ej. Admin Global Aux): no invocar countries-summary
  // y no exponer navegación a países/clientes.
  if (!canReadData) {
    return (
      <div className="cp-page">
        <Header
          title="Data Quality"
          actionsExtra={
            canManageAux && (
              <Link href="/data-quality/auxiliary-catalogs">
                <Button variant="outline" className="text-[#141414]">
                  Auxiliares
                </Button>
              </Link>
            )
          }
        />
        <div className="cp-card p-12 text-center">
          <p className="text-gray-500 text-lg">
            No tienes acceso a la vista general de Data Quality.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="cp-page">
        <Header title="Data Quality" />
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-page">
        <Header title="Data Quality" />
        <div className="cp-card px-[18px] py-[14px] text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (noCountryAccess) {
    return (
      <div className="cp-page">
        <Header title="Data Quality" titleExtra="Países y Distribuidores" />
        <div className="cp-card p-12 text-center">
          <p className="text-gray-500 text-lg">No tienes países asignados</p>
        </div>
      </div>
    );
  }

  if (countries.length === 0 && selectedTiers.length === 0) {
    return (
      <div className="cp-page">
        <Header title="Data Quality" titleExtra="Países y Distribuidores" />
        <div className="cp-card p-12 text-center">
          <p className="text-gray-500 text-lg">
            No hay información disponible para los países asignados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <Header
        className="!pl-0"
        title="Data Quality"
        titleExtra={
          checkUserComponentPermission(selectedProject, "DataQuality", "data-view-alerts") ? (
            <AlertsPill href="/data-quality/alerts" count={totalAlerts} />
          ) : undefined
        }
        actionsExtra={
          <>
            {(hasDataQualityManagementPermission(selectedProject) || canManageAux) && (
              <Link href="/data-quality/auxiliary-catalogs" className={HEADER_BTN}>
                Auxiliares
              </Link>
            )}
            <Link href="/data-quality/monitoring" className={HEADER_BTN}>
              Monitoreo
            </Link>
            {checkUserComponentPermission(
              selectedProject,
              "DataQuality",
              "data-view-dashboard"
            ) && (
              <Link href="/data-quality/dashboard" className={HEADER_BTN}>
                Dashboard
              </Link>
            )}
          </>
        }
      />

      {/* Tier legend and active countries: one line, same gap above and below */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <TierQuickFilter
          options={countries.some((c) => c.tiers) ? tierOptions : undefined}
          className="-ml-[7px]"
        />
        <span className="whitespace-nowrap text-[13px] text-[#6b6b6b]">
          {totalCountries} {totalCountries === 1 ? "país activo" : "países activos"}
        </span>
      </div>

      {countries.length === 0 && (
        <div className="cp-card p-12 text-center">
          <p className="text-[13px] text-[#6b6b6b]">
            No hay clientes {selectedTiers.map((c) => TIER_META[c].label).join(" / ")} en los países
            asignados.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--card-gap)] transition-opacity"
        style={{ opacity: isRefreshing ? 0.55 : 1 }}
      >
        {countries.map((country) => {
          const { automation, missing, catalog } = country.alerts_by_category;
          const pendingClients = country.pending_clients.length;

          // Las categorías que no tienen pill propio (processing, quality y las que sume el backend)
          const otherAlerts = Math.max(0, country.active_alerts - catalog - automation - missing);

          const visiblePendingClients = country.pending_clients.slice(0, 10);
          const listedFileCount = visiblePendingClients.reduce((sum, c) => sum + c.count, 0);
          const remainingFileCount = missing - listedFileCount;

          const visibleAutomationFailures = country.automation_failures.slice(0, 3);
          const remainingAutomationFailures =
            country.automation_failures.length - visibleAutomationFailures.length;

          return (
            <div
              key={country.id_country}
              className="cp-card cursor-pointer px-[18px] py-[14px] space-y-3"
            >
              {/* Header: país + pills de estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-[21px] h-[21px] rounded-full flex items-center justify-center text-[10px] font-semibold text-white bg-[#141414] shrink-0">
                    {country.country_name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#141414]">
                    {country.country_name}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    title="Archivos pendientes"
                    className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[13px] font-medium text-[#6B7280]"
                  >
                    <FileText className="w-3 h-3" />
                    {missing}
                  </span>
                  <span
                    title="Alertas de catálogo"
                    className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[13px] font-medium text-[#6B7280]"
                  >
                    <Tag className="w-3 h-3" />
                    {catalog}
                  </span>
                  <span
                    title="Otras novedades"
                    className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[13px] font-medium text-[#6B7280]"
                  >
                    <Bell className="w-3 h-3" />
                    {otherAlerts}
                  </span>
                  {country.automation_failures.length > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-1.5 py-0.5 text-[13px] font-medium text-[#DC2626]">
                          <Bot className="w-3 h-3" />
                          {country.automation_failures.length}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className={cn(
                          DARK_TOOLTIP_CONTENT,
                          "w-[30rem] space-y-1 rounded-lg px-3 py-2.5"
                        )}
                        arrowClassName={DARK_TOOLTIP_ARROW}
                      >
                        <p className="text-[13px] font-semibold opacity-70">
                          Automatizaciones fallidas
                        </p>
                        <ul className="space-y-1">
                          {visibleAutomationFailures.map((failure, i) => (
                            <li key={i} className="text-[13px]">
                              <span className="font-medium">{failure.name}</span>
                              <br />
                              <span className="opacity-70">{failure.reason}</span>
                            </li>
                          ))}
                        </ul>
                        {remainingAutomationFailures > 0 && (
                          <p className="text-[13px] opacity-70 pt-0.5">
                            +{remainingAutomationFailures} más
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Clasificación: clientes y alertas por tier, en una línea */}
              {country.tiers && country.tiers.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                  {country.tiers
                    .filter((t) => t.code !== "NONE")
                    .map((t) => {
                      const dimmed = selectedTiers.length > 0 && !selectedTiers.includes(t.code);
                      return (
                        <span
                          key={t.code}
                          title={`${TIER_META[t.code].label}: ${t.clients} clientes · ${t.active_alerts} alertas${
                            t.monthly_ingestion_percentage !== null
                              ? ` · ingesta ${t.monthly_ingestion_percentage}%`
                              : ""
                          }`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap transition-opacity"
                          style={{ opacity: dimmed ? 0.35 : 1 }}
                        >
                          <TierSwatch code={t.code} />
                          <span className="text-[#4a4a4a]">{TIER_META[t.code].label}</span>
                          <span className="font-semibold text-[#141414]">{t.clients}</span>
                          {t.active_alerts > 0 && (
                            <span className="inline-flex items-center gap-0.5 font-medium text-[#e5262b]">
                              <Bell className="w-3 h-3" />
                              {t.active_alerts}
                            </span>
                          )}
                        </span>
                      );
                    })}
                </div>
              )}

              {/* Ingesta del mes */}
              <div className="rounded-[10px] bg-[#F5F5F4] px-3 py-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#6B7280]">
                    Ingesta del mes
                    {selectedTiers.length > 0 &&
                      ` · ${selectedTiers.map((c) => TIER_META[c].label).join(" + ")}`}
                  </span>
                  <span className="text-[15px] font-semibold text-[#4D7C0F]">
                    {country.monthly_ingestion_percentage}%
                  </span>
                </div>
                <div className="w-full bg-[#E5E5E3] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all bg-[#7CB805]"
                    style={{ width: `${country.monthly_ingestion_percentage}%` }}
                  />
                </div>
              </div>

              {/* Clientes / Archivos */}
              <div className="grid grid-cols-2 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-[10px] bg-[#F5F5F4] px-3 py-2 space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[13px] text-[#6B7280]">
                          <Users className="w-3 h-3" />
                          Clientes
                        </div>
                        <span className="text-[15px] font-semibold text-[#141414]">
                          {country.total_clients}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[13px] text-[#6B7280]">
                          <UserX className="w-3 h-3" />
                          Pendientes
                        </div>
                        <span
                          className={`text-[15px] font-semibold ${pendingClients > 0 ? "text-[#DC2626]" : "text-[#141414]"}`}
                        >
                          {pendingClients}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {pendingClients > 0 && (
                    <TooltipContent
                      side="bottom"
                      className={cn(DARK_TOOLTIP_CONTENT, "w-56 space-y-1 rounded-lg px-3 py-2.5")}
                      arrowClassName={DARK_TOOLTIP_ARROW}
                    >
                      <p className="text-[13px] font-semibold opacity-70">
                        Clientes con archivos pendientes
                      </p>
                      <ul className="space-y-0.5">
                        {visiblePendingClients.map((c, i) => (
                          <li key={i} className="text-[13px]">
                            {c.client}{" "}
                            <span className="opacity-70">
                              ({c.count} archivo{c.count > 1 ? "s" : ""})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </TooltipContent>
                  )}
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-[10px] bg-[#F5F5F4] px-3 py-2 space-y-1 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[13px] text-[#6B7280]">
                          <FileText className="w-3 h-3" />
                          Archivos
                        </div>
                        <span className="text-[15px] font-semibold text-[#141414]">
                          {country.total_files_expected}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[13px] text-[#6B7280]">
                          <FileX className="w-3 h-3" />
                          Pendientes
                        </div>
                        <span
                          className={`text-[15px] font-semibold ${missing > 0 ? "text-[#DC2626]" : "text-[#141414]"}`}
                        >
                          {missing}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {missing > 0 && (
                    <TooltipContent
                      side="bottom"
                      className={cn(DARK_TOOLTIP_CONTENT, "w-64 space-y-1 rounded-lg px-3 py-2.5")}
                      arrowClassName={DARK_TOOLTIP_ARROW}
                    >
                      <p className="text-[13px] font-semibold opacity-70">
                        Archivos pendientes por cliente
                      </p>
                      <ul className="space-y-0.5">
                        {visiblePendingClients.map((entry, i) => (
                          <li key={i} className="text-[13px]">
                            <span className="opacity-70">{entry.client}:</span> {entry.process_type}
                            {entry.count > 1 && ` (×${entry.count})`}
                          </li>
                        ))}
                      </ul>
                      {remainingFileCount > 0 && (
                        <p className="text-[13px] opacity-70 pt-0.5">
                          +{remainingFileCount} archivos más
                        </p>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>

              <Link href={`/data-quality/country/${country.id_country}`} className="block">
                <Button className="w-full text-[13px] font-medium bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none rounded-full h-8">
                  Ver Clientes
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
