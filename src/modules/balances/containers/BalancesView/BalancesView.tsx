"use client";

import { useState } from "react";

import {
  Search,
  Filter,
  Eye,
  ChevronDown,
  Calendar,
  Building,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  Clock,
  XCircle,
  CircleDot,
  Info
} from "lucide-react";
import { Sheet, SheetContent } from "@/modules/chat/ui/sheet";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/chat/ui/popover";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { Badge } from "@/modules/chat/ui/badge";
import { Input } from "@/modules/chat/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { BalanceDetailModal } from "../../components/BalanceDetailModal/BalanceDetailModal";
import { useSaldos } from "../../context/saldos-context";

const estadoConfig: Record<any, { color: string; icon: typeof CheckCircle; textColor: string }> = {
  "Pendiente NC": { color: "#FF9800", icon: Clock, textColor: "text-black" },
  Pendiente: { color: "#FFC107", icon: Clock, textColor: "text-black" },
  "En revisión": { color: "#2196F3", icon: CircleDot, textColor: "text-white" },
  Aprobado: { color: "#4CAF50", icon: CheckCircle, textColor: "text-white" },
  Aplicado: { color: "#2E7D32", icon: CheckCircle, textColor: "text-white" },
  Rechazado: { color: "#E53935", icon: XCircle, textColor: "text-white" },
  "Aplicado parcial": { color: "#9C27B0", icon: CircleDot, textColor: "text-white" }
};

