"use client";

import { useMemo, useState } from "react";

import BoardLanes, { type BoardLane } from "@/components/ui/board-lanes/board-lanes";
import KpiCards, { type KpiCardItem } from "@/components/ui/kpi-cards/kpi-cards";
import GroupDetailModal from "@/modules/walletModule/components/group-detail-modal/group-detail-modal";
import { fmtM } from "@/modules/walletModule/utils/format";
import { cn } from "@/utils/utils";
import TicketBoardCard from "../../components/ticket-board-card/ticket-board-card";
import TicketsHeader from "../../components/tickets-header/tickets-header";
import TicketsList from "../../components/tickets-list/tickets-list";
import TicketsToolbar from "../../components/tickets-toolbar/tickets-toolbar";
import { TICKET_KPI_CARDS, TICKET_LANES } from "../../constants";
import { TICKET_ROWS } from "../../mocked-data";
import { TICKET_PREDICATES, filtrarTickets, laneDe, sumaMonto } from "../../utils/tickets-calc";
import type { ITicketRow, TicketFilter, TicketView } from "../../types";

const VISTAS: { key: TicketView; label: string }[] = [
  { key: "lista", label: "Lista" },
  { key: "tablero", label: "Tablero" }
];

export default function TicketsView() {
  // Las tarjetas y el select comparten esta pieza: elegir en uno ilumina el otro.
  const [filtro, setFiltro] = useState<TicketFilter>("abiertos");
  const [vista, setVista] = useState<TicketView>("lista");
  const [query, setQuery] = useState("");
  // Clave del grupo abierto: el modal resuelve su propio detalle a partir de ella.
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const visibleRows = useMemo(() => filtrarTickets(TICKET_ROWS, filtro, query), [filtro, query]);

  const cards: KpiCardItem[] = useMemo(
    () =>
      TICKET_KPI_CARDS.map((c) => {
        // El mismo predicado que filtra las filas, para que el conteo no mienta.
        const suyos = TICKET_ROWS.filter(TICKET_PREDICATES[c.id]);
        return { ...c, valor: fmtM(sumaMonto(suyos)), conteo: suyos.length };
      }),
    []
  );

  const lanes: BoardLane<ITicketRow>[] = useMemo(
    () =>
      TICKET_LANES.map((lane) => {
        // Lo que vence antes, arriba.
        const items = visibleRows
          .filter((r) => laneDe(r) === lane.id)
          .sort((a, b) => a.ticket.deadline.getTime() - b.ticket.deadline.getTime());

        return { id: lane.id, title: lane.nom, items, total: fmtM(sumaMonto(items)) };
      }),
    [visibleRows]
  );

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <TicketsHeader onSearchChange={setQuery} />

      <div className="flex flex-wrap items-end gap-3.5">
        <h2 className="text-lg font-semibold text-foreground">Bandeja de tickets</h2>

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

      <TicketsToolbar
        rows={TICKET_ROWS}
        visibleRows={visibleRows}
        filtro={filtro}
        onFiltroChange={setFiltro}
      />
      <KpiCards
        cards={cards}
        noun={["ticket", "tickets"]}
        selected={filtro}
        onSelect={(id) => setFiltro(id as TicketFilter)}
      />

      {vista === "lista" ? (
        <TicketsList rows={visibleRows} onOpenDetail={setOpenGroup} />
      ) : (
        <BoardLanes
          lanes={lanes}
          renderCard={(r) => (
            <TicketBoardCard key={r.ticket.id} row={r} onOpenDetail={setOpenGroup} />
          )}
        />
      )}

      <GroupDetailModal clave={openGroup} onClose={() => setOpenGroup(null)} />
    </div>
  );
}
