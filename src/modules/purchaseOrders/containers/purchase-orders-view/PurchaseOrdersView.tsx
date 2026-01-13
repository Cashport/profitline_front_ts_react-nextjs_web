"use client";

import { useState } from "react";

import { Upload, FileText, Search, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Input } from "@/modules/chat/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { Button } from "@/modules/chat/ui/button";
import { UploadInterface } from "../../components/upload-interface/upload-interface";
import { OrdersTable } from "../../components/orders-table/OrdersTable";
import { StatesFilter, documentStateConfig } from "../../components/filters/states-filter";
import { GeneralFilter } from "../../components/filters/general-filter";
import { SellersFilter } from "../../components/filters/sellers-filter";
import { useApp } from "../../context/app-context";

import "@/modules/chat/styles/chatStyles.css";
import "@/modules/aprobaciones/styles/approvalsStyles.css";

interface ModuleConfig {
  showVendedor: boolean;
  showProductosPromocion: boolean;
  compradorLabel: string;
  idLabel: string;
  showCompradorFilter: boolean;
  showVendedorFilter: boolean;
  clienteFilterLabel?: string;
  showEntregaColumn?: boolean;
  showAlertas?: boolean;
  fechaLabel?: string;
}

interface MainDashboardProps {
  moduleTitle?: string;
  config?: ModuleConfig;
}

const defaultConfig: ModuleConfig = {
  showVendedor: true,
  showProductosPromocion: true,
  compradorLabel: "Comprador",
  idLabel: "Id factura",
  showCompradorFilter: true,
  showVendedorFilter: true,
  showEntregaColumn: false,
  showAlertas: true,
  fechaLabel: "Fecha Factura"
};

