import { Dropdown } from "antd";
import { Filter, ChevronDown } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";

interface StatusFilterProps {
  filterState: string | null;
  saldoCounts: Record<string, number>;
  totalCount: number;
  estadoConfig: Record<string, { color: string; icon: React.ElementType; textColor: string }>;
  onFilterChange: (estado: string | null) => void;
}

export function StatusFilter({
  filterState,
  saldoCounts,
  totalCount,
  estadoConfig,
  onFilterChange
}: StatusFilterProps) {
  const menu = (
    <div className="bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg w-64">
      <div className="p-1">
        <button
          type="button"
          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
            filterState === null
              ? "bg-cashport-green text-cashport-black"
              : "text-cashport-black"
          }`}
          onClick={() => onFilterChange(null)}
        >
          <div className="flex items-center justify-between">
            <span>Todos los estados</span>
            <Badge variant="secondary" className="bg-cashport-gray-lighter text-cashport-black">
              {totalCount}
            </Badge>
          </div>
        </button>

        {(Object.keys(estadoConfig) as string[]).map((estadoKey) => {
          const config = estadoConfig[estadoKey];
          const count = saldoCounts[estadoKey] || 0;
          const isActive = filterState === estadoKey;

          return (
            <button
              type="button"
              key={estadoKey}
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                isActive ? "bg-cashport-green text-cashport-black" : "text-cashport-black"
              }`}
              onClick={() => onFilterChange(estadoKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{estadoKey}</span>
                </div>
                <Badge variant="secondary" className="bg-cashport-gray-lighter text-cashport-black">
                  {count}
                </Badge>
              </div>
            </button>
          );
        })}
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
        Estados
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </Dropdown>
  );
}
