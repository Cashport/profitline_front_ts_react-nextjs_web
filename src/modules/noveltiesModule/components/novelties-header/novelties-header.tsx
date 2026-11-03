"use client";

import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import { fmtActualizado } from "@/modules/walletModule/utils/format";
import NoveltiesFilterModal from "../novelties-filter-modal/novelties-filter-modal";
import type { INoveltiesFilters } from "../../types";

interface NoveltiesHeaderProps {
  /** Última respuesta exitosa del listado; null mientras no llega la primera. */
  fetchedAt: Date | null;
  /** Búsqueda por cliente, factura o ejecutivo; la resuelve el servidor. */
  search: string;
  onSearchChange: (value: string) => void;
  filters: INoveltiesFilters;
  onFiltersChange: (next: INoveltiesFilters) => void;
}

/**
 * Header compartido (docs/DESIGN.md §4): título y última actualización; a la derecha
 * filtros, buscador, tema y avatar (cerrar sesión).
 */
export default function NoveltiesHeader({
  fetchedAt,
  search,
  onSearchChange,
  filters,
  onFiltersChange
}: NoveltiesHeaderProps) {
  return (
    <Header
      title="Novedades"
      titleExtra={
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#9bb514]" />
          {fmtActualizado(fetchedAt, FECHA_CORTE_PLACEHOLDER)}
        </span>
      }
      actionsExtra={
        <>
          <NoveltiesFilterModal inHeader value={filters} onChange={onFiltersChange} />
          <HeaderSearch
            value={search}
            onChange={onSearchChange}
            placeholder="Cliente, factura o ejecutivo…"
          />
        </>
      }
    />
  );
}
