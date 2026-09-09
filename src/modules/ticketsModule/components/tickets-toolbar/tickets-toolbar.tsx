"use client";

import { ChevronDown } from "lucide-react";

import { fmtM } from "@/modules/walletModule/utils/format";
import { TICKET_FILTERS, TICKET_KPI_CARDS } from "../../constants";
import { contarPorFiltro, sumaMonto } from "../../utils/tickets-calc";
import type { ITicketRow, TicketFilter } from "../../types";

interface TicketsToolbarProps {
  /** Universo sin filtrar: alimenta los conteos del select. */
  rows: ITicketRow[];
  /** Filas ya filtradas: alimentan el resumen de la derecha. */
  visibleRows: ITicketRow[];
  filtro: TicketFilter;
  onFiltroChange: (filtro: TicketFilter) => void;
}

/** Select de estado + filtros pendientes + resumen de la vista. */
export default function TicketsToolbar({
  rows,
  visibleRows,
  filtro,
  onFiltroChange
}: TicketsToolbarProps) {
  const novedades = new Set(visibleRows.map((r) => r.novedadId).filter(Boolean)).size;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Comparte estado con las tarjetas KPI: elegir aquí ilumina la tarjeta. */}
      <select
        aria-label="Filtrar tickets por estado"
        value={filtro}
        onChange={(e) => onFiltroChange(e.target.value as TicketFilter)}
        className="h-12 cursor-pointer rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        {TICKET_KPI_CARDS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label} ({contarPorFiltro(rows, c.id)})
          </option>
        ))}
        <option value="resueltos">Resueltos ({contarPorFiltro(rows, "resueltos")})</option>
        <option value="todos">Todos ({rows.length})</option>
      </select>

      {/* TODO: conectar cada chip a un multi-select cuando exista el endpoint de filtros. */}
      {TICKET_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          {f.label}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}

      <span className="ml-auto text-[11.5px] text-muted-foreground">
        {visibleRows.length} {visibleRows.length === 1 ? "ticket" : "tickets"} ·{" "}
        {fmtM(sumaMonto(visibleRows))} en juego · {novedades}{" "}
        {novedades === 1 ? "novedad" : "novedades"}
      </span>
    </div>
  );
}
