"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { IPurchaseOrderStatus } from "@/types/purchaseOrders/purchaseOrders";

interface StatesFilterProps {
  selectedStatusId: number | null;
  statuses: IPurchaseOrderStatus[];
  onFilterChange: (statusId: number | null) => void;
}

export function StatesFilter({
  selectedStatusId,
  statuses,
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

  const handleStateSelect = (statusId: number | null) => {
    onFilterChange(statusId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white font-semibold text-base"
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
                selectedStatusId === null
                  ? "bg-cashport-green text-cashport-black"
                  : "text-cashport-black"
              }`}
              onClick={() => handleStateSelect(null)}
            >
              <span>Todos los estados</span>
            </button>

            {statuses.map((status) => {
              const isActive = selectedStatusId === status.id;

              return (
                <button
                  key={status.id}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                    isActive
                      ? "bg-cashport-green text-cashport-black"
                      : "text-cashport-black"
                  }`}
                  onClick={() => handleStateSelect(status.id)}
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span>{status.name}</span>
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
