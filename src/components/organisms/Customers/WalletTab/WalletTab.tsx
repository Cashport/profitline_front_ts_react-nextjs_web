import { useEffect, useState } from "react";
import { Button, Flex, Spin, message } from "antd";
import { useParams } from "next/navigation";
import { DotsThree } from "phosphor-react";
import { AxiosError } from "axios";

import { extractSingleParam } from "@/utils/utils";
import { addItemsToTable } from "@/services/applyTabClients/applyTabClients";
import { useApplicationTable } from "@/hooks/useApplicationTable";
import { useInvoices } from "@/hooks/useInvoices";
import { useDebounce } from "@/hooks/useDeabouce";
import { useModalDetail } from "@/context/ModalContext";

import { InvoicesTable } from "@/components/molecules/tables/InvoicesTable/InvoicesTable";
import { ModalGenerateAction } from "@/components/molecules/modals/ModalGenerateAction/ModalGenerateAction";
import UiSearchInput from "@/components/ui/search-input";
import { ModalEstimateTotalInvoices } from "@/components/molecules/modals/modal-estimate-total-invoices/modal-estimate-total-invoices";
import LabelCollapse from "@/components/ui/label-collapse";
import Collapse from "@/components/ui/collapse";
import WalletTabChangeStatusModal from "@/modules/clients/components/wallet-tab-change-status-modal";
import PaymentAgreementModal from "@/modules/clients/components/wallet-tab-payment-agreement-modal";
import { ModalActionDiscountCredit } from "@/components/molecules/modals/ModalActionDiscountCredit/ModalActionDiscountCredit";
import RadicationInvoice from "@/components/molecules/modals/Radication/RadicationInvoice";
import RegisterNews from "@/components/molecules/modals/RegisterNews/RegisterNews";
import DigitalRecordModal from "@/components/molecules/modals/DigitalRecordModal/DigitalRecordModal";
import {
  SelectedFiltersWallet,
  WalletTabFilter
} from "@/components/atoms/Filters/FilterWalletTab/FilterWalletTab";

import { IInvoice, InvoicesData } from "@/types/invoices/IInvoices";

import "./wallettab.scss";

