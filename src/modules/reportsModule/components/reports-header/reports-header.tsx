"use client";

import { Upload } from "lucide-react";

import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import type { IReportsFilters, IReportType } from "@/types/reports/IReports";

import ReportsFilterModal from "../reports-filter-modal/reports-filter-modal";

interface ReportsHeaderProps {
  filters: IReportsFilters;
  onFiltersChange: (next: IReportsFilters) => void;
  types: IReportType[];
  /** Búsqueda por nombre del informe (filtra el listado). */
  search: string;
  onSearchChange: (value: string) => void;
  onPublish: () => void;
}

/**
 * Header compartido (docs/DESIGN.md §4): título; a la derecha publicar, chips + Filtrar,
 * buscador y avatar.
 */
export default function ReportsHeader({
  filters,
  onFiltersChange,
  types,
  search,
  onSearchChange,
  onPublish
}: ReportsHeaderProps) {
  return (
    <Header
      title="Informes"
      actionsExtra={
        <>
          <button
            type="button"
            onClick={onPublish}
            className="flex h-[var(--control-h)] shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Publicar informe
          </button>
          <ReportsFilterModal inHeader value={filters} onChange={onFiltersChange} types={types} />
          <HeaderSearch value={search} onChange={onSearchChange} placeholder="Buscar informe" />
        </>
      }
    />
  );
}
