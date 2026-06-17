"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { Flex, Spin } from "antd";
import UiSearchInput from "@/components/ui/search-input/search-input";
import Collapse from "@/components/ui/collapse";
import LabelCollapse from "@/components/ui/label-collapse";
import { Sheet, SheetContent } from "@/modules/chat/ui/sheet";
import { BalanceDetailModal } from "../../components/BalanceDetailModal/BalanceDetailModal";
import { BalancesTable } from "../../components/BalancesTable/BalancesTable";
import { FilterBalances, ISaldosFilterValue } from "../../components/FilterBalances/FilterBalances";
import { useSaldos } from "../../context/saldos-context";
import { useBalances } from "@/hooks/useBalances";
import { useFinancialDiscountMotives } from "@/hooks/useFinancialDiscountMotives";
import { extractSingleParam } from "@/utils/utils";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";

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

export function ClientBalancesView() {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId) || "";

  const [filter, setFilter] = useState<ISaldosFilterValue>({
    motives: [],
    from_date: null,
    to_date: null
  });

  const { data: balancesData, isLoading: balancesLoading } = useBalances({
    users: [],
    clients: [],
    from_date: filter.from_date,
    to_date: filter.to_date,
    client_uuid: clientId
  });

  const { data: motives, isLoading: motivesLoading } = useFinancialDiscountMotives();

  const { state, toggleSaldoSelection, selectAllSaldos, deselectSaldos } = useSaldos();

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
      balances: group.balances.filter(
        (balance) =>
          matchesSearch(balance, searchTerm) &&
          (filter.motives.length === 0 || filter.motives.includes(balance.motive_name))
      )
    }))
    .filter((group) => group.balances.length > 0);

  return (
    <>
      <div className="clientBalancesView">
        <Flex justify="space-between" className="clientStickyHeader">
          <Flex gap={"0.5rem"}>
            <UiSearchInput
              className="standardSearch"
              placeholder="Buscar"
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Saldos Filters Dropdown (Tipo + Fechas) */}
            <FilterBalances
              motives={motives ?? []}
              value={filter}
              onChange={setFilter}
              isLoading={motivesLoading}
            />
          </Flex>
        </Flex>

        {/* Grouped tables by state */}
        {balancesLoading ? (
          <Flex justify="center" align="center" style={{ height: "3rem" }}>
            <Spin />
          </Flex>
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
                  context="clientBalances"
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
      </div>

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
