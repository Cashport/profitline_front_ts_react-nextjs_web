import { Dropdown } from "antd";
import { Filter, ChevronDown, Building, Calendar } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";

interface DateRange {
  start: string | null;
  end: string | null;
}

interface GroupedFiltersProps {
  filterCliente: string | null;
  filterDateRange: DateRange;
  uniqueClientes: string[];
  onClienteChange: (cliente: string | null) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onClearDateRange: () => void;
}

export function GroupedFilters({
  filterCliente,
  filterDateRange,
  uniqueClientes,
  onClienteChange,
  onDateRangeChange,
  onClearDateRange
}: GroupedFiltersProps) {
  const menu = (
    <div className="bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg w-96">
      <div className="p-4 space-y-4">
        {/* Cliente Filter Section */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
            <Building className="h-3 w-3 inline mr-1" />
            Cliente
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                filterCliente === null
                  ? "bg-cashport-green text-cashport-black font-medium"
                  : "text-cashport-black"
              }`}
              onClick={() => onClienteChange(null)}
            >
              Todos los clientes
            </button>

            {uniqueClientes?.map((cliente) => (
              <button
                type="button"
                key={cliente}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                  filterCliente === cliente
                    ? "bg-cashport-green text-cashport-black font-medium"
                    : "text-cashport-black"
                }`}
                onClick={() => onClienteChange(cliente)}
              >
                <div className="truncate" title={cliente}>
                  {cliente}
                </div>
              </button>
            ))}
          </div>
        </div>

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
                  onChange={(e) => onDateRangeChange(e.target.value, filterDateRange.end || "")}
                  className="bg-cashport-white border-cashport-gray-light text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Fecha fin</label>
                <Input
                  type="date"
                  value={filterDateRange.end || ""}
                  onChange={(e) => onDateRangeChange(filterDateRange.start || "", e.target.value)}
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
      </div>
    </div>
  );

  return (
    <Dropdown dropdownRender={() => menu} trigger={["click"]} placement="bottomLeft">
      <Button
        variant="outline"
        className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
      >
        <Filter className="h-4 w-4 mr-2" />
        Más filtros
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </Dropdown>
  );
}
