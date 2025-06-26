import { useState } from "react";
import { Button, Flex, Spin } from "antd";
import { DotsThree, MagnifyingGlassPlus } from "phosphor-react";
import { useParams } from "next/navigation";
import { AxiosError } from "axios";

import {
  addItemsToTable,
  markPaymentsAsUnidentified
} from "@/services/applyTabClients/applyTabClients";
import { extractSingleParam } from "@/utils/utils";
import { useSelectedPayments } from "@/context/SelectedPaymentsContext";
import { useClientsPayments } from "@/hooks/useClientsPayments";
import { useModalDetail } from "@/context/ModalContext";
import { useMessageApi } from "@/context/MessageContext";
import { useApplicationTable } from "@/hooks/useApplicationTable";

import LabelCollapse from "@/components/ui/label-collapse";
import UiSearchInput from "@/components/ui/search-input";
import Collapse from "@/components/ui/collapse";
import UiFilterDropdown from "@/components/ui/ui-filter-dropdown";
import PaymentsTable from "@/modules/clients/components/payments-table";
import { ModalActionPayment } from "@/components/molecules/modals/ModalActionPayment/ModalActionPayment";
import ModalIdentifyPayment from "../../components/payments-tab/modal-identify-payment-action";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { IClientPayment } from "@/types/clientPayments/IClientPayments";
import { ISingleBank } from "@/types/banks/IBanks";

import "./payments-tab.scss";

interface PaymentProd {
  // eslint-disable-next-line no-unused-vars
  onChangeTab: (activeKey: string) => void;
}

const PaymentsTab: React.FC<PaymentProd> = ({ onChangeTab }) => {
  const params = useParams();
  const clientId = extractSingleParam(params.clientId);
  const projectId = extractSingleParam(params.projectId);
  const { selectedPayments, setSelectedPayments } = useSelectedPayments();
  const [isSelectedActionModalOpen, setIsSelectedActionModalOpen] = useState({
    selected: 0
  });
  const [search, setSearch] = useState("");
  const [isModalActionPaymentOpen, setIsModalActionPaymentOpen] = useState(false);
  const [mutatedPaymentDetail, mutatePaymentDetail] = useState<boolean>(false);

  const { showMessage } = useMessageApi();
  const { openModal } = useModalDetail();

  const { data, isLoading, mutate } = useClientsPayments();
  const { mutate: mutateApplyTabData } = useApplicationTable();

  const handleActionInDetail = (selectedPayment: IClientPayment | ISingleBank): void => {
    setIsModalActionPaymentOpen((prev) => !prev);
    setSelectedPayments([selectedPayment as IClientPayment]);
    mutate();
  };

  const handleOpenPaymentDetail = (paymentId: number) => {
    openModal("payment", {
      paymentId: paymentId,
      handleActionInDetail: handleActionInDetail,
      handleOpenPaymentDetail,
      mutatedPaymentDetail
    });
  };

  const onChangetabWithCloseModal = (activeKey: string) => {
    setIsModalActionPaymentOpen(false);
    // onChangeTab(activeKey);
  };

  const handleCloseActionModal = (cancelClicked?: boolean, mutatePaymentsData?: boolean) => {
    setIsSelectedActionModalOpen({ selected: 0 });

    if (mutatePaymentsData) {
      mutate();
    }

    if (cancelClicked) return;
    setIsModalActionPaymentOpen((prev) => !prev);
  };

  const handleOpenIdentifyPayment = () => {
    setIsSelectedActionModalOpen({ selected: 1 });
  };

  const handleAddSelectedPaymentsToApplicationTable = async () => {
    try {
      await addItemsToTable(
        Number(projectId) || 0,
        clientId || "",
        "payments",
        selectedPayments?.map((payment) => payment.id) || []
      );
      setIsModalActionPaymentOpen(false);
      showMessage("success", "Pagos añadidos a la tabla de aplicación de pagos");
      // mutate Applytable data
      mutateApplyTabData();
    } catch (error) {
      if (error instanceof AxiosError) {
        showMessage(
          "error",
          `Error al añadir pagos a la tabla de aplicación de pagos ${error.message}`
        );
      } else {
        showMessage("error", `Error al añadir pagos a la tabla de aplicación de pagos`);
      }
    }
  };

  const handlePaymentUnidentified = async () => {
    try {
      await markPaymentsAsUnidentified(selectedPayments.map((payment) => payment.id));
      showMessage("success", "Pago(s) marcados como no identificados");
      mutate();
      setSelectedPayments([]);
    } catch (error) {
      showMessage(
        "error",
        "Ha ocurrido un error al marcar los pagos seleccionados como no identificados"
      );
    }
    setIsSelectedActionModalOpen({ selected: 0 });
  };

  return (
    <>
      <div className="paymentsTab">
        <Flex justify="space-between" className="paymentsTab__header clientStickyHeader">
          <Flex gap={"0.5rem"}>
            <UiSearchInput
              className="search"
              placeholder="Buscar"
              onChange={(event) => {
                setTimeout(() => {
                  setSearch(event.target.value);
                }, 1000);
              }}
            />
            <UiFilterDropdown />
            <Button
              className="button__actions"
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              disabled={false}
              onClick={() => setIsModalActionPaymentOpen(true)}
            >
              Generar acción
            </Button>
          </Flex>

          <Button type="primary" className="identifiyPayment" onClick={handleOpenIdentifyPayment}>
            Identificar pago
            <MagnifyingGlassPlus size={16} style={{ marginLeft: "0.5rem" }} />
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" style={{ margin: "2rem 0" }}>
            <Spin />
          </Flex>
        ) : (
          <Collapse
            stickyLabel
            items={data?.map((PaymentStatus) => ({
              key: PaymentStatus.payments_status_id,
              label: (
                <LabelCollapse status={PaymentStatus.payments_status} color={PaymentStatus.color} />
              ),
              children: (
                <PaymentsTable
                  paymentStatusId={PaymentStatus.payments_status_id}
                  paymentsByStatus={PaymentStatus.payments}
                  handleOpenPaymentDetail={handleOpenPaymentDetail}
                />
              )
            }))}
          />
        )}
      </div>
      <ModalActionPayment
        isOpen={isModalActionPaymentOpen}
        onClose={() => setIsModalActionPaymentOpen(false)}
        onChangeTab={onChangetabWithCloseModal}
        setIsSelectedActionModalOpen={setIsSelectedActionModalOpen}
        setIsModalActionPaymentOpen={setIsModalActionPaymentOpen}
        addPaymentsToApplicationTable={handleAddSelectedPaymentsToApplicationTable}
        selectedPayments={selectedPayments}
      />
      <ModalIdentifyPayment
        isOpen={isSelectedActionModalOpen.selected === 1}
        onClose={handleCloseActionModal}
      />
      <ModalConfirmAction
        title="¿Marcar pagos seleccionados como no identificados?"
        isOpen={isSelectedActionModalOpen.selected === 2}
        onClose={handleCloseActionModal}
        onOk={handlePaymentUnidentified}
      />
    </>
  );
};

export default PaymentsTab;
