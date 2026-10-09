import React from "react";

interface FilterModalFooterProps {
  onClearAll: () => void;
  onCancel: () => void;
  onApply: () => void;
}

export default function FilterModalFooter({
  onClearAll,
  onCancel,
  onApply
}: FilterModalFooterProps) {
  return (
    <div className="p-4 border-t border-border flex items-center justify-between bg-card/80 backdrop-blur-sm relative z-10">
      <button
        type="button"
        onClick={onClearAll}
        className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary"
      >
        Limpiar todo
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onApply}
          className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
