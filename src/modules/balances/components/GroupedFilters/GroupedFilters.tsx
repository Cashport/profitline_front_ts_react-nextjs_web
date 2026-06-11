import { Dropdown } from "antd";
import { Filter, ChevronDown, Building, Users } from "lucide-react";

import { Button } from "@/modules/chat/ui/button";
import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";
import {
  IBalancesFilter,
  IBalancesFilterClient,
  IBalancesFilterUser
} from "@/types/financialDiscounts/IFinancialDiscounts";

interface GroupedFiltersProps {
  users: IBalancesFilterUser[];
  clients: IBalancesFilterClient[];
  value: IBalancesFilter;
  onChange: (next: IBalancesFilter) => void;
  isLoading?: boolean;
}

const toggle = <T,>(arr: T[], id: T): T[] =>
  arr.includes(id) ? arr.filter((item) => item !== id) : [...arr, id];

export function GroupedFilters({
  users,
  clients,
  value,
  onChange,
  isLoading
}: GroupedFiltersProps) {
  const menu = (
    <div className="bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg w-96">
      <div className="p-4 space-y-4">
        {/* KAM Filter Section */}
        <div>
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
            <Users className="h-3 w-3 inline mr-1" />
            KAM
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            <button
              type="button"
              className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors ${
                value.users.length === 0
                  ? "bg-cashport-green text-cashport-black font-medium"
                  : "text-cashport-black"
              }`}
              onClick={() => onChange({ ...value, users: [] })}
            >
              Todos los KAM
            </button>

            {users?.map((user) => (
              <button
                type="button"
                key={user.id}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                  value.users.includes(user.id)
                    ? "bg-cashport-green text-cashport-black font-medium"
                    : "text-cashport-black"
                }`}
                onClick={() => onChange({ ...value, users: toggle(value.users, user.id) })}
              >
                <div className="truncate" title={user.name}>
                  {user.name}
                </div>
              </button>
            ))}
          </div>
        </div>

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
                value.clients.length === 0
                  ? "bg-cashport-green text-cashport-black font-medium"
                  : "text-cashport-black"
              }`}
              onClick={() => onChange({ ...value, clients: [] })}
            >
              Todos los clientes
            </button>

            {clients?.map((client) => (
              <button
                type="button"
                key={client.id}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                  value.clients.includes(client.id)
                    ? "bg-cashport-green text-cashport-black font-medium"
                    : "text-cashport-black"
                }`}
                onClick={() => onChange({ ...value, clients: toggle(value.clients, client.id) })}
              >
                <div className="truncate" title={client.name}>
                  {client.name}
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
