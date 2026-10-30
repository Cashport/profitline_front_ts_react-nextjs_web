"use client";

import { useEffect, useState } from "react";
import { UserMinus } from "lucide-react";

import type { IBranchUser } from "@/types/branches/IBranches";

interface RemoveUserModalProps {
  user: IBranchUser;
  branchName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/** Confirmación antes de quitar un usuario de la sucursal (mismo diseño que "¿Cerrar sesión?"). */
export default function RemoveUserModal({
  user,
  branchName,
  onClose,
  onConfirm
}: RemoveUserModalProps) {
  const [saving, setSaving] = useState(false);

  // Esc cancela, como en los demás modales.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onConfirm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
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
            {user.name} ({user.email}) dejará de tener acceso a {branchName}. Esta acción no se
            puede deshacer.
          </span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-transparent px-4 text-[13.5px] font-semibold text-cp-ink hover:bg-cp-bg"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-cp-red px-[18px] text-[13.5px] font-semibold text-white hover:bg-[#c81e23] disabled:cursor-default disabled:opacity-60"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
