"use client";

import BoardLanes, { type BoardLane } from "@/components/ui/board-lanes/board-lanes";
import { fmtM } from "@/modules/walletModule/utils/format";
import { cn } from "@/utils/utils";
import type { IIncidentListItem, INoveltyStatus } from "@/types/novelties/INovelties";
import NoveltyBoardCard from "../novelty-board-card/novelty-board-card";

interface NoveltiesBoardProps {
  items: IIncidentListItem[];
  /** Una columna por estado del catálogo, en su `sort_order`. */
  statuses: INoveltyStatus[];
  loading: boolean;
  onOpenDetail: (incidentId: number) => void;
}

/** Sin fecha de ticket va al final; el resto, lo más urgente arriba. */
const porCompromiso = (a: IIncidentListItem, b: IIncidentListItem): number => {
  if (!a.next_ticket_date) return b.next_ticket_date ? 1 : 0;
  if (!b.next_ticket_date) return -1;
  return new Date(a.next_ticket_date).getTime() - new Date(b.next_ticket_date).getTime();
};

/** Vista "Tablero": una columna por estado, con la misma página que la lista. */
export default function NoveltiesBoard({
  items,
  statuses,
  loading,
  onOpenDetail
}: NoveltiesBoardProps) {
  const lanes: BoardLane<IIncidentListItem>[] = statuses.map((s) => {
    const suyas = items.filter((n) => n.novelty_status_id === s.id).sort(porCompromiso);
    return {
      id: String(s.id),
      title: s.description,
      items: suyas,
      total: fmtM(suyas.reduce((a, n) => a + n.amount, 0))
    };
  });

  return (
    <div className={cn(loading && "pointer-events-none opacity-60")}>
      <BoardLanes
        lanes={lanes}
        renderCard={(n) => (
          <NoveltyBoardCard key={n.incident_id} item={n} onOpenDetail={onOpenDetail} />
        )}
      />
    </div>
  );
}
