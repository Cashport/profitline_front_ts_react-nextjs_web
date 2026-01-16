"use client";

import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";

interface SellersFilterProps {
  filterVendedor: string | null;
  uniqueVendedores: string[];
  onVendedorChange: (vendedor: string | null) => void;
}

export function SellersFilter({
  filterVendedor,
  uniqueVendedores,
  onVendedorChange
}: SellersFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVendedorSelect = (vendedor: string | null) => {
    onVendedorChange(vendedor);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-4 w-4 mr-2" />
        {filterVendedor || "Todos los vendedores"}
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                filterVendedor === null
                  ? "bg-cashport-green text-cashport-black"
                  : "text-cashport-black"
              }`}
              onClick={() => handleVendedorSelect(null)}
            >
              Todos los vendedores
            </button>

            {uniqueVendedores.map((vendedor) => (
              <button
                key={vendedor}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                  filterVendedor === vendedor
                    ? "bg-cashport-green text-cashport-black"
                    : "text-cashport-black"
                }`}
                onClick={() => handleVendedorSelect(vendedor)}
              >
                {vendedor}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
