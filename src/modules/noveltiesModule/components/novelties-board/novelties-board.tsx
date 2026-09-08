"use client";

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
  return (
    <div className="grid auto-cols-[minmax(238px,1fr)] grid-flow-col items-start gap-3 overflow-x-auto pb-1.5">
      {NOVELTY_ESTADOS.map((estado) => {
        // Lo más urgente arriba. La referencia se apoyaba en el orden de origen.
        const columna = rows
          .filter((n) => n.estado === estado.id)
          .sort((a, b) => a.compromiso.getTime() - b.compromiso.getTime());

        return (
          <div
            key={estado.id}
            className="flex min-h-[120px] flex-col rounded-xl border border-border bg-muted/40"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
              <h4 className="text-xs font-semibold text-foreground">{estado.nom}</h4>
              <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
                {columna.length} · {fmtM(columna.reduce((a, n) => a + n.monto, 0))}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-2">
              {columna.length === 0 ? (
                <div className="p-2.5 text-[11.5px] text-muted-foreground">Vacío</div>
              ) : (
                columna.map((n) => (
                  <NoveltyBoardCard key={n.id} novelty={n} onOpenDetail={onOpenDetail} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
