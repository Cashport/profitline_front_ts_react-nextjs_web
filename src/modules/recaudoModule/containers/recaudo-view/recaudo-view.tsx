"use client";

import type { ComponentType } from "react";

import { useAppStore } from "@/lib/store/store";
import PendingBoard from "../../components/pending-board/pending-board";
import TorreBoard from "../../components/torre-board/torre-board";
import { BOARDS } from "../../constants";
import { TowerFiltersProvider, useTowerFilters } from "../../contexts/tower-filters-context";
import type { BoardId } from "../../types";

/** Vista de cada tablero del módulo (ver BOARDS). Uno sin vista muestra PendingBoard. */
const BOARD_VIEWS: Partial<Record<BoardId, ComponentType>> = { torre: TorreBoard };

function ActiveBoard() {
  const { filters } = useTowerFilters();
  const board = BOARDS.find((b) => b.id === filters.board);
  const View = (board?.enabled && BOARD_VIEWS[board.id]) || PendingBoard;

  return (
    <div className="wallet-scope flex flex-col gap-3.5 pb-6">
      <View />
    </div>
  );
}

/**
 * Módulo de recaudo en /dashboard: selector de tableros + el tablero activo.
 * Los filtros son por proyecto: al cambiarlo, el provider se remonta y el
 * tablero arranca de cero.
 */
export default function RecaudoView() {
  const projectId = useAppStore((s) => s.selectedProject?.ID ?? null);

  return (
    <TowerFiltersProvider key={projectId ?? "sin-proyecto"}>
      <ActiveBoard />
    </TowerFiltersProvider>
  );
}
