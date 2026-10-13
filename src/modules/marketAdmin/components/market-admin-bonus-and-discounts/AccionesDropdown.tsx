"use client";

import { useEffect, useRef, useState } from "react";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";

interface AccionesDropdownProps {
  selectedCount: number;
  entityLabel: string;
  onClearSelection: () => void;
}

export default function AccionesDropdown({
  selectedCount,
  entityLabel,
  onClearSelection
}: AccionesDropdownProps) {
  const [showAcciones, setShowAcciones] = useState(false);
  const accionesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accionesRef.current && !accionesRef.current.contains(e.target as Node))
        setShowAcciones(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function runAccion(accion: string) {
    setShowAcciones(false);
    onClearSelection();
    alert(`Acción "${accion}" aplicada a ${selectedCount} ${entityLabel}.`);
  }

  return (
    <div className="relative" ref={accionesRef}>
      <GenerateActionButton
        disabled={selectedCount === 0}
        onClick={() => selectedCount > 0 && setShowAcciones((v) => !v)}
      />
      {showAcciones && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-[#EEEEEE] rounded-xl shadow-lg z-30 w-48 py-1">
          <button
            onClick={() => runAccion("Activar")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            Activar
          </button>
          <button
            onClick={() => runAccion("Vencer")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            Marcar como vencido
          </button>
          <div className="h-px bg-[#EEEEEE] my-1" />
          <button
            onClick={() => runAccion("Exportar")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            Exportar selección
          </button>
        </div>
      )}
    </div>
  );
}