export function PurchaseOrdersView({
  moduleTitle = "TEST",
  config = defaultConfig
}: MainDashboardProps) {
  const {
    state,
    getInvoiceCounts,
    getFilteredInvoices,
    setFilter,
    setCompradorFilter,
    setVendedorFilter,
    setDateRangeFilter,
    getUniqueCompradores,
    getUniqueVendedores,
    goToDetail,
    toggleInvoiceSelection,
    selectAllInvoices,
    clearSelection
  } = useApp();
  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string | null>("estado");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const invoiceCounts = getInvoiceCounts();
  const filteredInvoices = getFilteredInvoices();
  const uniqueCompradores = getUniqueCompradores();
  const uniqueVendedores = getUniqueVendedores();

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // The upload interface will handle the AI processing and add the invoice to state
  };

  const handleStateFilter = (stateName: string | null) => {
    if (stateName === null || state.filterState === stateName) {
      setFilter(null);
    } else {
      setFilter(stateName);
    }
    setCurrentPage(1);
  };

  const handleCompradorFilter = (comprador: string | null) => {
    if (comprador === null || state.filterComprador === comprador) {
      setCompradorFilter(null);
    } else {
      setCompradorFilter(comprador);
    }
    setCurrentPage(1);
  };

  const handleVendedorFilter = (vendedor: string | null) => {
    if (vendedor === null || state.filterVendedor === vendedor) {
      setVendedorFilter(null);
    } else {
      setVendedorFilter(vendedor);
    }
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRangeFilter({ start: start || null, end: end || null });
    setCurrentPage(1);
  };

  const searchFilteredInvoices = filteredInvoices.filter(
    (invoice) =>
      invoice.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.vendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoOrder = (estado: string) => {
    const index = documentStateConfig.findIndex((s) => s.name === estado);
    return index === -1 ? 999 : index;
  };

  const sortedInvoices = [...searchFilteredInvoices].sort((a, b) => {
    if (!sortColumn) return 0;

    let aValue: any;
    let bValue: any;

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
        aValue = new Date(a.fechaFactura);
        bValue = new Date(b.fechaFactura);
        break;
      case "entrega":
        aValue = a.fechaEntrega ? new Date(a.fechaEntrega) : new Date(0);
        bValue = b.fechaEntrega ? new Date(b.fechaEntrega) : new Date(0);
        break;
      case "comprador":
        aValue = a.comprador.toLowerCase();
        bValue = b.comprador.toLowerCase();
        break;
      case "vendedor":
        aValue = a.vendedor.toLowerCase();
        bValue = b.vendedor.toLowerCase();
        break;
      case "estado":
        aValue = getEstadoOrder(a.estado);
        bValue = getEstadoOrder(b.estado);
        break;
      case "productos":
        aValue = a.cantidad;
        bValue = b.cantidad;
        break;
      case "monto":
        aValue = a.monto;
        bValue = b.monto;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selectAllInvoices(paginatedInvoices.map((invoice) => invoice.id));
    } else {
      clearSelection();
    }
  };

  const isAllSelected =
    paginatedInvoices.length > 0 &&
    paginatedInvoices.every((invoice) => state.selectedInvoiceIds.includes(invoice.id));
  const isIndeterminate =
    paginatedInvoices.some((invoice) => state.selectedInvoiceIds.includes(invoice.id)) &&
    !isAllSelected;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-lg">
      {/* Main white card containing all content */}
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm">
          <CardContent className="px-6 pt-2 pb-4">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar"
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
                    <DropdownMenuItem onClick={() => console.log("Descargar plano")}>
                      Descargar plano
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Marcar como facturado")}>
                      Marcar como facturado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Estado Filter Dropdown */}
                <StatesFilter
                  filterState={state.filterState}
                  invoiceCounts={invoiceCounts}
                  totalCount={state.invoices.length}
                  onFilterChange={handleStateFilter}
                />

                {/* General Filters Dropdown */}
                <GeneralFilter
                  showCompradorFilter={config.showCompradorFilter}
                  clienteFilterLabel={config.clienteFilterLabel}
                  filterComprador={state.filterComprador}
                  uniqueCompradores={uniqueCompradores}
                  onCompradorChange={handleCompradorFilter}
                  filterDateRange={state.filterDateRange}
                  onDateRangeChange={handleDateRangeChange}
                  onClearDateRange={() => setDateRangeFilter({ start: null, end: null })}
                />

                {/* Vendedor Filter */}
                {config.showVendedorFilter && (
                  <SellersFilter
                    filterVendedor={state.filterVendedor}
                    uniqueVendedores={uniqueVendedores}
                    onVendedorChange={handleVendedorFilter}
                  />
                )}
              </div>

              <Button
                className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold text-base px-6 py-5"
                onClick={() => setShowUploadInterface(true)}
              >
                <Upload className="h-5 w-5 mr-2" />
                Cargar Orden de compra
              </Button>
            </div>

            {/* Table content */}
            {sortedInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                {state.invoices.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-cashport-black mb-2">
                      No hay {moduleTitle.toLowerCase()} procesadas
                    </h3>
                    <p className="mb-4">
                      Carga tu primera orden de compra para comenzar el análisis
                    </p>
                    <Button
                      className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold"
                      onClick={() => setShowUploadInterface(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Cargar Orden de compra
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-cashport-black mb-2">
                      No se encontraron resultados
                    </h3>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <OrdersTable
                    invoices={paginatedInvoices}
                    selectedInvoiceIds={state.selectedInvoiceIds}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onRowClick={goToDetail}
                    onToggleSelection={toggleInvoiceSelection}
                    onSelectAll={handleSelectAll}
                    isAllSelected={isAllSelected}
                    isIndeterminate={isIndeterminate}
                  />
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-cashport-gray-light mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {startIndex + 1} a {Math.min(endIndex, sortedInvoices.length)} de{" "}
                      {sortedInvoices.length} resultados
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter disabled:opacity-50"
                      >
                        Anterior
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber: number;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNumber)}
                              className={
                                currentPage === pageNumber
                                  ? "bg-cashport-green hover:bg-cashport-green/90 text-cashport-black"
                                  : "border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
                              }
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter disabled:opacity-50"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {showUploadInterface && (
        <UploadInterface
          onFileUpload={handleFileUpload}
          onClose={() => setShowUploadInterface(false)}
        />
      )}
    </div>
  );
}
