"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, UserPlus, X } from "lucide-react";

import SearchField from "@/components/ui/search-field/search-field";
import type { IBranchUser } from "@/types/branches/IBranches";
import { cn } from "@/utils/utils";

import { useAssignableUsers } from "../../hooks/use-branch-detail";
import { normalize, plural } from "../../utils/branches";
import UserAvatar from "../user-avatar/user-avatar";

interface AddUsersModalProps {
  /** "COPIDROGAS · CEDI FUNZA", bajo el título. */
  subtitle: string;
  /** Usuarios que ya tiene la sucursal: salen marcados como "Ya asignado". */
  assigned: IBranchUser[];
  onClose: () => void;
  onAdd: (userIds: string[]) => Promise<void>;
}

/** Elegir usuarios de la base de datos para asignarlos a la sucursal. */
export default function AddUsersModal({ subtitle, assigned, onClose, onAdd }: AddUsersModalProps) {
  const { users, isLoading } = useAssignableUsers(true);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const assignedIds = useMemo(() => new Set(assigned.map((u) => u.id)), [assigned]);

  // Disponibles primero y luego los ya asignados; cada grupo A–Z.
  const list = useMemo(() => {
    const q = normalize(query.trim());
    return users
      .filter((u) => !q || normalize(`${u.name} ${u.email} ${u.role}`).includes(q))
      .sort(
        (a, b) =>
          Number(assignedIds.has(a.id)) - Number(assignedIds.has(b.id)) ||
          a.name.localeCompare(b.name, "es")
      );
  }, [users, query, assignedIds]);

  const free = list.filter((u) => !assignedIds.has(u.id)).length;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAdd = async () => {
    setSaving(true);
    try {
      await onAdd([...picked]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(20,20,20,.38)] p-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-users-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[640px] max-h-[calc(100*var(--vh)-48px)] w-[640px] max-w-full flex-col overflow-hidden rounded-2xl bg-cp-surface text-cp-ink shadow-[0_24px_64px_rgba(0,0,0,.22)]"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-cp-line px-[22px] py-[18px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cp-lime-tint">
            <UserPlus className="h-[18px] w-[18px] text-cp-lime-dark" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="add-users-title" className="m-0 text-[17px] font-semibold">
              Agregar usuarios
            </h2>
            <p className="m-0 truncate text-[13px] text-cp-ink-3">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-cp-ink-2 hover:bg-cp-muted"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
        </div>

        <div className="shrink-0 px-[22px] pt-4">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre, correo o cargo…"
            autoFocus
          />
          <div className="mt-3 flex h-9 items-center justify-between rounded-lg bg-cp-bg px-3.5">
            <span className="text-[13px] font-semibold text-cp-ink-3">
              {isLoading
                ? "Cargando usuarios…"
                : `${plural(list.length, "usuario", "usuarios")} · ${free} disponibles`}
            </span>
            {picked.size > 0 && (
              <span className="text-[13px] font-semibold">
                {plural(picked.size, "seleccionado", "seleccionados")}
              </span>
            )}
          </div>
        </div>

        <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto px-3.5 py-2">
          {list.map((u) => {
            const taken = assignedIds.has(u.id);
            const on = picked.has(u.id);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  disabled={taken}
                  onClick={() => toggle(u.id)}
                  className={cn(
                    "flex min-h-[56px] w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 text-left font-[inherit] text-cp-ink",
                    taken ? "cursor-default" : "cursor-pointer hover:bg-cp-subtle",
                    on && "bg-cp-subtle"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      on
                        ? "bg-cp-lime"
                        : taken
                          ? "bg-cp-muted"
                          : "border-2 border-solid border-cp-line-2 bg-cp-surface"
                    )}
                  >
                    {(on || taken) && (
                      <Check
                        className={cn("h-3 w-3", taken ? "text-cp-ink-4" : "text-[#141414]")}
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <UserAvatar name={u.name} muted={taken} />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13.5px] font-medium",
                        taken && "text-cp-ink-4"
                      )}
                    >
                      {u.name} <span className="font-normal text-cp-ink-4">· {u.role}</span>
                    </span>
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        taken ? "text-cp-ink-4" : "text-cp-ink-3"
                      )}
                    >
                      {u.email}
                    </span>
                  </span>
                  {taken && (
                    <span className="shrink-0 rounded-[6px] bg-cp-muted px-2 py-0.5 text-[13px] font-semibold text-cp-ink-3">
                      Ya asignado
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {!isLoading && !list.length && (
            <li className="py-10 text-center text-[13px] text-cp-ink-3">
              No hay usuarios que coincidan con “{query}”.
            </li>
          )}
        </ul>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-cp-line px-[22px] py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-transparent px-4 text-[13.5px] font-semibold text-cp-ink hover:bg-cp-bg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!picked.size || saving}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[10px] border-0 bg-cp-lime px-[18px] text-[13.5px] font-semibold text-[#141414] hover:bg-cp-lime-dark disabled:cursor-not-allowed disabled:bg-cp-muted disabled:text-cp-ink-4"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            {picked.size ? `Agregar (${picked.size})` : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
