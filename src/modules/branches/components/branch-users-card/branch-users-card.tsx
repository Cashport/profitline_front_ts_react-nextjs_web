"use client";

import { MoreVertical, Plus } from "lucide-react";

import GeneralDropdown from "@/components/ui/dropdown/dropdown";
import type { IBranchUser } from "@/types/branches/IBranches";

import UserAvatar from "../user-avatar/user-avatar";

interface BranchUsersCardProps {
  users: IBranchUser[];
  /** Sin acción no se muestra "Agregar Nuevo Usuario". */
  onAdd?: () => void;
  /** Sin acción no se muestra el menú ⋮ de cada usuario. */
  onRemove?: (user: IBranchUser) => void;
}

/** Usuarios asignados a la sucursal; agregar y eliminar aparecen solo si la pantalla los habilita. */
export default function BranchUsersCard({ users, onAdd, onRemove }: BranchUsersCardProps) {
  return (
    <section className="cp-card p-[var(--card-pad)]">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0 text-[13.5px] font-semibold text-cp-ink">Usuarios Asignados</h2>
          <span className="rounded-[5px] bg-cp-muted px-1.5 text-[13px] font-semibold text-cp-ink">
            {users.length}
          </span>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border-0 bg-cp-lime px-4 text-[13.5px] font-semibold text-[#141414] hover:bg-cp-lime-dark"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Agregar Nuevo Usuario
          </button>
        )}
      </div>

      <ul className="m-0 list-none p-0">
        {users.length ? (
          users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 border-b border-cp-line py-2.5 last:border-0"
            >
              <UserAvatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[13.5px] font-medium text-cp-ink">{user.name}</p>
                <p className="m-0 truncate text-[13px] text-cp-ink-3">
                  {user.email}
                  {user.role && ` · ${user.role}`}
                </p>
              </div>
              {onRemove && (
                <GeneralDropdown
                  align="end"
                  items={[
                    {
                      key: "remove",
                      label: "Eliminar usuario",
                      danger: true,
                      onClick: () => onRemove(user)
                    }
                  ]}
                >
                  <button
                    type="button"
                    aria-label={`Opciones de ${user.name}`}
                    className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-cp-ink hover:bg-cp-bg"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </GeneralDropdown>
              )}
            </li>
          ))
        ) : (
          <li className="py-8 text-center text-[13px] text-cp-ink-3">
            Esta sucursal no tiene usuarios asignados.
          </li>
        )}
      </ul>
    </section>
  );
}