export const WalletTab = () => {
  const { openModal } = useModalDetail();
  const [filters, setFilters] = useState<SelectedFiltersWallet>({
    lines: [],
    zones: [],
    channels: [],
    sublines: [],
    paymentAgreement: null,
    radicationType: null
  });
  const [invoices, setInvoices] = useState<InvoicesData[] | undefined>([]);
  const [selectedRows, setSelectedRows] = useState<IInvoice[] | undefined>(undefined);
  const [isGenerateActionOpen, setisGenerateActionOpen] = useState(false);
  const [search, setSearch] = useState("");
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const projectIdParam = extractSingleParam(params.projectId);

  const debouncedSearchQuery = useDebounce(search, 300);
  const [showActionDetailModal, setShowActionDetailModal] = useState<{
    isOpen: boolean;
    actionType: number;
  }>({
    isOpen: false,
    actionType: 0
  });
  const [isSelectOpen, setIsSelectOpen] = useState({
    selected: 0
  });
  const [messageShow, contextHolder] = message.useMessage();
  const clientId = clientIdParam || "";
  const projectId = projectIdParam ? parseInt(projectIdParam) : 0;

  const { data, isLoading, mutate } = useInvoices({
    searchQuery: debouncedSearchQuery,
    paymentAgreement: filters.paymentAgreement !== null ? filters.paymentAgreement : undefined,
    radicationType: filters.radicationType !== null ? filters.radicationType : undefined,
    lines: filters.lines,
    zones: filters.zones,
    sublines: filters.sublines,
    channels: filters.channels
  });

  const { mutate: mutateApplyTabData } = useApplicationTable();

  useEffect(() => {
    if (data) {
      const invoicesData: InvoicesData[] = data.filter((invoiceState) => invoiceState.count > 0);
      setInvoices(invoicesData);
    }
  }, [data]);

  const handleisGenerateActionOpen = () => {
    setisGenerateActionOpen(!isGenerateActionOpen);
    mutate();
  };

  const handleActionInDetail = (invoice: IInvoice) => {
    setisGenerateActionOpen(!isGenerateActionOpen);
    setSelectedRows([invoice]);
    mutate();
  };

  const onCloseModal = () => {
    setisGenerateActionOpen(!isGenerateActionOpen);
    setIsSelectOpen({ selected: 0 });
    mutate();
  };

  const closeAllModal = () => {
    setIsSelectOpen({ selected: 0 });
    setSelectedRows([]);
    mutate();
  };

  const handleOpenInvoiceDetail = (invoice: IInvoice) => {
    openModal("invoice", {
      invoiceId: invoice.id,
      showId: invoice.id_erp,
      clientId: clientId,
      projectId: projectId,
      selectInvoice: invoice,
      handleActionInDetail: handleActionInDetail
    });
  };
  const validateInvoiceIsSelected = (): boolean => {
    if (!selectedRows || selectedRows.length === 0) {
      messageShow.error("Seleccione al menos una factura");
      return false;
    }
    return true;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value?.trim();
    // Separar los IDs por saltos de línea y luego unirlos con comas
    const formattedValue = value.split(/\s+/).join(",");
    setSearch(formattedValue);
  };

  const handleAddSelectedInvoicesToApplicationTable = async () => {
    try {
      await addItemsToTable(
        projectId,
        clientId,
        "invoices",
        selectedRows?.map((invoice) => invoice.id) || []
      );
      setisGenerateActionOpen(false);
      messageShow.success("Facturas añadidas correctamente a la tabla de aplicación de pagos");
      // mutate Applytable data
      mutateApplyTabData();
    } catch (error) {
      if (error instanceof AxiosError) {
        messageShow.error(
          `Error al añadir facturas(s) a la tabla de aplicación de pagos ${error.message}`
        );
      }
    }
  };

  return (
    <>
      {contextHolder}
      {selectedRows && selectedRows?.length > 0 && (
        <ModalEstimateTotalInvoices selectedInvoices={selectedRows} />
      )}
      <div className="walletTab">
        <div className="walletTab__header clientStickyHeader">
          <Flex gap={"0.5rem"}>
            <UiSearchInput
              className="search"
              placeholder="Buscar por ID"
              onChange={handleSearchChange}
            />
            <WalletTabFilter setSelectedFilters={setFilters} />
            <Button
              className="button__actions"
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              disabled={isLoading}
              onClick={handleisGenerateActionOpen}
            >
              Generar acción
            </Button>
          </Flex>
        </div>
        {isLoading ? (
          <Flex justify="center" align="center" style={{ height: "3rem" }}>
            <Spin />
          </Flex>
        ) : (
          <Collapse
            stickyLabel
            items={invoices?.map((invoiceState) => ({
              key: invoiceState.status_id,
              label: (
                <LabelCollapse
                  status={invoiceState.status}
                  total={invoiceState.total}
                  quantity={invoiceState.count}
                  color={invoiceState.color}
                />
              ),
              children: (
                <InvoicesTable
                  openInvoiceDetail={handleOpenInvoiceDetail}
                  stateId={invoiceState.status_id}
                  dataSingleInvoice={invoiceState.invoices}
                  setSelectedRows={setSelectedRows}
                  selectedRows={selectedRows}
                />
              )
            }))}
          />
        )}
      </div>

      <ModalGenerateAction
        clientId={clientId}
        isOpen={isGenerateActionOpen}
        setSelectOpen={(e) => {
          setisGenerateActionOpen((prev) => !prev);
          setIsSelectOpen(e);
        }}
        onClose={handleisGenerateActionOpen}
        setShowActionDetailModal={(e) => {
          setisGenerateActionOpen(!isGenerateActionOpen);
          setShowActionDetailModal(e);
        }}
        validateInvoiceIsSelected={validateInvoiceIsSelected}
        addInvoicesToApplicationTable={handleAddSelectedInvoicesToApplicationTable}
      />
      <PaymentAgreementModal
        invoiceSelected={selectedRows}
        isOpen={isSelectOpen.selected === 6}
        onClose={onCloseModal}
        clientId={clientId}
        projectId={projectId}
        messageShow={messageShow}
        onCloseAllModals={() => {
          closeAllModal();
          openModal("sendEmail", {
            event_id: "paymentAgreement"
          });
        }}
      />
      <ModalActionDiscountCredit
        isOpen={showActionDetailModal?.isOpen}
        onClose={() => {
          setisGenerateActionOpen((prev) => !prev);
          setShowActionDetailModal({ isOpen: false, actionType: 0 });
        }}
        showActionDetailModal={showActionDetailModal}
        setShowActionDetailModal={setShowActionDetailModal}
        invoiceSelected={selectedRows}
        onCloseAllModals={closeAllModal}
      />
      <WalletTabChangeStatusModal
        isOpen={isSelectOpen.selected === 2}
        onClose={onCloseModal}
        invoiceSelected={selectedRows}
        clientId={clientId}
        projectId={projectId}
        onCloseAllModals={closeAllModal}
        messageShow={messageShow}
      />
      <RadicationInvoice
        isOpen={isSelectOpen.selected === 3}
        onClose={onCloseModal}
        invoiceSelected={selectedRows}
        clientId={clientId}
        projectId={projectId}
        messageShow={messageShow}
      />
      <RegisterNews
        isOpen={isSelectOpen.selected === 1}
        onClose={onCloseModal}
        invoiceSelected={selectedRows}
        clientId={clientId}
        projectId={projectId}
        messageShow={messageShow}
        onCloseAllModals={() => {
          closeAllModal();
          openModal("sendEmail", {
            event_id: "1"
          });
        }}
      />
      <DigitalRecordModal
        isOpen={isSelectOpen.selected === 7}
        onClose={onCloseModal}
        messageShow={messageShow}
        projectId={projectId}
        invoiceSelected={selectedRows}
        clientId={clientId}
      />
    </>
  );
  {
  }
};
