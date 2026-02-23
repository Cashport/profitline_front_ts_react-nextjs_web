"use client";

import { useState } from "react";

import {
  Filter,
  ChevronDown,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  XCircle,
  CircleDot
} from "lucide-react";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { Sheet, SheetContent } from "@/modules/chat/ui/sheet";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Input } from "@/modules/chat/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { BalanceDetailModal } from "../../components/BalanceDetailModal/BalanceDetailModal";
import { BalancesTable } from "../../components/BalancesTable/BalancesTable";
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
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showKamDropdown, setShowKamDropdown] = useState(false);
  const [showGroupedFiltersDropdown, setShowGroupedFiltersDropdown] = useState(false);
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

  const handleKamFilter = (kam: string) => {
    if (state.filterKam === kam) {
      setKamFilter(null);
    } else {
      setKamFilter(kam);
    }
  };

  const handleClienteFilter = (cliente: string) => {
    if (state.filterCliente === cliente) {
      setClienteFilter(null);
    } else {
      setClienteFilter(cliente);
    }
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRangeFilter({ start: start || null, end: end || null });
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
                <div className="relative">
                  <Button
                    variant="outline"
                    className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
                    onClick={() => setShowStateDropdown(!showStateDropdown)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Estados
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>

                  {showStateDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
                      <div className="p-1">
                        <button
                          type="button"
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                            state.filterState === null
                              ? "bg-cashport-green text-cashport-black"
                              : "text-cashport-black"
                          }`}
                          onClick={() => {
                            setFilter(null);
                            setShowStateDropdown(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>Todos los estados</span>
                            <Badge
                              variant="secondary"
                              className="bg-cashport-gray-lighter text-cashport-black"
                            >
                              {state.saldos.length}
                            </Badge>
                          </div>
                        </button>

                        {(Object.keys(estadoConfig) as string[]).map((estadoKey) => {
                          const config = estadoConfig[estadoKey];
                          const count = saldoCounts[estadoKey] || 0;
                          const isActive = state.filterState === estadoKey;
                          const Icon = config.icon;

                          return (
                            <button
                              type="button"
                              key={estadoKey}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                                isActive
                                  ? "bg-cashport-green text-cashport-black"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => {
                                handleStateFilter(estadoKey);
                                setShowStateDropdown(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: config.color }}
                                  />
                                  <span>{estadoKey}</span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="bg-cashport-gray-lighter text-cashport-black"
                                >
                                  {count}
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* KAM Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
                    onClick={() => setShowKamDropdown(!showKamDropdown)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    KAM
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>

                  {showKamDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
                      <div className="p-1">
                        <button
                          type="button"
                          className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                            state.filterKam === null
                              ? "bg-cashport-green text-cashport-black"
                              : "text-cashport-black"
                          }`}
                          onClick={() => {
                            setKamFilter(null);
                            setShowKamDropdown(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>Todos los KAM</span>
                            <Badge
                              variant="secondary"
                              className="bg-cashport-gray-lighter text-cashport-black"
                            >
                              {state.saldos.length}
                            </Badge>
                          </div>
                        </button>

                        {uniqueKams.map((kam) => {
                          const count = state.saldos.filter((s) => s.kam === kam).length;
                          const isActive = state.filterKam === kam;

                          return (
                            <button
                              type="button"
                              key={kam}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-cashport-gray-lighter transition-colors ${
                                isActive
                                  ? "bg-cashport-green text-cashport-black"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => {
                                handleKamFilter(kam);
                                setShowKamDropdown(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>{kam}</span>
                                <Badge
                                  variant="secondary"
                                  className="bg-cashport-gray-lighter text-cashport-black"
                                >
                                  {count}
                                </Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Grouped Filters Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="h-12 border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
                    onClick={() => setShowGroupedFiltersDropdown(!showGroupedFiltersDropdown)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Más filtros
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>

                  {showGroupedFiltersDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-96 bg-cashport-white border border-cashport-gray-light rounded-lg shadow-lg z-10">
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
                                state.filterCliente === null
                                  ? "bg-cashport-green text-cashport-black font-medium"
                                  : "text-cashport-black"
                              }`}
                              onClick={() => setClienteFilter(null)}
                            >
                              Todos los clientes
                            </button>

                            {uniqueClientes?.map((cliente) => (
                              <button
                                type="button"
                                key={cliente}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                                  state.filterCliente === cliente
                                    ? "bg-cashport-green text-cashport-black font-medium"
                                    : "text-cashport-black"
                                }`}
                                onClick={() => handleClienteFilter(cliente)}
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
                                <label className="text-xs text-gray-600 mb-1 block">
                                  Fecha inicio
                                </label>
                                <Input
                                  type="date"
                                  value={state.filterDateRange.start || ""}
                                  onChange={(e) =>
                                    handleDateRangeChange(
                                      e.target.value,
                                      state.filterDateRange.end || ""
                                    )
                                  }
                                  className="bg-cashport-white border-cashport-gray-light text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">
                                  Fecha fin
                                </label>
                                <Input
                                  type="date"
                                  value={state.filterDateRange.end || ""}
                                  onChange={(e) =>
                                    handleDateRangeChange(
                                      state.filterDateRange.start || "",
                                      e.target.value
                                    )
                                  }
                                  className="bg-cashport-white border-cashport-gray-light text-sm"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDateRangeFilter({ start: null, end: null })}
                              className="w-full border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
                            >
                              Limpiar fechas
                            </Button>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowGroupedFiltersDropdown(false)}
                            className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
                          >
                            Cerrar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