const tipoConfig: Record<any, { color: string; label: string }> = {
  Devolución: { color: "#FF5722", label: "Devolución" },
  "Acuerdo comercial": { color: "#3F51B5", label: "Acuerdo comercial" }
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>("estado");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedSaldoForDetail, setSelectedSaldoForDetail] = useState<any | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const openDetailSheet = (saldo: any) => {
    setSelectedSaldoForDetail(saldo);
    setIsDetailSheetOpen(true);
  };

  const closeDetailSheet = () => {
    setIsDetailSheetOpen(false);
    setSelectedSaldoForDetail(null);
  };

  const saldoCounts = getSaldoCounts();
  const filteredSaldos = getFilteredSaldos();
  const uniqueClientes = getUniqueClientes();
  const uniqueKams = getUniqueKams();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calcularDiasSaldo = (fechaEmision: string): number => {
    const fecha = new Date(fechaEmision);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDiasSaldo = (fechaEmision: string): string => {
    const dias = calcularDiasSaldo(fechaEmision);
    if (dias >= 30) {
      const meses = Math.floor(dias / 30);
      return meses === 1 ? "1 mes" : `${meses} meses`;
    }
    return dias === 1 ? "1 día" : `${dias} días`;
  };

  const getCarteraColor = (estadoCartera: string): string => {
    switch (estadoCartera) {
      case "Al día":
        return "#22c55e";
      case "Preventiva":
        return "#eab308";
      case "Alerta incumplimiento":
        return "#f97316";
      case "Alerta bloqueo":
        return "#ef4444";
      case "Crítica":
        return "#171717";
      default:
        return "#9ca3af";
    }
  };

  const handleStateFilter = (stateName: string) => {
    if (state.filterState === stateName) {
      setFilter(null);
    } else {
      setFilter(stateName);
    }
    setCurrentPage(1);
  };

  const handleKamFilter = (kam: string) => {
    if (state.filterKam === kam) {
      setKamFilter(null);
    } else {
      setKamFilter(kam);
    }
    setCurrentPage(1);
  };

  const handleClienteFilter = (cliente: string) => {
    if (state.filterCliente === cliente) {
      setClienteFilter(null);
    } else {
      setClienteFilter(cliente);
    }
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRangeFilter({ start: start || null, end: end || null });
    setCurrentPage(1);
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

  const getEstadoOrder = (estado: any) => {
    const order: Record<string, number> = {
      "Pendiente NC": 0,
      Pendiente: 1,
      "En revisión": 2,
      Aprobado: 3,
      "Aplicado parcial": 4,
      Aplicado: 5,
      Rechazado: 6
    };
    return order[estado] ?? 999;
  };

  const sortedSaldos = [...searchFilteredSaldos].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortColumn) {
      case "autoId":
        aValue = a.autoId;
        bValue = b.autoId;
        break;
      case "id":
        aValue = a.id;
        bValue = b.id;
        break;
      case "fecha":
        aValue = new Date(a.fechaEmision);
        bValue = new Date(b.fechaEmision);
        break;
      case "cliente":
        aValue = a.cliente.toLowerCase();
        bValue = b.cliente.toLowerCase();
        break;
      case "tipo":
        aValue = a.tipoNotaCredito;
        bValue = b.tipoNotaCredito;
        break;
      case "estado":
        aValue = getEstadoOrder(a.estado);
        bValue = getEstadoOrder(b.estado);
        break;
      case "montoOriginal":
        aValue = a.montoOriginal;
        bValue = b.montoOriginal;
        break;
      case "montoDisponible":
        aValue = a.montoDisponible;
        bValue = b.montoDisponible;
        break;
      case "kam":
        aValue = a.kam.toLowerCase();
        bValue = b.kam.toLowerCase();
        break;
      case "diasSaldo":
        aValue = calcularDiasSaldo(a.fechaEmision);
        bValue = calcularDiasSaldo(b.fechaEmision);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedSaldos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSaldos = sortedSaldos.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllSaldos(paginatedSaldos.map((saldo) => saldo.id));
    } else {
      clearSelection();
    }
  };

  const isAllSelected =
    paginatedSaldos.length > 0 &&
    paginatedSaldos.every((saldo) => state.selectedSaldoIds.includes(saldo.id));

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm">
          <CardContent className="px-6 pt-2 pb-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nota, cliente o motivo..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-80 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-700 hover:bg-gray-100 bg-gray-50"
                    >
                      <MoreHorizontal className="h-4 w-4 mr-2" />
                      Generar acción
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => console.log("Exportar saldos")}>
                      Exportar a Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Aplicar saldo")}>
                      Aplicar saldo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Estado Filter Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
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

                        {(Object.keys(estadoConfig) as any[]).map((estadoKey) => {
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
                    size="sm"
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
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

                        {uniqueKams.map((kam: any) => {
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
                    size="sm"
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
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
                              onClick={() => {
                                setClienteFilter(null);
                              }}
                            >
                              Todos los clientes
                            </button>

                            {uniqueClientes?.map((cliente: any) => (
                              <button
                                type="button"
                                key={cliente}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-cashport-gray-lighter transition-colors border-t border-gray-100 ${
                                  state.filterCliente === cliente
                                    ? "bg-cashport-green text-cashport-black font-medium"
                                    : "text-cashport-black"
                                }`}
                                onClick={() => {
                                  handleClienteFilter(cliente);
                                }}
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
                              onClick={() => {
                                setDateRangeFilter({ start: null, end: null });
                              }}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cashport-gray-light">
                    <th className="text-left py-3 px-4 text-xs font-medium text-cashport-black w-10">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="border-cashport-gray-light"
                      />
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("autoId")}
                    >
                      <div className="flex items-center">
                        Id
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("fecha")}
                    >
                      <div className="flex items-center">
                        Fecha saldo
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("diasSaldo")}
                    >
                      <div className="flex items-center">
                        {"Días"}
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("cliente")}
                    >
                      <div className="flex items-center">
                        Cliente
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("kam")}
                    >
                      <div className="flex items-center">
                        KAM
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("tipo")}
                    >
                      <div className="flex items-center">
                        Tipo
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-left py-3 px-3 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter w-[130px]"
                      onClick={() => handleSort("estado")}
                    >
                      <div className="flex items-center">
                        Estado
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("montoOriginal")}
                    >
                      <div className="flex items-center justify-end">
                        Saldo inicial
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th
                      className="text-right py-3 px-4 text-xs font-medium text-cashport-black cursor-pointer hover:bg-cashport-gray-lighter"
                      onClick={() => handleSort("montoDisponible")}
                    >
                      <div className="flex items-center justify-end">
                        Pendiente
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      </div>
                    </th>
                    <th className="py-3 px-4 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedSaldos.map((saldo) => {
                    const estadoStyle = estadoConfig[saldo.estado];
                    const tipoStyle = tipoConfig[saldo.tipoNotaCredito];
                    const isSelected = state.selectedSaldoIds.includes(saldo.id);

                    return (
                      <tr
                        key={saldo.id}
                        className={`border-b border-cashport-gray-lighter hover:bg-cashport-gray-lighter/50 transition-colors ${
                          isSelected ? "bg-cashport-green/10" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSaldoSelection(saldo.id)}
                            className="border-cashport-gray-light"
                          />
                        </td>
                        {/* Id */}
                        <td className="py-3 px-4 text-sm text-cashport-black">{saldo.autoId}</td>
                        {/* Fecha saldo */}
                        <td className="py-3 px-4 text-sm text-cashport-black">
                          {formatDate(saldo.fechaEmision)}
                        </td>
                        {/* Dias */}
                        <td className="py-3 px-4 text-sm text-cashport-black">
                          {formatDiasSaldo(saldo.fechaEmision)}
                        </td>
                        {/* Cliente */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-[260px]">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button type="button" className="shrink-0">
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{
                                      backgroundColor: getCarteraColor(saldo.estadoCartera)
                                    }}
                                  />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                side="bottom"
                                align="start"
                                className="w-72 rounded-xl shadow-lg border border-gray-100 p-0"
                              >
                                <div className="px-4 pt-3 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="inline-block h-2.5 w-2.5 rounded-full"
                                      style={{
                                        backgroundColor: getCarteraColor(saldo.estadoCartera)
                                      }}
                                    />
                                    <span className="text-sm font-bold text-cashport-black">
                                      {saldo.estadoCartera}
                                    </span>
                                  </div>
                                </div>
                                <div className="px-4 pb-3 space-y-1.5">
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-gray-500">Cartera</span>
                                    <span className="text-sm font-bold text-cashport-black">
                                      {formatCurrency(saldo.carteraTotal)}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-gray-500">Vencida</span>
                                    <span className="text-sm font-bold text-cashport-black">
                                      {saldo.carteraVencidaPct}%
                                    </span>
                                  </div>
                                  <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-gray-500">Acuerdo de pago</span>
                                    {saldo.acuerdoPago ? (
                                      <div className="text-right">
                                        <span className="text-sm font-bold text-cashport-black">
                                          {formatCurrency(saldo.acuerdoPago.monto || 0)}
                                        </span>
                                        {saldo.acuerdoPago.fecha && (
                                          <p
                                            className={`text-xs ${saldo.acuerdoPago.vencido ? "text-orange-500" : "text-gray-400"}`}
                                          >
                                            {formatDate(saldo.acuerdoPago.fecha)}
                                            {saldo.acuerdoPago.vencido ? " Vencido" : ""}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm font-bold text-cashport-black">
                                        Sin acuerdo
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <span
                              className="text-sm text-cashport-black truncate"
                              title={saldo.cliente}
                            >
                              {saldo.cliente}
                            </span>
                          </div>
                        </td>
                        {/* KAM */}
                        <td className="py-3 px-4">
                          <span className="text-sm text-cashport-black">{saldo.kam}</span>
                        </td>
                        {/* Tipo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-cashport-black">{tipoStyle.label}</span>
                            {saldo.motivo && (
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <Info className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    align="start"
                                    className="max-w-[240px] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md"
                                  >
                                    <p className="text-sm text-cashport-black">{saldo.motivo}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        {/* Estado */}
                        <td className="py-3 px-3">
                          <Badge
                            className={`${estadoStyle.textColor} text-xs font-medium whitespace-nowrap`}
                            style={{ backgroundColor: estadoStyle.color }}
                          >
                            {saldo.estado}
                          </Badge>
                        </td>
                        {/* Saldo inicial */}
                        <td className="py-3 px-4 text-sm text-cashport-black text-right font-medium">
                          {formatCurrency(saldo.montoOriginal)}
                        </td>
                        {/* Pendiente */}
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-bold text-cashport-black">
                            {formatCurrency(saldo.montoDisponible)}
                          </span>
                        </td>
                        {/* Acciones */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-cashport-gray-lighter"
                                    onClick={() => openDetailSheet(saldo)}
                                  >
                                    <Eye className="h-4 w-4 text-cashport-black" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalle</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-cashport-gray-light">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, sortedSaldos.length)} de{" "}
                  {sortedSaldos.length} saldos
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-cashport-black">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter disabled:opacity-50"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
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
