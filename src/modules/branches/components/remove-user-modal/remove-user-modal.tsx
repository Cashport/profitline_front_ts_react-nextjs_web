"use client";

import { useEffect, useState } from "react";
import { UserMinus } from "lucide-react";

import type { IBranchUser } from "@/types/branches/IBranches";

interface RemoveUserModalProps {
  user: IBranchUser;
  branchName: string;
  /** "No": cierra sin cambios. */
  onClose: () => void;
  /** "Sí": desvincula; si falla (lanza), el modal sigue abierto. */
  onConfirm: () => Promise<void>;
}

/** "¿Está seguro de que quiere eliminar…?" con Sí / No (mismo diseño que "¿Cerrar sesión?"). */
export default function RemoveUserModal({
  user,
  branchName,
  onClose,
  onConfirm
}: RemoveUserModalProps) {
  const [saving, setSaving] = useState(false);

  // Esc equivale a "No".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
    } catch {
      // El error ya se avisó; el modal sigue abierto para reintentar o cancelar.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={() => !saving && onClose()}
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(20,20,20,.35)] p-6"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="remove-user-title"
        aria-describedby="remove-user-text"
        onClick={(e) => e.stopPropagation()}
        className="box-border flex w-[400px] max-w-full flex-col gap-4 rounded-2xl bg-cp-surface p-6 text-cp-ink shadow-[0_24px_60px_rgba(0,0,0,.25)]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgb(var(--cp-red)/0.1)]">
          <UserMinus className="h-5 w-5 text-cp-red" strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-1.5">
          <span id="remove-user-title" className="text-[17px] font-semibold">
            ¿Eliminar usuario?
          </span>
          <span id="remove-user-text" className="text-[13px] leading-normal text-cp-ink-2">
            ¿Está seguro de que quiere eliminar a{" "}
            <b className="font-semibold text-cp-ink">{user.name}</b> de la sucursal{" "}
            <b className="font-semibold text-cp-ink">{branchName}</b>?
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            disabled={saving}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-transparent px-4 text-[13.5px] font-semibold text-cp-ink hover:bg-cp-bg disabled:cursor-default disabled:opacity-50"
          >
            No
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-cp-red px-[18px] text-[13.5px] font-semibold text-white hover:bg-[#c81e23] disabled:cursor-default disabled:opacity-60"
          >
            {saving ? "Eliminando…" : "Sí"}
          </button>
        </div>
      </div>
    </div>
  );
}
