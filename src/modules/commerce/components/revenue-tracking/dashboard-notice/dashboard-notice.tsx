"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";

interface DashboardNoticeProps {
  /** Mensaje que devuelve el back (p. ej. el motivo por el que no hay acceso). */
  message: string;
  onRetry?: () => void;
}

/**
 * Estado único del dashboard cuando la carga falla.
 *
 * El caso principal es el de permisos: el back acota las ventas a los grupos de clientes
 * del usuario y, si no tiene ninguno asignado, responde 404 con el motivo. Mostrar ese
 * mensaje es lo que diferencia "no tengo acceso" de "no hubo ventas" — con las tarjetas en
 * "—" las dos cosas se ven igual.
 */
export default function DashboardNotice({ message, onRetry }: DashboardNoticeProps) {
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-10 flex flex-col items-center text-center gap-3">
      <ShieldAlert className="w-10 h-10 text-[#FF6B00]" strokeWidth={1.5} />
      <h2 className="text-lg font-semibold text-foreground">No se pudo cargar el dashboard</h2>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-sm font-semibold text-[#FF6B00] hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
