"use client";

import { CaretLeft } from "phosphor-react";

interface Props {
  title: string;
  /** Vuelve a la vista anterior dentro de la misma ruta (estado local, no el historial). */
  onBack: () => void;
}

/**
 * Título del `Header` compartido con "‹" para sub-vistas que se abren por estado
 * (no por URL): el `back` del Header usa el historial y saldría de la ruta.
 * Replica las medidas de `back` y `title` del Header (docs/DESIGN.md §4).
 */
export default function HeaderBackTitle({ title, onBack }: Props) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        title="Volver"
        className="-ml-1 flex h-[var(--control-h)] flex-shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent px-0.5 text-inherit"
      >
        <CaretLeft size={21} weight="bold" />
      </button>
      <h1 className="m-0 truncate text-[18px] font-semibold leading-[1.2]">{title}</h1>
    </div>
  );
}
