import { Dropdown } from "antd";
import { Filter, ChevronDown, Tag } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";

export interface ISaldosFilterValue {
  motive_ids: number[]; // selected motive ids
  from_date: string | null;
  to_date: string | null;
}

interface SaldosMotive {
  id: number;
  name: string;
}

interface IFilterBalancesProps {
  motives: SaldosMotive[];
  value: ISaldosFilterValue;
  onChange: (next: ISaldosFilterValue) => void;
  isLoading?: boolean;
}

const toggle = <T,>(arr: T[], id: T): T[] =>
  arr.includes(id) ? arr.filter((item) => item !== id) : [...arr, id];

export function FilterBalances({ motives, value, onChange, isLoading }: IFilterBalancesProps) {
  const menu = (
    <div className="bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg w-96">
      <div className="p-4 space-y-4">
        {/* Tipo Filter Section */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
            <Tag className="h-3 w-3 inline mr-1" />
            Tipo
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                value.motive_ids.length === 0
                  ? "bg-cashport-green text-cashport-black font-medium"
                  : "text-cashport-black"
              }`}
              onClick={() => onChange({ ...value, motive_ids: [] })}
            >
              Todos los tipos
            </button>

            {motives?.map((motive) => (
              <button
                type="button"
                key={motive.id}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                  value.motive_ids.includes(motive.id)
                    ? "bg-cashport-green text-cashport-black font-medium"
                    : "text-cashport-black"
                }`}
                onClick={() => onChange({ ...value, motive_ids: toggle(value.motive_ids, motive.id) })}
              >
                <div className="truncate" title={motive.name}>
                  {motive.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter Section */}
        <DateRangeFilter
          dateRange={{ start: value.from_date, end: value.to_date }}
          onDateRangeChange={(start, end) =>
            onChange({ ...value, from_date: start || null, to_date: end || null })
          }
          onClear={() => onChange({ ...value, from_date: null, to_date: null })}
        />
      </div>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => menu}
      trigger={["click"]}
      placement="bottomLeft"
      disabled={isLoading}
    >
      <Button
        variant="outline"
        disabled={isLoading}
        className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filtros
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>
    </Dropdown>
  );
}
