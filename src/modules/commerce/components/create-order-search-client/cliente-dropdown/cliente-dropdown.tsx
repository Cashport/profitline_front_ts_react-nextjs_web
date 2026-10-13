import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import { IEcommerceClient } from "@/types/commerce/ICommerce";

interface IClienteDropdownProps {
  options: IEcommerceClient[];
  loading: boolean;
  selected: IEcommerceClient | null;
  onSelect: (c: IEcommerceClient) => void;
}

// ── Cliente dropdown (real clients via getClients) ─────────────────────────
function ClienteDropdown({ options, loading, selected, onSelect }: IClienteDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((c) =>
    c.client_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg text-sm text-left transition-colors hover:border-[#141414] focus:outline-none"
      >
        <span className={selected ? "text-[#141414] truncate" : "text-[#999999]"}>
          {selected ? selected.client_name : "Seleccione un cliente"}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#666666] transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDDDDD] rounded-lg shadow-lg z-20">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#DDDDDD]">
              <Search size={14} className="text-[#999999] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-[#141414] placeholder:text-[#999999]"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto py-1">
              {loading ? (
                <li className="px-4 py-3 text-sm text-[#999999] text-center">Cargando…</li>
              ) : filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[#999999] text-center">Sin resultados</li>
              ) : (
                filtered.map((c) => (
                  <li key={c.client_id}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-3 hover:bg-[#F7F7F7] transition-colors ${selected?.client_id === c.client_id ? "bg-[#F7F7F7]" : ""}`}
                      onClick={() => {
                        onSelect(c);
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      <p className="text-sm font-medium text-[#141414]">{c.client_name}</p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default ClienteDropdown;
