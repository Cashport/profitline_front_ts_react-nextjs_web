"use client";

import { useState } from "react";

import {
  FilterModal,
  type FilterCategoryConfig,
  type FilterOptionItem,
  type FilterSelection
} from "@/components/ui/filter-modal";
import type { ICollectionTower, ITowerCatalogItem } from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import type { TowerFilters } from "../../types";
import {
  coordinatorPatch,
  executivePatch,
  indexCatalogs,
  managementOf,
  managementPatch
} from "../../utils/filters";

type FieldKey = "management" | "coordinator" | "executive" | "channel";

const toOptions = (list: ITowerCatalogItem[]): FilterOptionItem[] =>
  list.map((x) => ({ id: x.id, name: x.name }));

const idOf = (sel: FilterSelection, key: FieldKey) => sel[key]?.[0]?.id ?? null;

/**
 * "Filtros Avanzados" de la torre (mismo modal que el Home de Clientes): gerencia,
 * coordinador, ejecutivo y canal, una opción por categoría. Las listas se acotan en cascada
 * con lo elegido en el borrador y, al aplicar, elegir un nivel de abajo fija los de arriba.
 * El cliente se busca en la barra (TorreToolbar); los chips los pinta FilterChips.
 */
export default function FiltersPopover({ data }: { data?: ICollectionTower }) {
  const { filters: f, patch, clear } = useTowerFilters();
  const [draft, setDraft] = useState<FilterSelection>({});

  const cat = data?.catalogs;
  const ix = cat ? indexCatalogs(cat) : null;
  const nameIn = (list: ITowerCatalogItem[] | undefined, id: string | null) =>
    id ? list?.find((x) => x.id === id)?.name ?? id : null;

  const value: FilterSelection = {
    management: f.management
      ? [{ id: f.management, name: nameIn(cat?.managements, f.management)! }]
      : [],
    coordinator: f.coordinator
      ? [{ id: f.coordinator, name: nameIn(cat?.coordinators, f.coordinator)! }]
      : [],
    executive: f.executive
      ? [{ id: f.executive, name: nameIn(cat?.executives, f.executive)! }]
      : [],
    channel: f.channel ? [{ id: f.channel, name: nameIn(cat?.channels, f.channel)! }] : []
  };

  const draftManagement = idOf(draft, "management");
  const draftCoordinator = idOf(draft, "coordinator");
  const coordinators = (cat?.coordinators ?? []).filter(
    (c) => !draftManagement || c.managementId === draftManagement
  );
  const executives = (cat?.executives ?? []).filter(
    (e) =>
      (!draftCoordinator || e.coordinatorId === draftCoordinator) &&
      (!draftManagement || (ix && managementOf(ix, e.coordinatorId) === draftManagement))
  );

  const categories: FilterCategoryConfig[] = [
    {
      key: "management",
      label: "Gerencia",
      selectMode: "single",
      options: toOptions(cat?.managements ?? [])
    },
    {
      key: "coordinator",
      label: "Coordinador",
      selectMode: "single",
      options: toOptions(coordinators)
    },
    { key: "executive", label: "Ejecutivo", selectMode: "single", options: toOptions(executives) },
    {
      key: "channel",
      label: "Canal",
      selectMode: "single",
      options: toOptions(cat?.channels ?? [])
    }
  ];

  const apply = (sel: FilterSelection) => {
    if (!ix) return;
    patch((cur) => {
      // Se aplica de arriba hacia abajo con las mismas cascadas del panel anterior.
      let next: TowerFilters = { ...cur, channel: idOf(sel, "channel") };
      next = { ...next, ...managementPatch(next, idOf(sel, "management"), ix) };
      next = { ...next, ...coordinatorPatch(next, idOf(sel, "coordinator"), ix) };
      const executive = idOf(sel, "executive");
      next = { ...next, ...(executive ? executivePatch(executive, ix) : { executive: null }) };
      return next;
    });
  };

  return (
    <FilterModal
      categories={categories}
      value={value}
      isLoading={!data}
      hideTags
      onDraftChange={setDraft}
      onApply={apply}
      onValueChange={apply}
      onClearAll={clear}
    />
  );
}
