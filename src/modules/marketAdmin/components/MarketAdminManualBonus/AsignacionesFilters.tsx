"use client";

import { EstadoAprobacion } from "@/types/marketAdmin/IMarketAdmin";
import { ESTADO_CONFIG } from "./estadoConfig";
import SearchField from "@/components/ui/search-field/search-field";

const FILTROS = ["todos", "pendiente", "aprobado", "rechazado"] as const;

export default function AsignacionesFilters({
  search,
  onSearchChange,
  filtroEstado,
  onFiltroChange
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filtroEstado: EstadoAprobacion | "todos";
  onFiltroChange: (value: EstadoAprobacion | "todos") => void;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-[#EEEEEE]">
      <SearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar cliente o producto..."
        className="w-72"
      />
      <div className="flex items-center gap-1">
        {FILTROS.map((estado) => (
          <button
            key={estado}
            onClick={() => onFiltroChange(estado)}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-lg transition-colors capitalize ${
              filtroEstado === estado
                ? "bg-[#141414] text-white"
                : "text-[#666666] hover:bg-[#F7F7F7]"
            }`}
          >
            {estado === "todos" ? "Todos" : ESTADO_CONFIG[estado].label}
          </button>
        ))}
      </div>
    </div>
  );
}
