import { FC, useState } from "react";
import { Flex, Spin } from "antd";
import { DotsThree } from "phosphor-react";
import dayjs from "dayjs";

import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { useBankPayments } from "@/hooks/useBankPayments";
import { PaymentTransactionType } from "@/modules/banks/constants/paymentTransactionType";
import { approvePayment } from "@/services/banksPayments/banksPayments";
import { markPaymentsAsUnidentified } from "@/services/applyTabClients/applyTabClients";

import Collapse from "@/components/ui/collapse";
import LabelCollapse from "@/components/ui/label-collapse";
import BanksTable from "../../components/banks-table/Banks-table";
import BanksRules from "../bank-rules";
import ModalActionsBanksPayments from "../../components/modal-actions-banks-payments";
import ModalActionsEditClient from "../../components/modal-actions-edit-client";
import ModalActionsUploadEvidence from "../../components/modal-actions-upload-evidence";
import ModalActionsAssignClient from "../../components/modal-actions-assign-client";
import ModalActionsSplitPayment from "../../components/modal-actions-split-payment";
import ModalActionsChangeStatus from "../../components/modal-actions-change-status";
import ModalActionsChangeErpId from "../../components/modal-actions-change-erp-id";
import ModalActionsChangePeriod from "../../components/modal-actions-change-period";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import { IActivePaymentsFilters } from "@/components/atoms/Filters/FilterActivePaymentsTab/FilterActivePaymentsTab";
import ModalFilterSelectDates from "../../components/modal-filter-select-dates";

import { ISingleBank } from "@/types/banks/IBanks";
import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { IFormFilterDates } from "../../components/modal-filter-select-dates/modal-filter-select-dates";

import styles from "./active-payments-tab.module.scss";
import { BanksSlot } from "../../contexts/banks-chrome-context";
import BanksFilterModal from "../../components/banks-filter-modal/banks-filter-modal";

interface ActivePaymentsTabProps {
  isActive: boolean;
}

const STATUS_ORDER = [
  "Sin identificar",
  "Pendiente ingreso a SAP",
  "Identificado",
  "Pago aplicado"
];
const PAGO_APLICADO_STATUS_ID = 4;
const IDENTIFICADO_STATUS_ID = 1;

