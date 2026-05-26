import { FC, useState } from "react";
import { Button, Flex, Spin } from "antd";
import { Bank, DotsThree } from "phosphor-react";
import dayjs from "dayjs";

import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { useBankPayments } from "@/hooks/useBankPayments";
import { PaymentTransactionType } from "@/modules/banks/constants/paymentTransactionType";
import { approvePayment } from "@/services/banksPayments/banksPayments";
import { markPaymentsAsUnidentified } from "@/services/applyTabClients/applyTabClients";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
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
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import {
  FilterActivePaymentsTab,
  IActivePaymentsFilters
} from "@/components/atoms/Filters/FilterActivePaymentsTab/FilterActivePaymentsTab";
import ModalFilterSelectDates from "../../components/modal-filter-select-dates";

import { ISingleBank } from "@/types/banks/IBanks";
import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { IFormFilterDates } from "../../components/modal-filter-select-dates/modal-filter-select-dates";

import styles from "./wallet-payments-tab.module.scss";
import { FilterPaymentApplicationsTab } from "@/components/atoms/Filters/FilterPaymentApplicationsTab/FilterPaymentApplicationsTab";
import ModalActionsWalletPayments from "../../components/modal-actions-wallet-payments";

interface WalletPaymentsTabProps {
  isActive: boolean;
}

export const WalletPaymentsTab: FC<WalletPaymentsTabProps> = ({ isActive }) => {
  const [selectedRows, setSelectedRows] = useState<ISingleBank[]>();
  const [isGenerateActionOpen, setisGenerateActionOpen] = useState(false);
  const [clearSelected, setClearSelected] = useState(false);
  const [whichModalIsOpen, setWhichModalIsOpen] = useState(0);
  const [mutatedPaymentDetail, mutatePaymentDetail] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<IActivePaymentsFilters>({
    dates: [],
    active: []
  });
  const [customDate, setCustomDate] = useState<string>("");
  const { openModal } = useModalDetail();
  const { data, isLoading, mutate } = useBankPayments({
    like: searchQuery,
    selectedFilters,
    enabled: isActive,
    transaction_type: [PaymentTransactionType.Informal, PaymentTransactionType.Wallet]
  });

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
    setWhichModalIsOpen(0);

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
      <Flex className={styles.walletPaymentsTab} vertical>
        <div className={`${styles.header} banksStickyHeader`}>
          <OptimizedSearchComponent title="Buscar" onSearch={handleSearch} />
          <FilterPaymentApplicationsTab
            setSelectedFilters={setSelectedFilters}
            handleOpenCustomDate={() => setWhichModalIsOpen(1)}
            customDate={customDate}
            setCustomDate={setCustomDate}
          />
          <Button
            className={styles.button__actions}
            icon={<DotsThree size={"1.5rem"} />}
            onClick={() => {
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

        <ModalActionsWalletPayments
          isOpen={isGenerateActionOpen}
          onClose={() => setisGenerateActionOpen(false)}
          selectedRows={selectedRows}
          onSuccess={() => {
            setClearSelected((prev) => !prev);
            setSelectedRows([]);
            mutate();
          }}
        />

        <ModalFilterSelectDates
          isOpen={whichModalIsOpen === 1}
          onClose={() => setWhichModalIsOpen(0)}
          selectDates={handleFilterDates}
        />
      </Flex>
    </>
  );
};

export default WalletPaymentsTab;
