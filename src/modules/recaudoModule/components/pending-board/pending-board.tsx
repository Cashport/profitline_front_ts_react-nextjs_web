"use client";

import { Button } from "antd";
import { useTranslations } from "use-intl";

import { BOARDS, DEFAULT_BOARD } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import RecaudoHeader from "../recaudo-header/recaudo-header";

/** Tablero del módulo que todavía no tiene vista. */
export default function PendingBoard() {
  const tc = useTranslations("collections");
  const { filters, patch } = useTowerFilters();
  const board = BOARDS.find((b) => b.id === filters.board);

  return (
    <>
      <RecaudoHeader />
      <div className="flex min-h-[min(520px,calc(100vh_-_160px))] flex-col items-center justify-center gap-2 cp-card p-7 text-center">
        <h2 className="text-[17px] font-bold text-foreground">
          {board && tc(`boards.${board.id}.name`)}
        </h2>
        {board && (
          <p className="max-w-[440px] text-[13px] text-muted-foreground">
            {tc(`boards.${board.id}.description`)}.
          </p>
        )}
        <p className="max-w-[440px] text-[13px] text-muted-foreground">
          {tc("pendingBoard.inDesign")}
        </p>
        <Button className="mt-2.5" onClick={() => patch({ board: DEFAULT_BOARD })}>
          {tc("pendingBoard.back")}
        </Button>
      </div>
    </>
  );
}
