"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Calendar, FileText } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";

interface DataQualityGeneralFilterProps {
  selectedStatus: string;
  onStatusChange: (value: string | null) => void;
  selectedPeriodicity: string;
  onPeriodicityChange: (value: string | null) => void;
  selectedFileType: string;
  onFileTypeChange: (value: string | null) => void;
}

const STATUS_OPTIONS = [
  { value: null, label: "Todos los estados" },
  { value: "processed", label: "Procesado" },
  { value: "pending", label: "Pendiente" },
  { value: "with-alert", label: "Con novedad" },
  { value: "partial", label: "Procesado parcial" }
];

const PERIODICITY_OPTIONS = [
  { value: null, label: "Todas las periodicidades" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" }
];

const FILE_TYPE_OPTIONS = [
  { value: null, label: "Todos los archivos" },
  { value: "stock", label: "Stock" },
  { value: "sales", label: "Sales" },
  { value: "in transit", label: "In transit" }
];

export function DataQualityGeneralFilter({
  selectedStatus,
  onStatusChange,
  selectedPeriodicity,
  onPeriodicityChange,
  selectedFileType,
  onFileTypeChange
}: DataQualityGeneralFilterProps) {
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
        className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-cashport-white font-normal text-base"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter className="h-4 w-4 mr-2" />
        <span className="hidden min-[930px]:inline">Filtros</span>
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 min-[900px]:right-auto min-[900px]:left-0 mt-1 w-96 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto [scrollbar-width:thin]">
            {/* Estados Section */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                <Filter className="h-3 w-3 inline mr-1" />
                Estados
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected =
                    option.value === null
                      ? selectedStatus === "all"
                      : selectedStatus === option.value;

                  return (
                    <button
                      key={option.value ?? "all"}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                        option.value !== null ? "border-t border-gray-100" : ""
                      } ${
                        isSelected
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onStatusChange(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Periodicidad Section */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                <Calendar className="h-3 w-3 inline mr-1" />
                Periodicidad
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {PERIODICITY_OPTIONS.map((option) => {
                  const isSelected =
                    option.value === null
                      ? selectedPeriodicity === "all"
                      : selectedPeriodicity === option.value;

                  return (
                    <button
                      key={option.value ?? "all"}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                        option.value !== null ? "border-t border-gray-100" : ""
                      } ${
                        isSelected
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onPeriodicityChange(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tipo de archivo Section */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
                <FileText className="h-3 w-3 inline mr-1" />
                Tipo de archivo
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {FILE_TYPE_OPTIONS.map((option) => {
                  const isSelected =
                    option.value === null
                      ? selectedFileType === "all"
                      : selectedFileType === option.value;

                  return (
                    <button
                      key={option.value ?? "all"}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                        option.value !== null ? "border-t border-gray-100" : ""
                      } ${
                        isSelected
                          ? "bg-cashport-green text-cashport-black font-medium"
                          : "text-cashport-black"
                      }`}
                      onClick={() => onFileTypeChange(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
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
