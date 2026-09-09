"use client";

import { useMemo, useState } from "react";

import { cn } from "@/utils/utils";
import GroupDetailModal from "@/modules/walletModule/components/group-detail-modal/group-detail-modal";
import NoveltiesBoard from "../../components/novelties-board/novelties-board";
import NoveltiesHeader from "../../components/novelties-header/novelties-header";
import NoveltiesKpiCards from "../../components/novelties-kpi-cards/novelties-kpi-cards";
import NoveltiesList from "../../components/novelties-list/novelties-list";
import NoveltiesToolbar from "../../components/novelties-toolbar/novelties-toolbar";
import { NOVELTY_DETAIL, NOVELTY_ROWS } from "../../mocked-data";
import { filtrarNovedades } from "../../utils/novelties-calc";
import type { NoveltyFilter, NoveltyView } from "../../types";

const VISTAS: { key: NoveltyView; label: string }[] = [
  { key: "lista", label: "Lista" },
  { key: "tablero", label: "Tablero" }
];

export default function NoveltiesView() {
  // Las tarjetas y el select comparten esta pieza: elegir en uno ilumina el otro.
  const [filtro, setFiltro] = useState<NoveltyFilter>("abiertas");
  const [vista, setVista] = useState<NoveltyView>("lista");
  const [query, setQuery] = useState("");
  // Id de la novedad abierta. Hoy todas muestran el mismo detalle simulado.
  const [openNovelty, setOpenNovelty] = useState<string | null>(null);

  const visibleRows = useMemo(
    () => filtrarNovedades(NOVELTY_ROWS, filtro, query),
    [filtro, query]
  );

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <NoveltiesHeader onSearchChange={setQuery} />

      <div className="flex flex-wrap items-end gap-3.5">
        <h2 className="text-lg font-semibold text-foreground">Bandeja de novedades</h2>

        <div className="ml-auto flex overflow-hidden rounded-lg border border-border bg-card">
          {VISTAS.map((v) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={vista === v.key}
              onClick={() => setVista(v.key)}
              className={cn(
                "border-r border-border px-3 py-1.5 text-xs transition-colors last:border-r-0",
                vista === v.key
                  ? "bg-secondary font-bold text-foreground"
                  : "font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <NoveltiesToolbar
        rows={NOVELTY_ROWS}
        visibleRows={visibleRows}
        filtro={filtro}
        onFiltroChange={setFiltro}
      />
      <NoveltiesKpiCards rows={NOVELTY_ROWS} filtro={filtro} onFiltroChange={setFiltro} />

      {vista === "lista" ? (
        <NoveltiesList rows={visibleRows} onOpenDetail={setOpenNovelty} />
      ) : (
        <NoveltiesBoard rows={visibleRows} onOpenDetail={setOpenNovelty} />
      )}

      <GroupDetailModal
        clave={openNovelty}
        detail={openNovelty ? NOVELTY_DETAIL : null}
        onClose={() => setOpenNovelty(null)}
      />
    </div>
  );
}
