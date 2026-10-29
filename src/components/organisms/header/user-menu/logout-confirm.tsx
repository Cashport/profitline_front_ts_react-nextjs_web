"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { logOut } from "../../../../../firebase-utils";

/** Ícono de cerrar sesión (mismo trazo que el menú lateral). */
export const LogoutIcon = ({ size = 17, stroke = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />
  </svg>
);

/**
 * Confirmación de "Cerrar sesión" (diseño "Corte y Proyeccion"): se usa desde el menú del
 * avatar y desde el pie del menú lateral. Devuelve la función que la abre y el modal.
 */
export function useLogoutConfirm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Esc cancela, como en los demás modales.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(20,20,20,.35)] p-6"
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="logout-confirm-title"
              onClick={(e) => e.stopPropagation()}
              className="box-border flex w-[400px] max-w-full flex-col gap-4 rounded-2xl bg-white p-6 text-cp-ink shadow-[0_24px_60px_rgba(0,0,0,.25)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fde6f2]">
                <LogoutIcon size={20} stroke="#e0007a" />
              </span>
              <div className="flex flex-col gap-1.5">
                <span id="logout-confirm-title" className="text-[17px] font-semibold">
                  ¿Cerrar sesión?
                </span>
                <span className="text-[13px] leading-normal text-cp-ink-2">
                  Saldrás de Cashport en este equipo. Tus filtros y preferencias quedan guardados.
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  className="h-10 cursor-pointer rounded-[10px] border-0 bg-transparent px-4 text-[13.5px] font-semibold text-cp-ink hover:bg-cp-bg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => logOut(router)}
                  className="h-10 cursor-pointer rounded-[10px] border-0 bg-[#e0007a] px-[18px] text-[13.5px] font-semibold text-white hover:bg-[#c4006b]"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return { askLogout: () => setOpen(true), logoutModal: modal };
}
