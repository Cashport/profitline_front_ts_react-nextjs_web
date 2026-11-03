"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "use-intl";

import Header from "@/components/organisms/header";
import { HeaderSearch } from "@/components/ui/page-header-controls/page-header-controls";
import type { IVisitFormsFilters } from "@/types/surveys/ISurveys";

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
  const t = useTranslations("surveys.header");
  return (
    <Header
      title={t("title")}
      actionsExtra={
        <>
          <button
            type="button"
            onClick={onCreate}
            className="flex h-[var(--control-h)] shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-[18px] w-[18px]" />
            {t("newSurvey")}
          </button>
          <SurveysFilterModal inHeader value={filters} onChange={onFiltersChange} />
          <HeaderSearch
            value={search}
            onChange={onSearchChange}
            placeholder={t("searchPlaceholder")}
          />
        </>
      }
    />
  );
}
