"use client";

import WalletThemeToggle from "@/modules/walletModule/components/wallet-theme-toggle/wallet-theme-toggle";
import BoardSelector from "../board-selector/board-selector";

interface RecaudoHeaderProps {
  /** Junto al título: el corte de la foto. */
  info?: React.ReactNode;
  /** A la derecha, antes del tema: búsqueda, periodo y filtros del tablero. */
  tools?: React.ReactNode;
  /** Debajo de la barra: los chips de filtros activos. */
  below?: React.ReactNode;
}

/**
 * Encabezado del módulo de recaudo: selector de tableros, corte, herramientas
 * del tablero y tema. Queda fijo al hacer scroll.
 *
 * El contenedor que hace scroll (.rightContent de ViewWrapper) tiene 1rem de
 * padding arriba y el navegador deja lo sticky debajo de ese padding: con
 * top-0 quedaba una franja por donde se veía pasar el tablero. Con -top-4 sube
 * hasta el borde del contenedor y su pt-4 tapa la franja; el -mt-4 compensa ese
 * pt-4 para que, sin scroll, quede donde estaba. Su fondo es el de la página
 * (#f7f7f7 de ViewWrapper en claro, --background en oscuro).
 */
export default function RecaudoHeader({ info, tools, below }: RecaudoHeaderProps) {
  return (
    <div className="sticky -top-4 z-20 -mt-4 flex flex-col gap-2.5 bg-[#f7f7f7] pb-0.5 pt-4 dark:bg-background">
      <header className="flex flex-wrap items-center gap-3.5 border-b border-border pb-3">
        <BoardSelector />
        {info}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {tools}
          <WalletThemeToggle />
        </div>
      </header>
      {below}
    </div>
  );
}
