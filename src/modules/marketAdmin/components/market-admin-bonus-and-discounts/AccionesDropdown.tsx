"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";

interface AccionesDropdownProps {
  selectedCount: number;
  /** Qué se seleccionó en la tabla (solo para el texto del aviso). */
  entity: "packages" | "rules";
  onClearSelection: () => void;
}

export default function AccionesDropdown({
  selectedCount,
  entity,
  onClearSelection
}: AccionesDropdownProps) {
  const t = useTranslations("marketAdmin.discountsTable.bulkActions");
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

  function runAccion(accion: "activate" | "expire" | "export") {
    setShowAcciones(false);
    onClearSelection();
    alert(t("applied", { action: t(`actionNames.${accion}`), count: selectedCount, entity }));
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
            onClick={() => runAccion("activate")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            {t("activate")}
          </button>
          <button
            onClick={() => runAccion("expire")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            {t("markExpired")}
          </button>
          <div className="h-px bg-[#EEEEEE] my-1" />
          <button
            onClick={() => runAccion("export")}
            className="w-full text-left px-4 py-2.5 text-sm text-[#141414] hover:bg-[#F5F5F5]"
          >
            {t("exportSelection")}
          </button>
        </div>
      )}
    </div>
  );
}
