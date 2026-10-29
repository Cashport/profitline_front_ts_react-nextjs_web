"use client";

import type { ReactNode } from "react";

interface TicketsToolbarProps {
  /** Total del universo filtrado, no de la página. */
  totalRows: number;
  /** Controles a la derecha del resumen (p. ej. el selector Lista / Tablero). */
  actions?: ReactNode;
}

/**
 * Resumen de la vista y sus controles. Responsable y categoría viven en el modal
 * "Filtrar" del header (TicketsFilterModal, docs/DESIGN.md §4).
 */
export default function TicketsToolbar({ totalRows, actions }: TicketsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3.5">
      <span className="ml-auto text-[13px] text-muted-foreground">
        {totalRows} {totalRows === 1 ? "ticket" : "tickets"}
      </span>
      {actions}
    </div>
  );
}
