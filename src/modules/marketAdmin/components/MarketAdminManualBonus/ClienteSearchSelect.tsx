"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { ClienteOption } from "@/types/marketAdmin/IMarketAdmin";

export default function ClienteSearchSelect({
  clientes,
  selectedNit,
  onSelect
}: {
  clientes: ClienteOption[];
  selectedNit: string;
  onSelect: (cliente: ClienteOption) => void;
}) {
  const [search, setSearch] = useState("");

  const filtrados = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.nit.includes(search)
  );

  return (
    <div className="border border-[#DDDDDD] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#EEEEEE]">
        <Search size={13} className="text-[#999999]" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-[#141414] placeholder:text-[#999999]"
        />
      </div>
      <ul className="max-h-36 overflow-y-auto">
        {filtrados.length === 0 ? (
          <li className="px-3 py-2.5 text-sm text-[#999999]">Sin resultados</li>
        ) : (
          filtrados.map((c) => {
            const isSelected = selectedNit === c.nit;
            return (
              <li key={c.nit}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-[#F7F7F7] transition-colors ${isSelected ? "bg-[#F7F7F7]" : ""}`}
                >
                  <div className="flex-1">
                    <p className="text-sm text-[#141414]">{c.nombre}</p>
                    <p className="text-xs text-[#999999]">NIT: {c.nit}</p>
                  </div>
                  {isSelected && <Check size={13} className="text-[#141414]" />}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
