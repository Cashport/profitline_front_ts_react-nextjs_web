"use client";

import { useEffect } from "react";
import { UserPlus } from "lucide-react";

import type { IBranchUser } from "@/types/branches/IBranches";

interface ConfirmAddUsersModalProps {
  users: IBranchUser[];
  branchName: string;
  saving: boolean;
  /** "No": vuelve al modal de usuarios con la selección intacta. */
  onCancel: () => void;
  /** "Sí": guarda la asignación. */
  onConfirm: () => void;
}

/** "¿Está seguro de que quiere agregar…?" con Sí / No (mismo diseño que "¿Cerrar sesión?"). */
export default function ConfirmAddUsersModal({
  users,
  branchName,
  saving,
  onCancel,
  onConfirm
}: ConfirmAddUsersModalProps) {
  // Esc equivale a "No".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  const who =
    users.length === 1 ? (
      <b className="font-semibold text-cp-ink">{users[0].name}</b>
    ) : (
      <>
        <b className="font-semibold text-cp-ink">{users.length} usuarios</b> (
        {users.map((u) => u.name).join(", ")})
      </>
    );

  return (
    <div
      onClick={() => !saving && onCancel()}
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(20,20,20,.35)] p-6"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-add-users-title"
        aria-describedby="confirm-add-users-text"
        onClick={(e) => e.stopPropagation()}
        className="box-border flex w-[420px] max-w-full flex-col gap-4 rounded-2xl bg-cp-surface p-6 text-cp-ink shadow-[0_24px_60px_rgba(0,0,0,.25)]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-cp-lime-tint">
          <UserPlus className="h-5 w-5 text-cp-lime-dark" strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-1.5">
          <span id="confirm-add-users-title" className="text-[17px] font-semibold">
            ¿Agregar a la sucursal?
          </span>
          <span id="confirm-add-users-text" className="text-[13px] leading-normal text-cp-ink-2">
            ¿Está seguro de que quiere agregar a {who} a la sucursal{" "}
            <b className="font-semibold text-cp-ink">{branchName}</b>?
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={saving}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-transparent px-4 text-[13.5px] font-semibold text-cp-ink hover:bg-cp-bg disabled:cursor-default disabled:opacity-50"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-cp-lime px-[18px] text-[13.5px] font-semibold text-[#141414] hover:bg-cp-lime-dark disabled:cursor-default disabled:opacity-60"
          >
            {saving ? "Agregando…" : "Sí"}
          </button>
        </div>
      </div>
    </div>
  );
}
