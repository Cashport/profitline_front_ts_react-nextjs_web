"use client";

import type { ITicketCategory } from "@/types/tickets/ITickets";
import type { IUser } from "@/types/users/IUser";

interface TicketsToolbarProps {
  users: IUser[];
  categories: ITicketCategory[];
  assignedToUserId: number | null;
  categoryId: number | null;
  onAssignedToChange: (id: number | null) => void;
  onCategoryChange: (id: number | null) => void;
  /** Total del universo filtrado, no de la página. */
  totalRows: number;
}

const SELECT_CLASS =
  "h-12 cursor-pointer rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary";

/** Filtros de responsable y categoría + resumen de la vista. */
export default function TicketsToolbar({
  users,
  categories,
  assignedToUserId,
  categoryId,
  onAssignedToChange,
  onCategoryChange,
  totalRows
}: TicketsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* TODO: filtro por estado (param `status`: OPEN|IN_PROGRESS|COMPLETED|CANCELLED).
          Pendiente de definir cómo convive con las tarjetas de situación.
      <select aria-label="Filtrar tickets por estado" className={SELECT_CLASS}>
        <option value="">Todos los estados</option>
      </select> */}

      {/* TODO: filtro por coordinador. /tickets aún no recibe un param para él;
          la lista sale de useIncidentListCoordinators (noveltiesModule).
      <select aria-label="Filtrar tickets por coordinador" className={SELECT_CLASS}>
        <option value="">Todos los coordinadores</option>
      </select> */}

      <select
        aria-label="Filtrar tickets por responsable"
        value={assignedToUserId ?? ""}
        onChange={(e) => onAssignedToChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLASS}
      >
        <option value="">Todos los responsables</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.user_name}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar tickets por categoría"
        value={categoryId ?? ""}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLASS}
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <span className="ml-auto text-[11.5px] text-muted-foreground">
        {totalRows} {totalRows === 1 ? "ticket" : "tickets"}
      </span>
    </div>
  );
}
