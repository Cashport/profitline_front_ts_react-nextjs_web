"use client";

import KpiCards from "@/components/ui/kpi-cards/kpi-cards";
import type { IIncidentListKpis, IncidentCard } from "@/types/novelties/INovelties";
import { toKpiCards } from "../../utils/novelties-calc";

interface NoveltiesKpiCardsProps {
  kpis: IIncidentListKpis | undefined;
  selected: IncidentCard | null;
  onSelect: (card: IncidentCard | null) => void;
}

/** Las cinco tarjetas de la bandeja. Elegir una acota la lista y el tablero. */
export default function NoveltiesKpiCards({ kpis, selected, onSelect }: NoveltiesKpiCardsProps) {
  return (
    <KpiCards
      cards={toKpiCards(kpis)}
      noun={["novedad", "novedades"]}
      selected={selected}
      // Volver a pulsar la activa la apaga: sin tarjeta = todas.
      onSelect={(id) => onSelect(id === selected ? null : (id as IncidentCard))}
    />
  );
}
