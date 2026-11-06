"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/utils";

import Header from "@/components/organisms/header";
import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterSelection
} from "@/components/ui/filter-modal/FilterModal.types";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import { getRegions } from "@/services/dataQuality/dataQuality";
import { useFileTypes } from "@/modules/dataQuality/hooks/useFileTypes";
import {
  TabType,
  useDataQualityDashboardContext
} from "@/modules/dataQuality/context/DataQualityDashboardContext";
import { buildLastSixMonths } from "@/modules/dataQuality/utils/months";
import { TIER_CODES, TIER_META, TierFilterCode, useTierFilter } from "@/modules/dataQuality/tiers";

const REPORTS: Array<{ key: TabType; name: string; description: string }> = [
  {
    key: "detalle",
    name: "Exploración de unidades",
    description: "Unidades recibidas por cliente y día del mes"
  },
  {
    key: "resumen",
    name: "Resumen de ingesta",
    description: "Indicadores, novedades y estado de ingesta del mes"
  }
];

/** Report switcher as the page title, same pattern as the Torre de control board selector. */
function ReportSelector({
  active,
  onChange
}: {
  active: TabType;
  onChange: (key: TabType) => void;
}) {
  const current = REPORTS.find((r) => r.key === active) ?? REPORTS[0];
  const items: MenuProps["items"] = [
    {
      type: "group",
      key: "reports",
      label: "Informes de Data Quality",
      children: REPORTS.map((r) => ({
        key: r.key,
        label: (
          <span className="grid grid-cols-[1fr_16px] items-center gap-x-2.5 py-0.5">
            <b className="text-[13px] font-semibold">{r.name}</b>
            <Check className={cn("row-span-2 h-4 w-4", r.key !== current.key && "invisible")} />
            <small className="text-[13px] text-[#6b6b6b]">{r.description}</small>
          </span>
        )
      }))
    }
  ];
  return (
    <h1 className="m-0">
      <Dropdown
        trigger={["click"]}
        menu={{
          items,
          onClick: ({ key }) => onChange(key as TabType)
        }}
      >
        <button
          type="button"
          aria-haspopup="menu"
          className="-ml-1.5 flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-1.5 py-0 text-[18px] font-semibold leading-[1.2] text-[#141414] hover:bg-[#ececec]"
        >
          {current.name}
          <ChevronDown className="h-5 w-5 text-[#6b6b6b]" />
        </button>
      </Dropdown>
    </h1>
  );
}

export function DashboardHeader() {
  const {
    activeTab,
    setActiveTab,
    selectedRegion,
    setSelectedRegion,
    selectedPeriod,
    setSelectedPeriod,
    selectedFileType,
    setSelectedFileType,
    search,
    setSearch
  } = useDataQualityDashboardContext();
  const selectedTiers = useTierFilter((s) => s.selected);
  const setSelectedTiers = useTierFilter((s) => s.setSelected);

  const { data: regionsData } = useSWR("dashboard-header-regions", getRegions);
  const { data: fileTypesData } = useFileTypes();

  // Most recent first; the navigator moves through this list.
  const periods = useMemo(buildLastSixMonths, []);
  const periodIdx = Math.max(
    0,
    periods.findIndex((p) => p.id === selectedPeriod)
  );

  const categories: FilterCategoryConfig[] = [
    {
      key: "region",
      label: "Región",
      selectMode: "single",
      options: (regionsData ?? []).map((r) => ({ id: String(-r.id), name: r.abbreviation }))
    },
    // In Detalle the data type is a required switch inside the matrix card.
    ...(activeTab === "resumen"
      ? [
          {
            key: "fileType",
            label: "Tipo de archivo",
            selectMode: "single" as const,
            options: (fileTypesData ?? []).map((t) => ({
              id: String(t.id),
              name: t.description
            }))
          }
        ]
      : []),
    {
      key: "tier",
      label: "Tier",
      options: [...TIER_CODES, "NONE" as const].map((code) => ({
        id: code,
        name: TIER_META[code].label
      }))
    }
  ];

  const nameOf = (key: string, id: string) =>
    categories.find((c) => c.key === key)?.options?.find((o) => o.id === id)?.name ?? id;

  const selection: FilterSelection = {
    region: selectedRegion ? [{ id: selectedRegion, name: nameOf("region", selectedRegion) }] : [],
    fileType:
      activeTab === "resumen" && selectedFileType && selectedFileType !== "all"
        ? [{ id: selectedFileType, name: nameOf("fileType", selectedFileType) }]
        : [],
    tier: selectedTiers.map((code) => ({ id: code, name: TIER_META[code].label }))
  };

  const commit = (next: FilterSelection) => {
    setSelectedRegion(next.region?.[0]?.id ?? "");
    if (activeTab === "resumen") setSelectedFileType(next.fileType?.[0]?.id ?? "all");
    setSelectedTiers((next.tier ?? []).map((o) => o.id as TierFilterCode));
  };

  const navBtn =
    "flex h-7 w-7 items-center justify-center rounded-md text-[#8a8a8a] transition-colors hover:bg-[#f2f2f2] hover:text-[#141414] disabled:cursor-default disabled:text-[#d6d6d6] disabled:hover:bg-transparent";

  return (
    <Header
      title={REPORTS.find((r) => r.key === activeTab)?.name ?? "Dashboard de Ingesta"}
      titleNode={<ReportSelector active={activeTab} onChange={setActiveTab} />}
      back="/data-quality"
      actionsExtra={
        <>
          {/* Period: quiet control next to Filtrar */}
          <div className="flex h-[var(--control-h)] shrink-0 items-center gap-0.5 rounded-lg bg-white px-1">
            <button
              type="button"
              aria-label="Mes anterior"
              className={navBtn}
              disabled={periodIdx >= periods.length - 1}
              onClick={() => setSelectedPeriod(periods[periodIdx + 1].id)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[112px] text-center text-[13px] font-medium text-[#8a8a8a]">
              {periods[periodIdx]?.name}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              className={navBtn}
              disabled={periodIdx === 0}
              onClick={() => setSelectedPeriod(periods[periodIdx - 1].id)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <FilterModal
            inHeader
            categories={categories}
            value={selection}
            onApply={commit}
            onValueChange={commit}
          />
          {activeTab === "detalle" && (
            <HeaderSearch value={search} onChange={setSearch} placeholder="Buscar cliente" />
          )}
        </>
      }
    />
  );
}
