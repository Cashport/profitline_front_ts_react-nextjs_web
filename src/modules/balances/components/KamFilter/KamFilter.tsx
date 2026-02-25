import { Dropdown } from "antd";
import { Filter, ChevronDown } from "lucide-react";

import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import type { SaldoData } from "../../context/saldos-context";

interface KamFilterProps {
  filterKam: string | null;
  uniqueKams: string[];
  totalCount: number;
  saldos: SaldoData[];
  onFilterChange: (kam: string | null) => void;
}

export function KamFilter({ filterKam, uniqueKams, totalCount, saldos, onFilterChange }: KamFilterProps) {
  const menu = (
    <div className="bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg w-64">
      <div className="p-1">
        <button
          type="button"
          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
            filterKam === null
              ? "bg-cashport-green text-cashport-black"
              : "text-cashport-black"
          }`}
          onClick={() => onFilterChange(null)}
        >
          <div className="flex items-center justify-between">
            <span>Todos los KAM</span>
            <Badge variant="secondary" className="bg-cashport-gray-lighter text-cashport-black">
              {totalCount}
            </Badge>
          </div>
        </button>

        {uniqueKams.map((kam) => {
          const count = saldos.filter((s) => s.kam === kam).length;
          const isActive = filterKam === kam;

          return (
            <button
              type="button"
              key={kam}
              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                isActive ? "bg-cashport-green text-cashport-black" : "text-cashport-black"
              }`}
              onClick={() => onFilterChange(kam)}
            >
              <div className="flex items-center justify-between">
                <span>{kam}</span>
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
        KAM
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </Dropdown>
  );
}
