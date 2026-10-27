"use client";

import { Upload } from "lucide-react";

import { ProfileMenu } from "@/components/atoms/ProfileMenu/ProfileMenu";
import UiSearchInput from "@/components/ui/search-input";
import type { IReportsFilters, IReportType } from "@/types/reports/IReports";

import ReportsFilterModal from "../reports-filter-modal/reports-filter-modal";

interface ReportsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: IReportsFilters;
  onFiltersChange: (next: IReportsFilters) => void;
  types: IReportType[];
  onPublish: () => void;
}

/** Barra superior del listado: título, búsqueda, filtros, publicar y perfil. */
export default function ReportsHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  types,
  onPublish
}: ReportsHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 pb-3 max-[768px]:px-2">
      <h1 className="text-2xl font-semibold text-foreground">Informes</h1>

      <UiSearchInput
        id="reports-search"
        showBorder
        placeholder="Buscar informe"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <ReportsFilterModal value={filters} onChange={onFiltersChange} types={types} />

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onPublish}
          className="flex h-12 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Publicar informe
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
