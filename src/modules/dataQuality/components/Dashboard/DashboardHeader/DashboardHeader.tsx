"use client";

import { useMemo } from "react";
import useSWR from "swr";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { getAllCountries } from "@/services/countries/countries";
import {
  TabType,
  useDataQualityDashboardContext
} from "@/modules/dataQuality/context/DataQualityDashboardContext";

const SPANISH_MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

const buildLastSixMonths = () => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const name = `${SPANISH_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    return { id, name };
  });
};

export function DashboardHeader() {
  const {
    activeTab,
    setActiveTab,
    selectedCountry,
    setSelectedCountry,
    selectedPeriod,
    setSelectedPeriod,
    selectedFileType,
    setSelectedFileType
  } = useDataQualityDashboardContext();

  const { data: countriesData } = useSWR("dashboard-header-countries", getAllCountries);
  const countries = useMemo(
    () =>
      (countriesData ?? []).map((c) => ({
        id: String(c.id),
        name: c.country_name
      })),
    [countriesData]
  );

  const periods = useMemo(buildLastSixMonths, []);

  return (
    <div
      className="bg-white px-6 py-5 border-b"
      style={{ borderColor: "#DDDDDD", margin: "-1rem -2rem", marginBottom: "0" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold" style={{ color: "#141414" }}>
            Dashboard de Ingesta
          </h1>
          {/* Tabs */}
          <div
            className="flex items-center gap-1 rounded-lg p-1"
            style={{ backgroundColor: "#F3F4F6" }}
          >
            {(["resumen", "detalle"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize"
                style={{
                  backgroundColor: activeTab === tab ? "#ffffff" : "transparent",
                  color: activeTab === tab ? "#111827" : "#6B7280",
                  boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">País</span>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger
                className="w-[180px]"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Periodo</span>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger
                className="w-[140px]"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Tipo de archivo</span>
            {/* TODO: wire options once the API exposes file types */}
            <Select value={selectedFileType} onValueChange={setSelectedFileType} disabled>
              <SelectTrigger
                className="w-[180px]"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
              >
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
