"use client";

import { useState } from "react";

import { CheckCircle, Clock, XCircle, CircleDot } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { Sheet, SheetContent } from "@/modules/chat/ui/sheet";
import { Card, CardContent } from "@/modules/chat/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { BalanceDetailModal } from "../../components/BalanceDetailModal/BalanceDetailModal";
import { BalancesTable } from "../../components/BalancesTable/BalancesTable";
import { GroupedFilters } from "../../components/GroupedFilters/GroupedFilters";
import { KamFilter } from "../../components/KamFilter/KamFilter";
import { StatusFilter } from "../../components/StatusFilter/StatusFilter";
import { useSaldos } from "../../context/saldos-context";
import type { SaldoData } from "../../context/saldos-context";

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

export function BalancesView() {
  const {
    state,
    getSaldoCounts,
    getFilteredSaldos,
    setFilter,
    setTipoFilter,
    setClienteFilter,
    setKamFilter,
    setDateRangeFilter,
    getUniqueClientes,
    getUniqueKams,
    toggleSaldoSelection,
    selectAllSaldos,
    clearSelection
  } = useSaldos();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSaldoForDetail, setSelectedSaldoForDetail] = useState<SaldoData | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const openDetailSheet = (saldo: SaldoData) => {
    setSelectedSaldoForDetail(saldo);
    setIsDetailSheetOpen(true);
  };

  const closeDetailSheet = () => {
    setIsDetailSheetOpen(false);
  };

  const saldoCounts = getSaldoCounts();
  const filteredSaldos = getFilteredSaldos();
  const uniqueClientes = getUniqueClientes();
  const uniqueKams = getUniqueKams();

  const handleStateFilter = (stateName: string) => {
    if (state.filterState === stateName) {
      setFilter(null);
    } else {
      setFilter(stateName);
    }
  };

  const searchFilteredSaldos = filteredSaldos.filter(
    (saldo) =>
      (saldo.notasCredito?.some((nc) =>
        nc.numero.toLowerCase().includes(searchTerm.toLowerCase())
      ) ??
        false) ||
      saldo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saldo.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saldo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saldo.kam.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

            {/* Table */}
            <BalancesTable
              data={searchFilteredSaldos}
              selectedSaldoIds={state.selectedSaldoIds}
              onToggleSelection={toggleSaldoSelection}
              onSelectAll={selectAllSaldos}
              onClearSelection={clearSelection}
              onOpenDetail={openDetailSheet}
            />
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
