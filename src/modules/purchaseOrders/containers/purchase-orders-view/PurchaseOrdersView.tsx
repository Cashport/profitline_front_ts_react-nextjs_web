"use client";

import { useEffect, useState } from "react";
import { Flex, Spin } from "antd";

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
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { IPurchaseOrder, IPurchaseOrderFilters } from "@/types/purchaseOrders/purchaseOrders";
import { StatesFilter } from "../../components/filters/states-filter";
import { GeneralFilter } from "../../components/filters/general-filter";
import { getFilters } from "@/services/purchaseOrders/purchaseOrders";

export function PurchaseOrdersView() {
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<IPurchaseOrderFilters>({
    statuses: [],
    clients: [],
    sellers: []
  });

  // Single state for selected filter IDs
  const [selectedFilters, setSelectedFilters] = useState({
    statusId: undefined as number | undefined,
    clientId: undefined as string | undefined,
    sellerId: undefined as string | undefined,
    createdFrom: undefined as string | undefined,
    createdTo: undefined as string | undefined,
    dateRange: { start: null as string | null, end: null as string | null }
  });

  const { data, isLoading, pagination } = usePurchaseOrders({
    page: currentPage,
    search: searchTerm,
    statusId: selectedFilters.statusId,
    clientId: selectedFilters.clientId,
    sellerId: selectedFilters.sellerId,
    createdFrom: selectedFilters.createdFrom,
    createdTo: selectedFilters.createdTo
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await getFilters(ID);
        setFilterOptions(filters);
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    fetchFilters();
  }, [ID]);

  const handleFileUpload = (files: File[]) => {
    console.log("Files uploaded:", files);
    // The upload interface will handle the AI processing and add the invoice to state
  };

  const handleRowClick = (record: IPurchaseOrder) => {
    console.log("Row clicked:", record);
    // TODO: Navigate to detail page or open modal
  };

  const handleRowSelect = (selectedKeys: React.Key[], selectedRows: IPurchaseOrder[]) => {
    setSelectedRowKeys(selectedKeys);
    console.log("Selected rows:", selectedRows);
  };

  // Filter handler functions
  const handleStatusChange = (statusId: number | null) => {
    setSelectedFilters((prev) => ({ ...prev, statusId: statusId ?? undefined }));
    setCurrentPage(1);
  };

  const handleClientChange = (clientId: string | null) => {
    setSelectedFilters((prev) => ({ ...prev, clientId: clientId ?? undefined }));
    setCurrentPage(1);
  };

  const handleSellerChange = (sellerId: string | null) => {
    setSelectedFilters((prev) => ({ ...prev, sellerId: sellerId ?? undefined }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
      createdFrom: start || undefined,
      createdTo: end || undefined
    }));
    setCurrentPage(1);
  };

  const handleClearDateRange = () => {
    setSelectedFilters((prev) => ({
      ...prev,
      dateRange: { start: null, end: null },
      createdFrom: undefined,
      createdTo: undefined
    }));
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
                  selectedStatusId={selectedFilters.statusId ?? null}
                  statuses={filterOptions.statuses || []}
                  onFilterChange={handleStatusChange}
                />

                {/* General Filters Dropdown */}
                <GeneralFilter
                  showCompradorFilter={true}
                  clienteFilterLabel="Cliente"
                  selectedClientId={selectedFilters.clientId ?? null}
                  clients={filterOptions.clients || []}
                  onCompradorChange={handleClientChange}
                  showVendedorFilter={true}
                  selectedSellerId={selectedFilters.sellerId ?? null}
                  sellers={filterOptions.sellers || []}
                  onVendedorChange={handleSellerChange}
                  filterDateRange={selectedFilters.dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  onClearDateRange={handleClearDateRange}
                />
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
            {isLoading ? (
              <Flex justify="center" align="center" style={{ height: "20rem" }}>
                <Spin size="large" />
              </Flex>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Carga tu primera orden de compra para comenzar el análisis</p>
                <Button
                  className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold"
                  onClick={() => setShowUploadInterface(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Orden de compra
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <OrdersTable
                  data={data}
                  pagination={pagination}
                  loading={isLoading}
                  onPageChange={setCurrentPage}
                  selectedRowKeys={selectedRowKeys}
                  onRowSelect={handleRowSelect}
                  onRowClick={handleRowClick}
                />
              </div>
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
//
