"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ClienteOption } from "@/types/marketAdmin/IMarketAdmin";
import SearchField from "@/components/ui/search-field/search-field";

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
      <div className="border-b border-[#EEEEEE] p-2">
        <SearchField value={search} onChange={setSearch} placeholder="Buscar cliente..." />
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
                    <p className="text-[13px] text-[#999999]">NIT: {c.nit}</p>
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
