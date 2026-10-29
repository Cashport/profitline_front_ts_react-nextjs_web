"use client";

import { Plus } from "lucide-react";

import { ProfileMenu } from "@/components/atoms/ProfileMenu/ProfileMenu";
import UiSearchInput from "@/components/ui/search-input";
import type { IVisitFormsFilters } from "@/types/surveys/ISurveys";

import SurveysFilterModal from "../surveys-filter-modal/surveys-filter-modal";

interface SurveysHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: IVisitFormsFilters;
  onFiltersChange: (next: IVisitFormsFilters) => void;
  onCreate: () => void;
}

/** Barra superior del listado: título, búsqueda, filtros, nueva encuesta y perfil. */
export default function SurveysHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onCreate
}: SurveysHeaderProps) {
  return (
    <header className="flex flex-wrap items-center gap-3.5 pb-3 max-[768px]:px-2">
      <h1 className="text-2xl font-semibold text-foreground">Encuestas</h1>

      <UiSearchInput
        id="surveys-search"
        showBorder
        placeholder="Buscar encuesta"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <SurveysFilterModal value={filters} onChange={onFiltersChange} />

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex h-12 shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nueva encuesta
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
