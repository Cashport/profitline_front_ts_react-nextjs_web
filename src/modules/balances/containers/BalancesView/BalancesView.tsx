"use client";

import { useState } from "react";

import { Spin } from "antd";
import { CheckCircle, Clock, XCircle, CircleDot } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import Collapse from "@/components/ui/collapse";
import LabelCollapse from "@/components/ui/label-collapse";
import { Sheet, SheetContent } from "@/modules/chat/ui/sheet";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { BalanceDetailModal } from "../../components/BalanceDetailModal/BalanceDetailModal";
import { BalancesTable } from "../../components/BalancesTable/BalancesTable";
import { GroupedFilters } from "../../components/GroupedFilters/GroupedFilters";
import { KamFilter } from "../../components/KamFilter/KamFilter";
import { StatusFilter } from "../../components/StatusFilter/StatusFilter";
import { useSaldos } from "../../context/saldos-context";
import { useBalances } from "@/hooks/useBalances";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";

const estadoConfig: Record<string, { color: string; icon: typeof CheckCircle; textColor: string }> =
  {
    "Pendiente NC": { color: "#FF9800", icon: Clock, textColor: "text-black" },
    Pendiente: { color: "#FFC107", icon: Clock, textColor: "text-black" },
    "En revisión": { color: "#2196F3", icon: CircleDot, textColor: "text-white" },
    Aprobado: { color: "#4CAF50", icon: CheckCircle, textColor: "text-white" },
    Aplicado: { color: "#2E7D32", icon: CheckCircle, textColor: "text-white" },
    Rechazado: { color: "#E53935", icon: XCircle, textColor: "text-white" },
    "Aplicado parcial": { color: "#9C27B0", icon: CircleDot, textColor: "text-white" }
  };

const matchesSearch = (balance: IBalanceRow, term: string) => {
  if (!term) return true;
  const lowerTerm = term.toLowerCase();
  return (
    String(balance.id).toLowerCase().includes(lowerTerm) ||
    (balance.client_name ?? "").toLowerCase().includes(lowerTerm) ||
    (balance.kam_name ?? "").toLowerCase().includes(lowerTerm) ||
    (balance.motive_name ?? "").toLowerCase().includes(lowerTerm)
  );
};

export function BalancesView() {
  const { data: balancesData, isLoading: balancesLoading } = useBalances();

  const {
    state,
    getSaldoCounts,
    setFilter,
    setClienteFilter,
    setKamFilter,
    setDateRangeFilter,
    getUniqueClientes,
    getUniqueKams,
    toggleSaldoSelection,
    selectAllSaldos,
    deselectSaldos
  } = useSaldos();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSaldoForDetail, setSelectedSaldoForDetail] = useState<IBalanceRow | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const openDetailSheet = (balance: IBalanceRow) => {
    setSelectedSaldoForDetail(balance);
    setIsDetailSheetOpen(true);
  };

  const closeDetailSheet = () => {
    setIsDetailSheetOpen(false);
  };

  const saldoCounts = getSaldoCounts();
  const uniqueClientes = getUniqueClientes();
  const uniqueKams = getUniqueKams();

  const filteredGroups = (balancesData ?? [])
    .map((group) => ({
      ...group,
      balances: group.balances.filter((balance) => matchesSearch(balance, searchTerm))
    }))
    .filter((group) => group.balances.length > 0);

  const handleStateFilter = (stateName: string) => {
    if (state.filterState === stateName) {
      setFilter(null);
    } else {
      setFilter(stateName);
    }
  };

  return (
    <>
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm">
          <CardContent>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UiSearchInput
                  placeholder="Buscar"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <GenerateActionButton />

                {/* Estado Filter Dropdown */}
                <StatusFilter
                  filterState={state.filterState}
                  saldoCounts={saldoCounts}
                  totalCount={state.saldos.length}
                  estadoConfig={estadoConfig}
                  onFilterChange={(estado) => {
                    if (estado === null) {
                      setFilter(null);
                    } else {
                      handleStateFilter(estado);
                    }
                  }}
                />

                {/* KAM Filter Dropdown */}
                <KamFilter
                  filterKam={state.filterKam}
                  uniqueKams={uniqueKams}
                  totalCount={state.saldos.length}
                  saldos={state.saldos}
                  onFilterChange={(kam) => {
                    if (kam === null || state.filterKam === kam) setKamFilter(null);
                    else setKamFilter(kam);
                  }}
                />

                {/* Grouped Filters Dropdown */}
                <GroupedFilters
                  filterCliente={state.filterCliente}
                  filterDateRange={state.filterDateRange}
                  uniqueClientes={uniqueClientes}
                  onClienteChange={(cliente) => {
                    if (cliente === null || state.filterCliente === cliente) setClienteFilter(null);
                    else setClienteFilter(cliente);
                  }}
                  onDateRangeChange={(start, end) =>
                    setDateRangeFilter({ start: start || null, end: end || null })
                  }
                  onClearDateRange={() => setDateRangeFilter({ start: null, end: null })}
                />
              </div>
            </div>

            {/* Grouped tables by state */}
            {balancesLoading ? (
              <Spin style={{ margin: "2rem 0" }} />
            ) : (
              <Collapse
                defaultActiveKey={filteredGroups[0]?.balance_status_id}
                items={filteredGroups.map((group) => ({
                  key: group.balance_status_id,
                  label: (
                    <LabelCollapse
                      status={group.balance_status}
                      color={group.color}
                      quantity={group.balances_count}
                      total={group.pending_total}
                    />
                  ),
                  children: (
                    <BalancesTable
                      data={group.balances}
                      loading={balancesLoading}
                      selectedSaldoIds={state.selectedSaldoIds}
                      onToggleSelection={toggleSaldoSelection}
                      onSelectAll={selectAllSaldos}
                      onDeselectAll={deselectSaldos}
                      onOpenDetail={openDetailSheet}
                    />
                  )
                }))}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Sheet */}
      <Sheet
        open={isDetailSheetOpen}
        onOpenChange={(open) => {
          setIsDetailSheetOpen(open);
          if (!open) setTimeout(() => setSelectedSaldoForDetail(null), 300);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0" hideClose>
          {selectedSaldoForDetail && (
            <BalanceDetailModal
              saldoData={selectedSaldoForDetail}
              onBack={closeDetailSheet}
              isModal
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
