import React from "react";

interface FilterModalFooterProps {
  onClearAll: () => void;
  onCancel: () => void;
  onApply: () => void;
}

/** Pie del modal (docs/DESIGN.md §6): "Limpiar todo" a la izquierda; Cancelar y "Aplicar Filtros" lima. */
export default function FilterModalFooter({
  onClearAll,
  onCancel,
  onApply
}: FilterModalFooterProps) {
  return (
    <div className="flex items-center gap-2 border-t border-cp-line px-[22px] py-3.5">
      <button
        type="button"
        onClick={onClearAll}
        className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-cp-ink-2"
      >
        Limpiar todo
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onCancel}
        className="h-10 cursor-pointer border-0 bg-transparent px-3.5 text-[13px] font-semibold text-cp-ink"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onApply}
        className="h-10 cursor-pointer rounded-[10px] border-0 bg-cp-lime px-[18px] text-[13px] font-semibold text-[#141414] hover:bg-[#d8f032]"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}
