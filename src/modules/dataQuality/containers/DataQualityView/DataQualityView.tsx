import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Spin } from "antd";
import { BellSimpleRinging } from "phosphor-react";
import { Users, UserX, Bell, FileText, FileX, Tag, Bot } from "lucide-react";

import { getSummaryCountries } from "@/services/dataQuality/dataQuality";
import { useAppStore } from "@/lib/store/store";

import { Badge as BadgeUI } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";
import Header from "@/components/organisms/header";

import { ISummaryCountries } from "@/types/dataQuality/IDataQuality";

// TODO(backend): countries-summary no devuelve todavía el desglose de pendientes,
// alertas de catálogo ni automatizaciones fallidas. Los números se renderizan como
// "XX" y estos detalles son datos de ejemplo — borrar este bloque al conectar la API.
const MOCK_PLACEHOLDER = "XX";
const MOCK_PENDING_CLIENTS = [
  { client: "Cliente XX", files: ["Ventas_Mes.xlsx", "Inventario.csv"] },
  { client: "Cliente XX", files: ["Reporte_Ingesta.xlsx"] },
  { client: "Cliente XX", files: ["Stock_Bodega.csv"] }
];
const MOCK_AUTOMATION_FAILURES = [
  { name: "RPA Ingesta XX", reason: "Motivo de falla XX" },
  { name: "Bot Reconciliación XX", reason: "Motivo de falla XX" }
];

// Aplanado a entradas "Cliente: archivo", con el corte a 10 del diseño original
const MOCK_PENDING_FILE_ENTRIES = MOCK_PENDING_CLIENTS.flatMap((c) =>
  c.files.map((file) => ({ client: c.client, file }))
);
const MOCK_VISIBLE_FILE_ENTRIES = MOCK_PENDING_FILE_ENTRIES.slice(0, 10);
const MOCK_REMAINING_FILE_COUNT =
  MOCK_PENDING_FILE_ENTRIES.length - MOCK_VISIBLE_FILE_ENTRIES.length;

export default function DataQualityView() {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [summaryData, setSummaryData] = useState<ISummaryCountries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const countries = summaryData?.countries || [];
  const totalAlerts = summaryData?.countries.reduce((sum, c) => sum + c.active_alerts, 0) || 0;
  const totalCountries = summaryData?.total_countries || 0;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getSummaryCountries(ID);
        setSummaryData(response);
      } catch (err) {
        console.error("Error fetching countries:", err);
        setError("No se pudieron cargar los países. Por favor, intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (ID) {
      fetchData();
    }
  }, [ID]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <div className="bg-white rounded-lg p-6 text-center">
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

  if (countries.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Header title="Data Quality" />
        <h2 className="text-xl font-semibold text-[#141414] mb-6">Países y Distribuidores</h2>
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No hay países configurados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Header title="Data Quality" />
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-4 mb-6">
          <h2 className="text-xl font-semibold text-[#141414]">Países y Distribuidores</h2>
          <BadgeUI variant="secondary" className="text-sm">
            {totalCountries} países activos
          </BadgeUI>
        </div>

        <div className="flex gap-2">
          <Link href="/data-quality/auxiliary-catalogs">
            <Button variant="outline" className="text-[#141414]">
              Auxiliares
            </Button>
          </Link>
          <Link href="/data-quality/alerts">
            <Badge count={totalAlerts} color="#E53935">
              <Button variant="outline">
                <BellSimpleRinging size={18} />
                Alertas
              </Button>
            </Badge>
          </Link>
          <Link href={`/data-quality/dashboard`}>
            <Button className="w-full text-sm font-medium bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {countries.map((country) => (
          <div
            key={country.id_country}
            className="hover:shadow-md transition-shadow cursor-pointer bg-white border border-[#DDDDDD] rounded-xl p-3.5 space-y-3"
          >
            {/* Header: país + pills de estado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#141414] shrink-0">
                  {country.country_iso}
                </div>
                <h3 className="text-sm font-medium text-[#141414]">{country.country_name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <span
                  title="Archivos pendientes"
                  className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]"
                >
                  <FileText className="w-3 h-3" />
                  {MOCK_PLACEHOLDER}
                </span>
                <span
                  title="Alertas de catálogo"
                  className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]"
                >
                  <Tag className="w-3 h-3" />
                  {MOCK_PLACEHOLDER}
                </span>
                <span
                  title="Otras novedades"
                  className="flex items-center gap-1 rounded-full bg-[#F5F5F4] px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280]"
                >
                  <Bell className="w-3 h-3" />
                  {MOCK_PLACEHOLDER}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-1.5 py-0.5 text-[11px] font-medium text-[#DC2626]">
                      <Bot className="w-3 h-3" />
                      {MOCK_PLACEHOLDER}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-64 space-y-1 rounded-lg px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                      Automatizaciones fallidas
                    </p>
                    <ul className="space-y-1">
                      {MOCK_AUTOMATION_FAILURES.map((failure, i) => (
                        <li key={i} className="text-xs">
                          <span className="font-medium">{failure.name}</span>
                          <br />
                          <span className="opacity-70">{failure.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Ingesta del mes */}
            <div className="rounded-xl bg-[#F5F5F4] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Ingesta del mes</span>
                <span className="text-lg font-bold text-[#4D7C0F]">
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
                  <div className="rounded-xl bg-[#F5F5F4] p-3 space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <Users className="w-3 h-3" />
                        Clientes
                      </div>
                      <span className="text-lg font-bold text-[#141414]">
                        {country.total_clients}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <UserX className="w-3 h-3" />
                        Pendientes
                      </div>
                      <span className="text-lg font-bold text-[#141414]">{MOCK_PLACEHOLDER}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-56 space-y-1 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    Clientes con archivos pendientes
                  </p>
                  <ul className="space-y-0.5">
                    {MOCK_PENDING_CLIENTS.map((c, i) => (
                      <li key={i} className="text-xs">
                        {c.client}{" "}
                        <span className="opacity-70">
                          ({c.files.length} archivo{c.files.length > 1 ? "s" : ""})
                        </span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-xl bg-[#F5F5F4] p-3 space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <FileText className="w-3 h-3" />
                        Archivos
                      </div>
                      <span className="text-lg font-bold text-[#141414]">{MOCK_PLACEHOLDER}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                        <FileX className="w-3 h-3" />
                        Pendientes
                      </div>
                      <span className="text-lg font-bold text-[#141414]">{MOCK_PLACEHOLDER}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-64 space-y-1 rounded-lg px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                    Archivos pendientes por cliente
                  </p>
                  <ul className="space-y-0.5">
                    {MOCK_VISIBLE_FILE_ENTRIES.map((entry, i) => (
                      <li key={i} className="text-xs">
                        <span className="opacity-70">{entry.client}:</span> {entry.file}
                      </li>
                    ))}
                  </ul>
                  {MOCK_REMAINING_FILE_COUNT > 0 && (
                    <p className="text-xs opacity-70 pt-0.5">
                      +{MOCK_REMAINING_FILE_COUNT} archivos más
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </div>

            <Link href={`/data-quality/country/${country.id_country}`} className="block">
              <Button className="w-full text-xs font-medium bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none rounded-full h-8">
                Ver Clientes
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
