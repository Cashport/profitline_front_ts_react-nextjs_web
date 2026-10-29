"use client";

import { useMemo } from "react";
import useSWR from "swr";

import Header from "@/components/organisms/header";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { getRegions } from "@/services/dataQuality/dataQuality";
import { useFileTypes } from "@/modules/dataQuality/hooks/useFileTypes";
import {
  TabType,
  useDataQualityDashboardContext
} from "@/modules/dataQuality/context/DataQualityDashboardContext";
import { buildLastSixMonths } from "@/modules/dataQuality/utils/months";

export function DashboardHeader() {
  const {
    activeTab,
    setActiveTab,
    selectedRegion,
    setSelectedRegion,
    selectedPeriod,
    setSelectedPeriod,
    selectedFileType,
    setSelectedFileType
  } = useDataQualityDashboardContext();

  const { data: regionsData } = useSWR("dashboard-header-regions", getRegions);
  const { data: fileTypesData } = useFileTypes();

  const regions = useMemo(
    () =>
      (regionsData ?? []).map((r) => ({
        id: String(-r.id),
        name: r.abbreviation
      })),
    [regionsData]
  );

  const fileTypes = useMemo(
    () =>
      (fileTypesData ?? []).map((t) => ({
        id: String(t.id),
        name: t.description
      })),
    [fileTypesData]
  );

  const periods = useMemo(buildLastSixMonths, []);

  return (
    <Header
      title="Dashboard de Ingesta"
      back="/data-quality"
      titleExtra={
        /* Tabs */
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
      }
      actionsExtra={
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Región</span>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger
                className="w-[180px]"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
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
            <Select value={selectedFileType} onValueChange={setSelectedFileType}>
              <SelectTrigger
                className="w-[180px]"
                style={{ borderColor: "#DDDDDD", color: "#141414" }}
              >
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {fileTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      }
    />
  );
}
