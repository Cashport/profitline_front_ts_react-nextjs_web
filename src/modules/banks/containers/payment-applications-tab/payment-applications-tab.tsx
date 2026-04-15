import { FC, useState } from "react";
import { Button, Flex, Spin } from "antd";
import { Bank, DotsThree } from "phosphor-react";
import dayjs from "dayjs";

import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { approvePayment } from "@/services/banksPayments/banksPayments";
import { markPaymentsAsUnidentified } from "@/services/applyTabClients/applyTabClients";

import BanksRules from "../bank-rules";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import {
  FilterActivePaymentsTab,
  IActivePaymentsFilters
} from "@/components/atoms/Filters/FilterActivePaymentsTab/FilterActivePaymentsTab";
import ModalFilterSelectDates from "../../components/modal-filter-select-dates";

import { ISingleBank } from "@/types/banks/IBanks";
import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { IFormFilterDates } from "../../components/modal-filter-select-dates/modal-filter-select-dates";

import styles from "./payment-applications-tab.module.scss";
import { usePaymentApplications } from "@/hooks/usePaymentApplications";

export const PaymentApplicationsTab: FC = () => {
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
  const { data, isLoading, mutate } = usePaymentApplications({});

  console.log("data", data);
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
          <div className={`${styles.header} banksStickyHeader`}>
            <OptimizedSearchComponent title="Buscar" onSearch={handleSearch} />
            <FilterActivePaymentsTab
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
                  showMessage("error", "Seleccione al menos un pago");
                  return;
                }
                setisGenerateActionOpen(true);
              }}
            >
              Generar acción
            </Button>
          </div>

          {/* {isLoading ? (
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
          )} */}

          <ModalFilterSelectDates
            isOpen={isSelectOpen.selected === 7}
            onClose={() => setIsSelectOpen({ selected: 0 })}
            selectDates={handleFilterDates}
          />
        </Flex>
      )}
    </>
  );
};

export default PaymentApplicationsTab;
