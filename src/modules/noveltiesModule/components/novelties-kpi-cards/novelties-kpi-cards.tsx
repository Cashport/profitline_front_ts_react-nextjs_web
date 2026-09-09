"use client";

import KpiCards, { type KpiCardItem } from "@/components/ui/kpi-cards/kpi-cards";
import { fmtM } from "@/modules/walletModule/utils/format";
import { KPI_CARDS } from "../../constants";
import { NOVELTY_PREDICATES } from "../../utils/novelties-calc";
import type { INoveltyRow, NoveltyFilter } from "../../types";

interface NoveltiesKpiCardsProps {
  rows: INoveltyRow[];
  filtro: NoveltyFilter;
  onFiltroChange: (filtro: NoveltyFilter) => void;
}

/** Las cinco tarjetas de la bandeja. Elegir una acota la lista y el tablero. */
export default function NoveltiesKpiCards({
  rows,
  filtro,
  onFiltroChange
}: NoveltiesKpiCardsProps) {
  const cards: KpiCardItem[] = KPI_CARDS.map((c) => {
    // El mismo predicado que filtra las filas, para que el conteo no mienta.
    const suyas = rows.filter(NOVELTY_PREDICATES[c.id]);
    return { ...c, valor: fmtM(suyas.reduce((a, n) => a + n.monto, 0)), conteo: suyas.length };
  });

  return (
    <KpiCards
      cards={cards}
      noun={["novedad", "novedades"]}
      selected={filtro}
      onSelect={(id) => onFiltroChange(id as NoveltyFilter)}
    />
  );
}
