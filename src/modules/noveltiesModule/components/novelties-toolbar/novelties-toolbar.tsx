"use client";

import { ChevronDown } from "lucide-react";

import { fac, fmtM } from "@/modules/walletModule/utils/format";
import { KPI_CARDS, NOVELTY_ESTADOS, NOVELTY_FILTERS } from "../../constants";
import { contarPorFiltro } from "../../utils/novelties-calc";
import type { INoveltyRow, NoveltyFilter } from "../../types";

interface NoveltiesToolbarProps {
  /** Universo sin filtrar: alimenta los conteos del select. */
  rows: INoveltyRow[];
  /** Filas ya filtradas: alimentan el resumen de la derecha. */
  visibleRows: INoveltyRow[];
  filtro: NoveltyFilter;
  onFiltroChange: (filtro: NoveltyFilter) => void;
}

/** Select de estado + filtros pendientes + resumen de la vista. */
export default function NoveltiesToolbar({
  rows,
  visibleRows,
  filtro,
  onFiltroChange
}: NoveltiesToolbarProps) {
  const suma = visibleRows.reduce((a, n) => a + n.monto, 0);
  const vinculadas = visibleRows.reduce((a, n) => a + n.facturas, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Comparte estado con las tarjetas KPI: elegir aquí ilumina la tarjeta. */}
      <select
        aria-label="Filtrar novedades por estado"
        value={filtro}
        onChange={(e) => onFiltroChange(e.target.value as NoveltyFilter)}
        className="h-12 cursor-pointer rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
      >
        {KPI_CARDS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label} ({contarPorFiltro(rows, c.id)})
          </option>
        ))}
        {NOVELTY_ESTADOS.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nom}
          </option>
        ))}
        <option value="todas">Todas</option>
      </select>

      {/* TODO: conectar cada chip a un multi-select cuando exista el endpoint de filtros. */}
      {NOVELTY_FILTERS.map((f) => (
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
        {visibleRows.length} novedades · {fmtM(suma)} · {fac(vinculadas)} vinculadas
      </span>
    </div>
  );
}
