import { FC, useState } from "react";
import { Button, Flex, Spin } from "antd";
import { DotsThree } from "phosphor-react";
import dayjs from "dayjs";

import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";

import BanksRules from "../bank-rules";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import {
  FilterPaymentApplicationsTab,
  IPaymentApplicationsFilters
} from "@/components/atoms/Filters/FilterPaymentApplicationsTab/FilterPaymentApplicationsTab";
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
          <div className={`${styles.header} banksStickyHeader`}>
            <OptimizedSearchComponent title="Buscar" onSearch={handleSearch} />
            <FilterPaymentApplicationsTab
              setSelectedFilters={setSelectedFilters}
              handleOpenCustomDate={() => setIsSelectOpen({ selected: 7 })}
              customDate={customDate}
              setCustomDate={setCustomDate}
            />
            <Button
              className={styles.button__actions}
              icon={<DotsThree size={"1.5rem"} />}
              onClick={() => {
                if (!selectedRows || selectedRows.length === 0) {
                  showMessage("error", "Seleccione al menos una aplicación de pago");
                  return;
                }
                setisGenerateActionOpen(true);
              }}
            >
              Generar acción
            </Button>
          </div>

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
