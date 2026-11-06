"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { FilterModal } from "@/components/ui/filter-modal";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";

import { BRANCHES_PATH } from "../../constants";
import { useBranchesFilters } from "../../hooks/use-branches";
import { useBranchesStore } from "../../stores/branches-store";
import { toFilterCategories } from "../../utils/branches";

/* El layout de /branches también envuelve el detalle de la sucursal: estos
   controles solo se muestran en el listado. */

/** A la derecha del encabezado: chips de filtros activos, "Filtrar" y el buscador (DESIGN.md §4). */
export default function BranchesHeaderActions() {
  const pathname = usePathname();
  if (pathname !== BRANCHES_PATH) return null;
  return <HeaderActions />;
}

function HeaderActions() {
  const { filters: options, isLoading } = useBranchesFilters();
  const { search, filters, setSearch, setFilters } = useBranchesStore(
    useShallow((s) => ({
      search: s.search,
      filters: s.filters,
      setSearch: s.setSearch,
      setFilters: s.setFilters
    }))
  );

  const categories = useMemo(() => toFilterCategories(options), [options]);

  return (
    <>
      {/* inHeader: pinta los chips aplicados a la izquierda de "Filtrar", en una línea. */}
      <FilterModal
        inHeader
        categories={categories}
        value={filters}
        onApply={setFilters}
        onValueChange={setFilters}
        isLoading={isLoading}
      />
      <HeaderSearch value={search} onChange={setSearch} placeholder="Buscar cliente, sucursal…" />
    </>
  );
}
