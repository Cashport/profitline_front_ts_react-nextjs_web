"use client";

import { Plus } from "lucide-react";

import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import type { IVisitFormsFilters } from "@/types/surveys/ISurveys";

import ActionButton from "../shared/action-button";
import SurveysFilterModal from "../surveys-filter-modal/surveys-filter-modal";

interface SurveysHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: IVisitFormsFilters;
  onFiltersChange: (next: IVisitFormsFilters) => void;
  onCreate: () => void;
}

/** Header compartido (docs/DESIGN.md §4): título; a la derecha nueva encuesta, chips + Filtrar,
    buscador y avatar. */
export default function SurveysHeader({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onCreate
}: SurveysHeaderProps) {
  return (
    <Header
      title="Encuestas"
      actionsExtra={
        <>
          <ActionButton variant="primary" icon={<Plus />} onClick={onCreate}>
            Nueva encuesta
          </ActionButton>
          <SurveysFilterModal inHeader value={filters} onChange={onFiltersChange} />
          <HeaderSearch value={search} onChange={onSearchChange} placeholder="Buscar encuesta" />
        </>
      }
    />
  );
}
