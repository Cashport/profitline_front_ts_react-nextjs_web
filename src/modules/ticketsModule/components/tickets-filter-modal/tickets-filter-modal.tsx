"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import type { ITicketCategory } from "@/types/tickets/ITickets";
import type { IUser } from "@/types/users/IUser";

interface TicketsFilterModalProps {
  users: IUser[];
  categories: ITicketCategory[];
  assignedToUserId: number | null;
  categoryId: number | null;
  onAssignedToChange: (id: number | null) => void;
  onCategoryChange: (id: number | null) => void;
  /** En el header compartido: chips a la izquierda de "Filtrar" (ver FilterModal). */
  inHeader?: boolean;
}

/** Selección de una categoría "single" a partir del id confirmado. */
const single = (id: number | null, options: FilterOptionItem[]): FilterOptionItem[] => {
  if (id === null) return [];
  const key = String(id);
  return [{ id: key, name: options.find((o) => o.id === key)?.name ?? key }];
};

const toNumber = (items?: FilterOptionItem[]) => (items?.[0] ? Number(items[0].id) : null);

/**
 * Botón "Filtrar" de la bandeja (docs/DESIGN.md §4 y §6): responsable y categoría,
 * una opción por categoría porque el listado recibe un id por parámetro.
 */
export default function TicketsFilterModal({
  users,
  categories,
  assignedToUserId,
  categoryId,
  onAssignedToChange,
  onCategoryChange,
  inHeader
}: TicketsFilterModalProps) {
  const responsableOptions: FilterOptionItem[] = users.map((u) => ({
    id: String(u.id),
    name: u.user_name
  }));
  const categoriaOptions: FilterOptionItem[] = categories.map((c) => ({
    id: String(c.id),
    name: c.name
  }));

  // TODO: filtro por estado (param `status`: OPEN|IN_PROGRESS|COMPLETED|CANCELLED).
  // Pendiente de definir cómo convive con las tarjetas de situación.
  // TODO: filtro por coordinador. /tickets aún no recibe un param para él;
  // la lista sale de useIncidentListCoordinators (noveltiesModule).
  const filterCategories: FilterCategoryConfig[] = [
    {
      key: "responsable",
      label: "Responsable",
      selectMode: "single",
      options: responsableOptions
    },
    { key: "categoria", label: "Categoría", selectMode: "single", options: categoriaOptions }
  ];

  const selection: FilterSelection = {
    responsable: single(assignedToUserId, responsableOptions),
    categoria: single(categoryId, categoriaOptions)
  };

  const apply = (sel: FilterSelection) => {
    const nextAssigned = toNumber(sel.responsable);
    const nextCategory = toNumber(sel.categoria);
    if (nextAssigned !== assignedToUserId) onAssignedToChange(nextAssigned);
    if (nextCategory !== categoryId) onCategoryChange(nextCategory);
  };

  return (
    <FilterModal
      categories={filterCategories}
      value={selection}
      formatTagValue={(_cat, items) => items[0]?.name ?? ""}
      onApply={apply}
      onValueChange={apply}
      onClearAll={() => apply({})}
      inHeader={inHeader}
    />
  );
}
