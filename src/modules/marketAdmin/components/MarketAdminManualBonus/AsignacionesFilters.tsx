"use client";

import { Search } from "lucide-react";
import { EstadoAprobacion } from "@/types/marketAdmin/IMarketAdmin";
import { ESTADO_CONFIG } from "./estadoConfig";

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
      <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg">
        <Search size={13} className="text-[#999999]" />
        <input
          type="text"
          placeholder="Buscar cliente o producto..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm outline-none bg-transparent text-[#141414] placeholder:text-[#999999] w-56"
        />
      </div>
      <div className="flex items-center gap-1">
        {FILTROS.map((estado) => (
          <button
            key={estado}
            onClick={() => onFiltroChange(estado)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
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
