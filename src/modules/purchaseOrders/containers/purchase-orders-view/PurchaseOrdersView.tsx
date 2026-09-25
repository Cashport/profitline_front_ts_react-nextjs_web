"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Spin, message } from "antd";
import { useRouter } from "next/navigation";

import { Upload, FileText } from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import UiSearchInput from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/useSearch";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ActionsModalPurchaseOrder } from "../../components/actions-modal-purchase-order/ActionsModalPurchaseOrder";
import { ModalUploadInvoicesPurchaseOrders } from "../../components/dialogs/modal-upload-invoices-purchase-orders/ModalUploadInvoicesPurchaseOrders";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { ModalUploadPurchaseOrder } from "../../components/ModalUploadPurchaseOrder/ModalUploadPurchaseOrder";
import { OrdersTable } from "../../components/orders-table/OrdersTable";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useAppStore } from "@/lib/store/store";
import {
  IPurchaseOrder,
  IOrder,
  IPurchaseOrderFilters
} from "@/types/purchaseOrders/purchaseOrders";
import { GeneralFilter } from "../../components/filters/general-filter";
import { getFilters, downloadPurchaseOrdersCSV } from "@/services/purchaseOrders/purchaseOrders";
import { ApiError } from "@/utils/api/api";
import Link from "next/link";
import { PresentationChart } from "phosphor-react";
import useScreenWidth from "@/components/hooks/useScreenWidth";

export function PurchaseOrdersView() {
  const router = useRouter();
  const { ID } = useAppStore((projects) => projects.selectedProject);

  const [whichModalIsOpen, setWhichModalIsOpen] = useState({ selected: 0 });
  const closeModals = () => setWhichModalIsOpen({ selected: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPackageRows, setSelectedPackageRows] = useState<IPurchaseOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<IOrder[]>([]);

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

  const width = useScreenWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await getFilters(ID);
        setFilterOptions(filters);
        const preselectedStatus = filters.statuses?.find((s) => s.checked);
        if (preselectedStatus) {
          setSelectedFilters((prev) => ({ ...prev, statusId: preselectedStatus.id }));
        }
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };
    fetchFilters();
  }, [ID]);

  const handleFileUpload = (_files: File[]) => {
    mutate();
  };

  const handleRowClick = (record: IPurchaseOrder) => {
    const firtstOrderId = record.orders[0]?.id;
    if (firtstOrderId) {
      router.push(`/purchase-orders/${firtstOrderId}`);
    }
  };

  const handleOrderClick = (order: IOrder) => {
    router.push(`/purchase-orders/${order.id}`);
  };

  const handleRowSelect = (selectedRows: IPurchaseOrder[]) => {
    setSelectedPackageRows(selectedRows);
  };

  const handleOrderSelect = (orders: IOrder[]) => {
    setSelectedOrders(orders);
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

  const handleOpenActionsModal = () => {
    setWhichModalIsOpen({ selected: 1 });
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Main white card containing all content */}
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm p-6">
          <CardContent className="p-0 ">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-y-3">
              <div
                className={`flex flex-wrap items-center gap-y-2 ${isMobile ? "gap-x-1" : "gap-x-4"}`}
              >
                <UiSearchInput
                  className={
                    isMobile ? "!w-[130px] !flex-none" : isTablet ? "!w-[200px] !flex-none" : ""
                  }
                  placeholder="Buscar"
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <GenerateActionButton
                  label={isMobile || isTablet ? "" : "Generar acción"}
                  onClick={handleOpenActionsModal}
                />

                <Link href="/purchase-orders/dashboard">
                  <Button
                    className="!flex !h-12 !items-center !border !border-solid !border-transparent !bg-[#f7f7f7] !px-4 !py-3 !font-semibold"
                    size="large"
                  >
                    {isMobile || isTablet ? <PresentationChart size={24} /> : "Dashboard"}
                  </Button>
                </Link>

                {/* General Filters Dropdown */}
                <GeneralFilter
                  showStatusFilter={true}
                  selectedStatusId={selectedFilters.statusId ?? null}
                  statuses={filterOptions.statuses || []}
                  onStatusChange={handleStatusChange}
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
                  iconOnly={isMobile}
                />
              </div>

              <div className="h-12">
                <PrincipalButton
                  onClick={() => setWhichModalIsOpen({ selected: 2 })}
                  customStyles={{ padding: isMobile || isTablet ? "7px 12px" : undefined }}
                >
                  <Upload className={isMobile || isTablet ? "h-4 w-4" : "h-4 w-4 mr-2"} />
                  {isMobile || isTablet ? null : "Cargar Orden de compra"}
                </PrincipalButton>
              </div>
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
                <PrincipalButton onClick={() => setWhichModalIsOpen({ selected: 2 })}>
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
                  selectedRowKeys={selectedPackageRows}
                  onRowSelect={handleRowSelect}
                  selectedOrders={selectedOrders}
                  onOrderSelect={handleOrderSelect}
                  onRowClick={handleRowClick}
                  onOrderClick={handleOrderClick}
                  mutate={() => mutate()}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <ActionsModalPurchaseOrder
        isOpen={whichModalIsOpen.selected === 1}
        onClose={closeModals}
        selectedPackageRows={selectedPackageRows}
        selectedOrders={selectedOrders}
        mutate={() => {
          mutate();
          setSelectedPackageRows([]);
          setSelectedOrders([]);
        }}
        onUploadInvoices={() => setWhichModalIsOpen({ selected: 3 })}
      />

      <ModalUploadInvoicesPurchaseOrders
        isOpen={whichModalIsOpen.selected === 3}
        onClose={closeModals}
        orders={selectedOrders}
        packages={data}
        onSuccess={() => {
          mutate();
          setSelectedPackageRows([]);
          setSelectedOrders([]);
        }}
      />

      {whichModalIsOpen.selected === 2 && (
        <ModalUploadPurchaseOrder onFileUpload={handleFileUpload} onClose={closeModals} />
      )}
    </div>
  );
}
