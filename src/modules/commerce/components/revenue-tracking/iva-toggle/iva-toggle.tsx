"use client";

import React from "react";
import { Receipt } from "lucide-react";

import { useRevenueTracking } from "@/modules/commerce/contexts/revenue-tracking-context";

/**
 * Alterna entre ventas netas (default) y ventas con IVA.
 *
 * Apagado el back devuelve `mo.total - mo.taxes`; encendido devuelve `mo.total` tal cual.
 * Afecta a todos los widgets del dashboard, porque el flag viaja en el mismo query string
 * que el resto de filtros.
 */
export default function IvaToggle() {
  const { includeIva, setIncludeIva } = useRevenueTracking();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={includeIva}
      aria-label={includeIva ? "Mostrando valores con IVA" : "Mostrando valores sin IVA"}
      title={
        includeIva
          ? "Los valores incluyen IVA. Click para ver ventas netas."
          : "Los valores son netos (sin IVA). Click para incluir IVA."
      }
      onClick={() => setIncludeIva(!includeIva)}
      className="shrink-0 flex items-center gap-2.5 bg-card border border-border px-4 py-2.5 rounded-xl text-foreground hover:bg-secondary transition-colors shadow-sm"
    >
      <Receipt className="w-4 h-4" />
      <span className="text-sm font-medium whitespace-nowrap">
        {includeIva ? "Con IVA" : "Sin IVA"}
      </span>
      <span
        aria-hidden
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          includeIva ? "bg-primary" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            includeIva ? "translate-x-[1.125rem]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
