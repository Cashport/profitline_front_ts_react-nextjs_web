import { useState } from "react";
import { ChevronDown, MapPin, Plus, Check } from "lucide-react";

import { ICommerceAdresses } from "@/types/commerce/ICommerce";
import { ISelectedAddress } from "../types";

interface IDireccionDropdownProps {
  addresses: ICommerceAdresses[];
  selected: ISelectedAddress | null;
  onSelect: (a: ISelectedAddress) => void;
  onCreateNew: () => void;
  disabled?: boolean;
}

// ── Dirección dropdown (real addresses + "Nueva dirección" -> AntD modal) ──
function DireccionDropdown({
  addresses,
  selected,
  onSelect,
  onCreateNew,
  disabled = false
}: IDireccionDropdownProps) {
  const [open, setOpen] = useState(false);

  // Collapse the menu if it was open before becoming disabled (e.g. canal cleared).
  const isOpen = open && !disabled;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F7F7] border border-[#DDDDDD] rounded-lg text-sm text-left transition-colors hover:border-[#141414] focus:outline-none disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#DDDDDD]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin size={14} className="text-[#999999] flex-shrink-0" />
          {selected ? (
            <span className="text-[#141414] truncate">
              <span className="font-medium">{selected.dispatch_address}</span>
              <span className="text-[#999999]"> — {selected.city}</span>
            </span>
          ) : (
            <span className="text-[#999999]">Seleccione una dirección</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-[#666666] transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#DDDDDD] rounded-lg shadow-lg z-20 overflow-hidden">
            <ul className="py-1 max-h-56 overflow-y-auto">
              {addresses.length === 0 ? (
                <li className="px-4 py-3 text-sm text-[#999999] text-center">
                  Sin direcciones guardadas
                </li>
              ) : (
                addresses.map((d) => {
                  const isSelected = selected?.id === d.id && d.id !== undefined;
                  return (
                    <li key={d.id}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 hover:bg-[#F7F7F7] transition-colors flex items-start gap-3 ${isSelected ? "bg-[#F7F7F7]" : ""}`}
                        onClick={() => {
                          onSelect({
                            id: d.id,
                            city: d.city,
                            dispatch_address: d.address,
                            email: d.email,
                            warehouse: d.warehouse_description
                          });
                          setOpen(false);
                        }}
                      >
                        <MapPin size={14} className="text-[#999999] mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#141414]">{d.address}</p>
                          <p className="text-xs text-[#999999] truncate">{d.city}</p>
                        </div>
                        {isSelected && (
                          <Check
                            size={14}
                            className="text-[#141414] ml-auto flex-shrink-0 mt-0.5"
                          />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="border-t border-[#DDDDDD]" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreateNew();
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#141414] hover:bg-[#F7F7F7] transition-colors"
            >
              <Plus size={14} />
              Nueva dirección
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DireccionDropdown;
