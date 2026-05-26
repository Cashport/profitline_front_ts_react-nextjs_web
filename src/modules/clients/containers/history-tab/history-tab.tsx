import { useState } from "react";
import { Button, Flex, Spin } from "antd";
import { useParams } from "next/navigation";
import { DotsThree } from "phosphor-react";

import { extractSingleParam } from "@/utils/utils";
import { useClientHistory } from "@/hooks/useClientHistory";
import { useMessageApi } from "@/context/MessageContext";
import { reprocessExcel, reprocessPDF } from "@/services/paymentApplications/paymentApplications";

import UiSearchInput from "@/components/ui/search-input";
import HistoryTable from "../../components/history-tab/history-tab-table";
import ModalActionsHistoryTab from "../../components/history-tab/history-tab-modal-generate-action";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ModalCommunicationDetail from "../../components/history-tab/history-tab-modal-communication-detail/History-tab-modal-communication-detail";

import { IHistoryRow } from "@/types/clientHistory/IClientHistory";

import styles from "./history-tab.module.scss";

const HistoryTab = () => {
  const { showMessage } = useMessageApi();
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const [rowDetailID, setRowDetailID] = useState<string>();
  const [selectedRows, setSelectedRows] = useState<IHistoryRow[] | undefined>(undefined);
  const [openModal, setOpenModal] = useState({ selected: 0 });
  const isLoading = false;

  const { data } = useClientHistory({ clientId: clientIdParam || "" });

  const handleCancelApplication = () => {
    console.info("Anular aplicación");
    console.info(selectedRows);
    setOpenModal({ selected: 0 });
  };

  const handleOpenDetail = (row: IHistoryRow, url: string | null) => {
    if (url && url !== null) {
      window.open(url, "_blank");
      return;
    }
    if (!row.id_mongo_log) return showMessage("info", "No hay detalle de esta comunicación");
    setRowDetailID(row.id_mongo_log);
    setOpenModal({ selected: 3 });
  };

  const isPaymentApplicationEvent = (row: IHistoryRow) => {
    const eventNormalized = (row.event || "").toLowerCase();
    return eventNormalized === "aplicación de pago" || eventNormalized === "legalización de saldo";
  };

  const getApplicationIdFromRow = (row: IHistoryRow) => {
    const directApplicationId = row.id_payment_application;
    if (typeof directApplicationId === "number" && directApplicationId > 0) {
      return directApplicationId;
    }

    return null;
  };

  const handleRegenerateExcel = async (row: IHistoryRow) => {
    if (!isPaymentApplicationEvent(row)) {
      return showMessage(
        "info",
        "Esta opción solo aplica para eventos de Aplicación de pago o Legalización de saldo"
      );
    }

    const applicationId = getApplicationIdFromRow(row);

    if (!applicationId) {
      return showMessage("info", "No se encontró el id de aplicación de pago en este registro");
    }

    try {
      const data = await reprocessExcel(applicationId);
      window.open(data.excel_url, "_blank");
    } catch (error) {
      if (row.payment_identification_excel_url) {
        window.open(row.payment_identification_excel_url, "_blank");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudo generar el plano";
      showMessage("error", message);
    }
  };

  const handleRegeneratePDF = async (row: IHistoryRow) => {
    if (!isPaymentApplicationEvent(row)) {
      return showMessage(
        "info",
        "Esta opción solo aplica para eventos de Aplicación de pago o Legalización de saldo"
      );
    }

    const applicationId = getApplicationIdFromRow(row);

    if (!applicationId) {
      return showMessage("info", "No se encontró el id de aplicación de pago en este registro");
    }

    try {
      const data = await reprocessPDF(applicationId);
      window.open(data.pdf_url, "_blank");
    } catch (error) {
      if (row.payment_identification_url) {
        window.open(row.payment_identification_url, "_blank");
        return;
      }

      const message = error instanceof Error ? error.message : "No se pudo generar el PDF";
      showMessage("error", message);
    }
  };

  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: "3rem" }}>
          <Spin />
        </Flex>
      ) : (
        <div className={styles.historyTab}>
          <Flex justify="space-between">
            <Flex gap={"0.5rem"}>
              <UiSearchInput className="standardSearch" placeholder="Buscar" />
              <Button
                className={styles.button__actions}
                size="large"
                icon={<DotsThree size={"1.5rem"} />}
                onClick={() => setOpenModal({ selected: 1 })}
              >
                Generar acción
              </Button>
            </Flex>
          </Flex>
          <HistoryTable
            dataAllRecords={data}
            setSelectedRows={setSelectedRows}
            handleOpenDetail={handleOpenDetail}
            handleRegenerateExcel={handleRegenerateExcel}
            handleRegeneratePDF={handleRegeneratePDF}
          />

          <ModalActionsHistoryTab
            isOpen={openModal.selected === 1}
            onClose={() => setOpenModal({ selected: 0 })}
            setSelectOpen={setOpenModal}
          />

          <ModalConfirmAction
            isOpen={openModal.selected === 2}
            onClose={() => setOpenModal({ selected: 0 })}
            title="¿Estás seguro que deseas anular esta aplicación de pago?"
            content="Esta acción es definitiva"
            onOk={handleCancelApplication}
            okText="Anular aplicación"
          />

          <ModalCommunicationDetail
            isOpen={openModal.selected === 3}
            onClose={() => setOpenModal({ selected: 0 })}
            mongoID={rowDetailID}
          />
        </div>
      )}
    </>
  );
};

export default HistoryTab;
