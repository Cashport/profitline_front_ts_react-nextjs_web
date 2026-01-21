"use client";

import { useEffect, useState } from "react";
import { Flex, Spin } from "antd";
import { useRouter } from "next/navigation";

import { Upload, FileText } from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/useSearch";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { UploadInterface } from "../../components/upload-interface/upload-interface";
import { OrdersTable } from "../../components/orders-table/OrdersTable";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useAppStore } from "@/lib/store/store";
import { IPurchaseOrder, IPurchaseOrderFilters } from "@/types/purchaseOrders/purchaseOrders";
import { StatesFilter } from "../../components/filters/states-filter";
import { GeneralFilter } from "../../components/filters/general-filter";
import { getFilters } from "@/services/purchaseOrders/purchaseOrders";
import { mutate } from "swr";

export function PurchaseOrdersView() {
  const router = useRouter();
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [showUploadInterface, setShowUploadInterface] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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

  const { data, isLoading, pagination, mutate } = usePurchaseOrders({
    page: currentPage,
    search: debouncedSearchTerm,
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
    mutate();
    // The upload interface will handle the AI processing and add the invoice to state
  };

  const handleRowClick = (record: IPurchaseOrder) => {
    // TODO: Navigate to detail page or open modal
    router.push(`/purchase-orders/${record.id}`);
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

  const actionItems: DropdownItem[] = [
    {
      key: "download",
      label: "Descargar plano",
      onClick: () => console.log("Descargar plano")
    },
    {
      key: "mark-invoiced",
      label: "Marcar como facturado",
      onClick: () => console.log("Marcar como facturado")
    }
  ];

  return (
    <div className="bg-white rounded-lg">
      {/* Main white card containing all content */}
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm p-6">
          <CardContent className="p-0 ">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UiSearchInput
                  placeholder="Buscar"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <GeneralDropdown items={actionItems} align="start">
                  <GenerateActionButton label="Generar acción" />
                </GeneralDropdown>

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

              <PrincipalButton onClick={() => setShowUploadInterface(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Orden de compra
              </PrincipalButton>
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
                <PrincipalButton onClick={() => setShowUploadInterface(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Orden de compra
                </PrincipalButton>
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
