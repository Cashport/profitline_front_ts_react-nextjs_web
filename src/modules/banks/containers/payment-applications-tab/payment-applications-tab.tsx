import { FC, useState } from "react";
import { Flex, Spin } from "antd";
import { DotsThree } from "phosphor-react";
import dayjs from "dayjs";

import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";

import BanksRules from "../bank-rules";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import { IPaymentApplicationsFilters } from "@/components/atoms/Filters/FilterPaymentApplicationsTab/FilterPaymentApplicationsTab";
import ModalFilterSelectDates from "../../components/modal-filter-select-dates";
import Collapse from "@/components/ui/collapse";
import LabelCollapse from "@/components/ui/label-collapse";
import PaymentApplicationsTable from "../../components/payment-applications-table/PaymentApplicationsTable";
import ModalActionsPaymentApplications from "../../components/modal-actions-payment-applications";

import { ISingleBank } from "@/types/banks/IBanks";
import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";
import { IFormFilterDates } from "../../components/modal-filter-select-dates/modal-filter-select-dates";

import styles from "./payment-applications-tab.module.scss";
import { usePaymentApplications } from "@/hooks/usePaymentApplications";
import { PaymentTransactionType } from "@/modules/banks/constants/paymentTransactionType";
import { BanksSlot } from "../../contexts/banks-chrome-context";
import BanksFilterModal from "../../components/banks-filter-modal/banks-filter-modal";

interface PaymentApplicationsTabProps {
  isActive: boolean;
  transactionType: PaymentTransactionType[];
}

export const PaymentApplicationsTab: FC<PaymentApplicationsTabProps> = ({
  isActive,
  transactionType
}) => {
  const [selectedRows, setSelectedRows] = useState<IPaymentApplication[]>();
  const [showBankRules, setShowBankRules] = useState<boolean>(false);
  const [isGenerateActionOpen, setisGenerateActionOpen] = useState(false);
  const [clearSelected, setClearSelected] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState({ selected: 0 });
  const [mutatedPaymentDetail, mutatePaymentDetail] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<IPaymentApplicationsFilters>({
    dates: []
  });
  const [customDate, setCustomDate] = useState<string>("");

  const { showMessage } = useMessageApi();
  const { openModal } = useModalDetail();
  const { data, isLoading, mutate } = usePaymentApplications({
    selectedFilters,
    searchQuery,
    enabled: isActive,
    transaction_type: transactionType
  });

  const handleActionInDetail = (selectedPayment: ISingleBank | IClientPayment): void => {
    setisGenerateActionOpen(!isGenerateActionOpen);
    setSelectedRows([selectedPayment as unknown as IPaymentApplication]);
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

  const handleSearch = (query: string) => {
    const searchQuery = query.trim().replaceAll(" ", ",");
    setSearchQuery(searchQuery);
  };

  const handleFilterDates = (data: IFormFilterDates) => {
    const { start_date, end_date } = data;
    setSelectedFilters({
      dates: [`${dayjs(start_date).format("YYYY-MM-DD")}|${dayjs(end_date).format("YYYY-MM-DD")}`]
    });
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
            <BanksFilterModal setSelectedFilters={setSelectedFilters} />
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
              title="Generar acción"
              aria-label="Generar acción"
              onClick={() => {
                if (!selectedRows || selectedRows.length === 0) {
                  showMessage("error", "Seleccione al menos una aplicación de pago");
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
              items={data?.map((status) => ({
                key: status.status_id,
                label: (
                  <LabelCollapse
                    status={status.name}
                    color={status.color}
                    quantity={status.applications.length}
                    total={status.total || 0}
                  />
                ),
                children: (
                  <PaymentApplicationsTable
                    applicationsByStatus={status.applications.map((application) => ({
                      ...application,
                      status_id: status.status_id
                    }))}
                    handleOpenDetail={handleOpenPaymentDetail}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    statusId={status.status_id}
                    statusName={status.name}
                    clearSelected={clearSelected}
                    mutate={mutate}
                  />
                )
              }))}
            />
          )}

          <ModalFilterSelectDates
            isOpen={isSelectOpen.selected === 7}
            onClose={() => setIsSelectOpen({ selected: 0 })}
            selectDates={handleFilterDates}
          />

          <ModalActionsPaymentApplications
            isOpen={isGenerateActionOpen}
            onClose={() => setisGenerateActionOpen(false)}
            selectedRows={selectedRows}
          />
        </Flex>
      )}
    </>
  );
};

export default PaymentApplicationsTab;
