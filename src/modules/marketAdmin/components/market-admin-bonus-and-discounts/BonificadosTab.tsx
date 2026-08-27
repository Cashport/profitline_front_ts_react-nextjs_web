"use client";

import DiscountsToolbar from "./DiscountsToolbar";

interface BonificadosTabProps {
  onCrearNuevo: () => void;
}

// Placeholder — the bonificados table is not wired up yet.
export default function BonificadosTab({ onCrearNuevo }: BonificadosTabProps) {
  return (
    <>
      <DiscountsToolbar onCrearNuevo={onCrearNuevo} />

      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-[#999999]">No hay bonificados para mostrar.</p>
      </div>
    </>
  );
}
