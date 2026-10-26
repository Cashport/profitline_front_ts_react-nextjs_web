"use client";

import Header from "@/components/organisms/header";
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
 * Encabezado del módulo de recaudo con el header compartido de Cashport (docs/DESIGN.md §4):
 * el selector de tableros como título, el corte al lado y, a la derecha, las herramientas del
 * tablero, el tema y el avatar. Queda fijo al hacer scroll junto con los chips de filtros.
 */
export default function RecaudoHeader({ info, tools, below }: RecaudoHeaderProps) {
  return (
    // -mb-3.5 anula el gap-3.5 de la vista: el contenido arranca justo bajo el header, como en Clientes.
    <div className="sticky top-0 z-20 -mb-3.5 flex flex-col bg-cp-bg">
      <Header
        title="Torre de control de recaudo"
        titleNode={<BoardSelector />}
        titleExtra={info}
        actionsExtra={
          <>
            {tools}
            <WalletThemeToggle />
          </>
        }
        className="!static"
      />
      {below}
    </div>
  );
}
