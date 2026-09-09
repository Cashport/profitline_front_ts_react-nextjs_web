"use client";

import BoardLanes, { type BoardLane } from "@/components/ui/board-lanes/board-lanes";
import { fmtM } from "@/modules/walletModule/utils/format";
import { NOVELTY_ESTADOS } from "../../constants";
import NoveltyBoardCard from "../novelty-board-card/novelty-board-card";
import type { INoveltyRow } from "../../types";

interface NoveltiesBoardProps {
  rows: INoveltyRow[];
  onOpenDetail: (id: string) => void;
}

/** Vista "Tablero": una columna por estado, con las mismas filas de la lista. */
export default function NoveltiesBoard({ rows, onOpenDetail }: NoveltiesBoardProps) {
  const lanes: BoardLane<INoveltyRow>[] = NOVELTY_ESTADOS.map((estado) => {
    // Lo más urgente arriba. La referencia se apoyaba en el orden de origen.
    const items = rows
      .filter((n) => n.estado === estado.id)
      .sort((a, b) => a.compromiso.getTime() - b.compromiso.getTime());

    return {
      id: estado.id,
      title: estado.nom,
      items,
      total: fmtM(items.reduce((a, n) => a + n.monto, 0))
    };
  });

  return (
    <BoardLanes
      lanes={lanes}
      renderCard={(n) => <NoveltyBoardCard key={n.id} novelty={n} onOpenDetail={onOpenDetail} />}
    />
  );
}
