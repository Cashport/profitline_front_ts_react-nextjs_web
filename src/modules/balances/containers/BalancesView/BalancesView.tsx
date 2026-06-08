"use client";

import { useState } from "react";
import useSWR from "swr";

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
import { useSaldos } from "../../context/saldos-context";
import { useBalances } from "@/hooks/useBalances";
import { getBalancesFilter } from "@/services/accountingAdjustment/accountingAdjustment";
import { useAppStore } from "@/lib/store/store";
import { IBalanceRow, IBalancesFilter } from "@/types/financialDiscounts/IFinancialDiscounts";

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
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [balancesFilter, setBalancesFilter] = useState<IBalancesFilter>({
    users: [],
    clients: [],
    from_date: null,
    to_date: null
  });

  const { data: balancesData, isLoading: balancesLoading } = useBalances(balancesFilter);

  const { data: balancesFilters, isLoading: filtersLoading } = useSWR(
    ID ? ["balances-filters", ID] : null,
    () => getBalancesFilter()
  );

  const { state, setFilter, toggleSaldoSelection, selectAllSaldos, deselectSaldos } = useSaldos();

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

                {/* Grouped Filters Dropdown (KAM + Cliente + Fechas) */}
                <GroupedFilters
                  users={balancesFilters?.users ?? []}
                  clients={balancesFilters?.clients ?? []}
                  value={balancesFilter}
                  onChange={setBalancesFilter}
                  isLoading={filtersLoading}
                />
              </div>
            </div>

            {/* Grouped tables by state */}
            {balancesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
                <Spin />
              </div>
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
