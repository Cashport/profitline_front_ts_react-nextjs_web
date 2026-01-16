"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Calendar, Building } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";

interface GeneralFilterProps {
  showCompradorFilter: boolean;
  clienteFilterLabel?: string;
  filterComprador: string | null;
  uniqueCompradores: string[];
  onCompradorChange: (comprador: string | null) => void;
  filterDateRange: { start: string | null; end: string | null };
  onDateRangeChange: (start: string, end: string) => void;
  onClearDateRange: () => void;
}

export function GeneralFilter({
  showCompradorFilter,
  clienteFilterLabel,
  filterComprador,
  uniqueCompradores,
  onCompradorChange,
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
        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white"
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
                      filterComprador === null
                        ? "bg-cashport-green text-cashport-black font-medium"
                        : "text-cashport-black"
                    }`}
                    onClick={() => onCompradorChange(null)}
                  >
                    Todos los {clienteFilterLabel || "clientes"}
                  </button>

                  {uniqueCompradores.map((comprador) => (
                    <button
                      key={comprador}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                        filterComprador === comprador
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onCompradorChange(comprador)}
                    >
                      <div className="truncate" title={comprador}>
                        {comprador}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter Section */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                <Calendar className="h-3 w-3 inline mr-1" />
                Rango de fechas
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fecha inicio</label>
                    <Input
                      type="date"
                      value={filterDateRange.start || ""}
                      onChange={(e) =>
                        onDateRangeChange(e.target.value, filterDateRange.end || "")
                      }
                      className="bg-cashport-white border-cashport-gray-light text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fecha fin</label>
                    <Input
                      type="date"
                      value={filterDateRange.end || ""}
                      onChange={(e) =>
                        onDateRangeChange(filterDateRange.start || "", e.target.value)
                      }
                      className="bg-cashport-white border-cashport-gray-light text-sm"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearDateRange}
                  className="w-full border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
                >
                  Limpiar fechas
                </Button>
              </div>
            </div>

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
