"use client";

import { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { IPurchaseOrderSeller } from "@/types/purchaseOrders/purchaseOrders";

interface SellersFilterProps {
  selectedSellerId: string | null;
  sellers: IPurchaseOrderSeller[];
  onVendedorChange: (sellerId: string | null) => void;
}

export function SellersFilter({
  selectedSellerId,
  sellers,
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

  const handleVendedorSelect = (sellerId: string | null) => {
    onVendedorChange(sellerId);
    setIsOpen(false);
  };

  // Find the selected seller name for display
  const selectedSellerName = selectedSellerId
    ? sellers.find(s => s.id === selectedSellerId)?.name
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User className="h-4 w-4 mr-2" />
        {selectedSellerName || "Todos los vendedores"}
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                selectedSellerId === null
                  ? "bg-cashport-green text-cashport-black"
                  : "text-cashport-black"
              }`}
              onClick={() => handleVendedorSelect(null)}
            >
              Todos los vendedores
            </button>

            {sellers.map((seller) => (
              <button
                key={seller.id}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                  selectedSellerId === seller.id
                    ? "bg-cashport-green text-cashport-black"
                    : "text-cashport-black"
                }`}
                onClick={() => handleVendedorSelect(seller.id)}
              >
                {seller.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
