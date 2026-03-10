"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Building, User } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import { IPurchaseOrderClient, IPurchaseOrderSeller } from "@/types/purchaseOrders/purchaseOrders";

interface GeneralFilterProps {
  showCompradorFilter: boolean;
  clienteFilterLabel?: string;
  selectedClientId: string | null;
  clients: IPurchaseOrderClient[];
  onCompradorChange: (clientId: string | null) => void;
  showVendedorFilter?: boolean;
  selectedSellerId: string | null;
  sellers: IPurchaseOrderSeller[];
  onVendedorChange: (sellerId: string | null) => void;
  filterDateRange: { start: string | null; end: string | null };
  onDateRangeChange: (start: string, end: string) => void;
  onClearDateRange: () => void;
}

export function GeneralFilter({
  showCompradorFilter,
  clienteFilterLabel,
  selectedClientId,
  clients,
  onCompradorChange,
  showVendedorFilter = false,
  selectedSellerId,
  sellers,
  onVendedorChange,
  filterDateRange,
  onDateRangeChange,
  onClearDateRange
}: GeneralFilterProps) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white font-semibold text-base"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4">
            {/* Cliente Filter Section */}
            {showCompradorFilter && (
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                  <Building className="h-3 w-3 inline mr-1" />
                  {clienteFilterLabel || "Cliente"}
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  <button
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                      selectedClientId === null
                        ? "bg-cashport-green text-cashport-black font-medium"
                        : "text-cashport-black"
                    }`}
                    onClick={() => onCompradorChange(null)}
                  >
                    Todos los {clienteFilterLabel || "clientes"}
                  </button>

                  {clients.map((client) => (
                    <button
                      key={client.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                        selectedClientId === client.id
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onCompradorChange(client.id)}
                    >
                      <div className="truncate" title={client.name}>
                        {client.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Vendedor Filter Section */}
            {showVendedorFilter && (
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                  <User className="h-3 w-3 inline mr-1" />
                  Vendedor
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  <button
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                      selectedSellerId === null
                        ? "bg-cashport-green text-cashport-black font-medium"
                        : "text-cashport-black"
                    }`}
                    onClick={() => onVendedorChange(null)}
                  >
                    Todos los vendedores
                  </button>

                  {sellers.map((seller) => (
                    <button
                      key={seller.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                        selectedSellerId === seller.id
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onVendedorChange(seller.id)}
                    >
                      <div className="truncate" title={seller.name}>
                        {seller.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter Section */}
            <DateRangeFilter
              dateRange={filterDateRange}
              onDateRangeChange={onDateRangeChange}
              onClear={onClearDateRange}
            />

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