export const ActivePaymentsTab: FC<ActivePaymentsTabProps> = ({ isActive }) => {
  const [selectedRows, setSelectedRows] = useState<ISingleBank[]>();
  const [showBankRules, setShowBankRules] = useState<boolean>(false);
  const [isGenerateActionOpen, setisGenerateActionOpen] = useState(false);
  const [clearSelected, setClearSelected] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState({ selected: 0 });
  const [mutatedPaymentDetail, mutatePaymentDetail] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<IActivePaymentsFilters>({
    dates: [],
    active: []
  });
  const [customDate, setCustomDate] = useState<string>("");

  const { ID } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();
  const { openModal } = useModalDetail();
  const { data, isLoading, mutate } = useBankPayments({
    like: searchQuery,
    selectedFilters,
    enabled: isActive,
    transaction_type: [PaymentTransactionType.Formal, PaymentTransactionType.Homemarket]
  });

  const handleOpenBankRules = () => {
    setShowBankRules(true);
  };

  const handleActionInDetail = (selectedPayment: ISingleBank | IClientPayment): void => {
    setisGenerateActionOpen(!isGenerateActionOpen);
    setSelectedRows([selectedPayment as ISingleBank]);
    mutate();
  };

  const handleOpenPaymentDetail = (paymentId: number) => {
    openModal("payment", {
      paymentId,
      handleActionInDetail,
      handleOpenPaymentDetail,
      mutatedPaymentDetail
    });
  };

  const onCloseModal = (cancelClicked?: Boolean) => {
    setIsSelectOpen({ selected: 0 });

    if (cancelClicked) return setisGenerateActionOpen(!isGenerateActionOpen);

    setClearSelected(!clearSelected);
    setSelectedRows([]);
    mutate();

    mutatePaymentDetail((prev) => !prev);
    openModal("payment", {
      paymentId: selectedRows?.[0]?.id || 0,
      handleActionInDetail,
      handleOpenPaymentDetail,
      mutatedPaymentDetail: !mutatedPaymentDetail
    });
  };

  const handleApproveAssignment = async () => {
    setLoadingApprove(true);
    try {
      await approvePayment({
        payments: selectedRows?.map((row) => row.id) || [],
        project_id: ID,
        client_id: selectedRows?.[0]?.id_client || ""
      });

      showMessage("success", "Asignación aprobada correctamente");
      onCloseModal();
    } catch (error) {
      showMessage("error", "Error al aprobar la asignación");
    }
    setLoadingApprove(false);
  };

  const handlePaymentUnidentified = async () => {
    try {
      await markPaymentsAsUnidentified(selectedRows?.map((payment) => payment.id) || []);
      showMessage("success", "Pago(s) marcados como no identificados");
      mutate();
      setSelectedRows([]);
    } catch (error) {
      showMessage(
        "error",
        "Ha ocurrido un error al marcar los pagos seleccionados como no identificados"
      );
    }
    setIsSelectOpen({ selected: 0 });
  };

  const handleSearch = (query: string) => {
    const searchQuery = query.trim().replaceAll(" ", ",");
    setSearchQuery(searchQuery);
  };

  const handleFilterDates = (data: IFormFilterDates) => {
    const { start_date, end_date } = data;
    setSelectedFilters((prev) => ({
      ...prev,
      dates: [`${dayjs(start_date).format("YYYY-MM-DD")}|${dayjs(end_date).format("YYYY-MM-DD")}`]
    }));
    setCustomDate(
      `${dayjs(start_date).format("YYYY-MM-DD")}|${dayjs(end_date).format("YYYY-MM-DD")}`
    );
  };

  return (
    <>
      {showBankRules ? (
        <BanksRules onClickBack={() => setShowBankRules(false)} />
      ) : (
        <Flex className={styles.activePaymentsTab} vertical>
          {/* Diseño "Pedidos y Bancos": buscador y Filtrar en el header; las acciones junto a las
              pestañas (ver banks-chrome-context). */}
          <BanksSlot to="header" active={isActive}>
            <BanksFilterModal setSelectedFilters={setSelectedFilters} withActive defaultLast30 />
            <OptimizedSearchComponent
              title="Buscar referencia, valor…"
              onSearch={handleSearch}
              surface="page"
              className="!w-[220px] !flex-none"
            />
          </BanksSlot>
          <BanksSlot to="tabs" active={isActive}>
            <button
              type="button"
              onClick={handleOpenBankRules}
              className="flex h-[var(--control-h)] cursor-pointer items-center gap-1.5 rounded-lg border border-cp-line-2 bg-cp-surface px-3 text-[14px] font-medium text-cp-ink hover:border-cp-ink"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 6h10M4 12h16M4 18h7M17 4v4M20 16v4" />
              </svg>
              Reglas de banco
            </button>
            <button
              type="button"
              title="Generar acción"
              aria-label="Generar acción"
              onClick={() => {
                if (!selectedRows || selectedRows.length === 0) {
                  showMessage("error", "Seleccione al menos un pago");
                  return;
                }
                setisGenerateActionOpen(true);
              }}
              className="flex h-[var(--control-h)] w-[var(--control-h)] cursor-pointer items-center justify-center rounded-lg border border-cp-line-2 bg-cp-surface text-cp-ink hover:border-cp-ink"
            >
              <DotsThree size={18} weight="bold" />
            </button>
          </BanksSlot>

          {isLoading ? (
            <Flex justify="center">
              <Spin style={{ margin: "30px" }} />
            </Flex>
          ) : (
            <Collapse
              stickyLabel
              labelStickyOffset={"6rem"}
              items={data
                ?.slice()
                .sort((a, b) => {
                  const ia = STATUS_ORDER.indexOf(a.payments_status);
                  const ib = STATUS_ORDER.indexOf(b.payments_status);
                  return (
                    (ia === -1 ? STATUS_ORDER.length : ia) - (ib === -1 ? STATUS_ORDER.length : ib)
                  );
                })
                .map((status) => ({
                  key: status.payments_status_id,
                  label: (
                    <LabelCollapse
                      status={status.payments_status}
                      color={status.color}
                      quantity={status.payments.length}
                      total={status.total_account || 0}
                    />
                  ),
                  children: (
                    <BanksTable
                      clientsByStatus={status.payments.map((client) => ({
                        ...client,
                        client_status_id: status.payments_status_id
                      }))}
                      handleOpenPaymentDetail={handleOpenPaymentDetail}
                      selectedRows={selectedRows}
                      setSelectedRows={setSelectedRows}
                      bankStatusId={status.payments_status_id}
                      clearSelected={clearSelected}
                    />
                  )
                }))}
            />
          )}

          <ModalActionsBanksPayments
            isOpen={isGenerateActionOpen}
            onClose={() => setisGenerateActionOpen(false)}
            setSelectOpen={(e) => {
              const { selected } = e;
              if (
                selected !== 2 &&
                selected !== 3 &&
                selected !== 6 &&
                selected !== 10 &&
                selectedRows &&
                selectedRows.length > 1
              ) {
                showMessage("info", "Solo puedes seleccionar un pago para esta acción");
                return;
              }

              if (
                selected === 2 &&
                selectedRows?.some((row) => row.id_status === PAGO_APLICADO_STATUS_ID)
              ) {
                showMessage("info", "No puedes asignar cliente a pagos en estado Pago aplicado");
                return;
              }

              if (
                selected === 10 &&
                selectedRows?.some(
                  (row) =>
                    row.id_status !== IDENTIFICADO_STATUS_ID &&
                    row.id_status !== PAGO_APLICADO_STATUS_ID
                )
              ) {
                showMessage(
                  "info",
                  "Solo puedes cambiar el periodo contable de pagos identificados o aplicados"
                );
                return;
              }

              if ((selected === 6 || selected === 3) && selectedRows && selectedRows.length > 1) {
                const clientId = selectedRows[0].id_client;
                if (!selectedRows.every((row) => row.id_client === clientId)) {
                  showMessage(
                    "info",
                    "Solo puedes seleccionar pagos del mismo cliente para esta acción"
                  );
                  return;
                }
              }

              setisGenerateActionOpen((prev) => !prev);
              setIsSelectOpen(e);
            }}
          />

          <ModalActionsEditClient
            isOpen={isSelectOpen.selected === 1}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalActionsAssignClient
            isOpen={isSelectOpen.selected === 2}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalConfirmAction
            isOpen={isSelectOpen.selected === 3}
            onClose={onCloseModal}
            onOk={handleApproveAssignment}
            title="¿Está seguro de aprobar la asignación?"
            okText="Aprobar"
            okLoading={loadingApprove}
          />
          <ModalActionsSplitPayment
            isOpen={isSelectOpen.selected === 4}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalActionsUploadEvidence
            isOpen={isSelectOpen.selected === 5}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalActionsChangeStatus
            isOpen={isSelectOpen.selected === 6}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalFilterSelectDates
            isOpen={isSelectOpen.selected === 7}
            onClose={() => setIsSelectOpen({ selected: 0 })}
            selectDates={handleFilterDates}
          />
          <ModalConfirmAction
            title="¿Marcar pagos seleccionados como sin identificar?"
            isOpen={isSelectOpen.selected === 8}
            onClose={() => setIsSelectOpen({ selected: 0 })}
            onOk={handlePaymentUnidentified}
          />
          <ModalActionsChangeErpId
            isOpen={isSelectOpen.selected === 9}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
          <ModalActionsChangePeriod
            isOpen={isSelectOpen.selected === 10}
            onClose={onCloseModal}
            selectedRows={selectedRows}
          />
        </Flex>
      )}
    </>
  );
};

export default ActivePaymentsTab;
