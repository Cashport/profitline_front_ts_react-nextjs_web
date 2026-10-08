"use client";

import { Button } from "antd";

import { BOARDS, DEFAULT_BOARD } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import RecaudoHeader from "../recaudo-header/recaudo-header";

/** Tablero del módulo que todavía no tiene vista. */
export default function PendingBoard() {
  const { filters, patch } = useTowerFilters();
  const board = BOARDS.find((b) => b.id === filters.board);

  return (
    <>
      <RecaudoHeader />
      <div className="flex min-h-[min(520px,calc(100vh_-_160px))] flex-col items-center justify-center gap-2 rounded-xl bg-card p-7 text-center shadow-sm">
        <h2 className="text-[17px] font-bold text-foreground">{board?.name}</h2>
        {board && <p className="max-w-[440px] text-[12.5px] text-muted-foreground">{board.description}.</p>}
        <p className="max-w-[440px] text-[12.5px] text-muted-foreground">
          Este tablero se diseña en una siguiente iteración.
        </p>
        <Button className="mt-2.5" onClick={() => patch({ board: DEFAULT_BOARD })}>
          Volver a la Torre de control
        </Button>
      </div>
    </>
  );
}
