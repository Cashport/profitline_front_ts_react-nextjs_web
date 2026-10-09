"use client";

import UiSearchInput from "@/components/ui/search-input";
import { FECHA_CORTE_PLACEHOLDER } from "@/modules/walletModule/constants";
import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
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

/** Barra superior de la bandeja: título, última actualización, búsqueda, filtros y tema. */
export default function NoveltiesHeader({
  fetchedAt,
  search,
  onSearchChange,
  filters,
  onFiltersChange
}: NoveltiesHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
      <h1 className="text-base font-semibold text-foreground">Novedades</h1>

      <span className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {fmtActualizado(fetchedAt, FECHA_CORTE_PLACEHOLDER)}
      </span>

      {/* UiSearchInput es flex:1, así que el ml-auto va en el grupo, no en él. */}
      <div className="ml-auto flex items-center gap-3">
        <UiSearchInput
          id="novelties-search"
          showBorder
          placeholder="Cliente, factura o ejecutivo…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <NoveltiesFilterModal value={filters} onChange={onFiltersChange} />
        <WalletThemeToggle />
      </div>
    </header>
  );
}
