"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, FileText, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";

export const documentStateConfig = [
  { name: "Novedad", color: "#E53935", icon: XCircle, textColor: "text-white" },
  { name: "En validación", color: "#2196F3", icon: CheckCircle, textColor: "text-white" },
  { name: "En aprobaciones", color: "#9C27B0", icon: CheckCircle, textColor: "text-white" },
  { name: "En facturación", color: "#FFC107", icon: FileText, textColor: "text-black" },
  { name: "Facturado", color: "#4CAF50", icon: CheckCircle, textColor: "text-white" },
  { name: "En despacho", color: "#009688", icon: CheckCircle, textColor: "text-white" },
  { name: "Entregado", color: "#2E7D32", icon: CheckCircle, textColor: "text-white" },
  { name: "Back order", color: "#000000", icon: XCircle, textColor: "text-white" }
];

interface StatesFilterProps {
  filterState: string | null;
  invoiceCounts: Record<string, number>;
  totalCount: number;
  onFilterChange: (state: string | null) => void;
}

export function StatesFilter({
  filterState,
  invoiceCounts,
  totalCount,
  onFilterChange
}: StatesFilterProps) {
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

  const handleStateSelect = (stateName: string | null) => {
    onFilterChange(stateName);
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
        <Filter className="h-4 w-4 mr-2" />
        Estados
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
          <div className="p-1">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                filterState === null
                  ? "bg-cashport-green text-cashport-black"
                  : "text-cashport-black"
              }`}
              onClick={() => handleStateSelect(null)}
            >
              <div className="flex items-center justify-between">
                <span>Todos los estados</span>
                <Badge
                  variant="secondary"
                  className="bg-cashport-gray-lighter text-cashport-black"
                >
                  {totalCount}
                </Badge>
              </div>
            </button>

            {documentStateConfig.map((stateConfig) => {
              const count = invoiceCounts[stateConfig.name] || 0;
              const isActive = filterState === stateConfig.name;

              return (
                <button
                  key={stateConfig.name}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                    isActive
                      ? "bg-cashport-green text-cashport-black"
                      : "text-cashport-black"
                  }`}
                  onClick={() => handleStateSelect(stateConfig.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: stateConfig.color }}
                      ></div>
                      <span>{stateConfig.name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-cashport-gray-lighter text-cashport-black"
                    >
                      {count}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
