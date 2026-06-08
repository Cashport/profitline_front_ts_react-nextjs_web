import { Dispatch, Key, SetStateAction, useState } from "react";
import { Flex, message, Modal, Typography } from "antd";
import {
  ArrowULeftDown,
  DownloadSimple,
  EnvelopeSimple,
  NewspaperClipping,
  Trash
} from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { createAndDownloadTxt } from "@/utils/utils";
import {
  changeOrderState,
  changeStatusOrder,
  downloadBillingReportExcel,
  downloadSalesDetailExcel,
  dowloadOrderCSV,
  downloadPartialOrderCSV
} from "@/services/commerce/commerce";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { IOrder } from "@/types/commerce/ICommerce";

import "./orders-generate-action-modal.scss";
const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ordersId: number[];
  setFetchMutate: () => void;
  setSelectedRows: Dispatch<SetStateAction<IOrder[] | undefined>>;
  setSelectedRowKeys: Dispatch<SetStateAction<Key[]>>;
  handleDeleteRows: () => void;
  handleSendInvite: () => void;
}

export const OrdersGenerateActionModal = ({
  isOpen,
  onClose,
  ordersId,
  setFetchMutate,
  setSelectedRows,
  setSelectedRowKeys,
  handleDeleteRows,
  handleSendInvite
}: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBillingReportLoading, setIsBillingReportLoading] = useState(false);
  const [isSalesDetailLoading, setIsSalesDetailLoading] = useState(false);

  const validateOrdersSelected = (): boolean => {
    if (ordersId.length === 0) {
      message.error("No hay órdenes seleccionadas");
      return false;
    }
    return true;
  };

  const handleChangeOrderState = async () => {
    if (!validateOrdersSelected()) return;
    try {
      await changeOrderState(ordersId, showMessage);
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadCSV = async () => {
    if (!validateOrdersSelected()) return;
    try {
      const res = await dowloadOrderCSV(ordersId, projectId);
      if (!res || !res.data) {
        if (res?.message) {
          return showMessage("error", res.message);
        } else return showMessage("error", "Error al descargar CSV");
      }
      createAndDownloadTxt(res.data);
      if (res.message == "") {
        showMessage("success", "Descarga exitosa");
      } else {
        setErrorMessage(res?.message);
        setIsErrorModalOpen(true);
      }
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const downloadFileFromUrl = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadBillingReport = async () => {
    setIsBillingReportLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando informe de facturación...",
      duration: 0
    });
    try {
      const res = await downloadBillingReportExcel(projectId);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", "Descarga exitosa");
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Error al descargar el archivo");
      console.error(error);
    } finally {
      hide();
      setIsBillingReportLoading(false);
    }
  };

  const handleDownloadSalesDetail = async () => {
    setIsSalesDetailLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando informe de ventas...",
      duration: 0
    });
    try {
      const res = await downloadSalesDetailExcel(projectId);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", "Descarga exitosa");
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Error al descargar el archivo");
      console.error(error);
    } finally {
      hide();
      setIsSalesDetailLoading(false);
    }
  };

  const handleDownloadCsvPartial = async (createBackorder: boolean) => {
    if (!validateOrdersSelected()) return;
    try {
      const res = await downloadPartialOrderCSV(ordersId[0], createBackorder);
      createAndDownloadTxt(res.txtContent);
      if (res.createdBackorderId) {
        showMessage(
          "success",
          `Se ha creado una orden de backorder con ID: ${res.createdBackorderId}`
        );
      } else {
        showMessage("success", "Descarga exitosa");
      }
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error: any) {
      showMessage("error", error?.message || "Error al descargar el CSV parcial");
      console.error(error);
    }
  };

  const handleDownloadPartialCsvShowQuestion = () => {
    Modal.confirm({
      title: "Descarga parcial CSV",
      content: "¿Deseas crear una orden de backorder?",
      okText: "Sí",
      cancelText: "No",
      closable: true,
      onOk() {
        handleDownloadCsvPartial(true);
      },
      onCancel() {
        handleDownloadCsvPartial(false);
      }
    });
  };

  const handleReturnToSeller = async () => {
    if (!validateOrdersSelected()) return;
    try {
      await changeStatusOrder(ordersId[0]);
      showMessage("success", "Estado cambiado correctamente");
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error: any) {
      showMessage("error", error?.message || "Error al cambiar el estado de la orden");
      console.error(error);
    }
  };

  return (
    <>
      <Modal
        className="ordersGenerateActionModal"
        open={isOpen}
        title={
          <Title className="ordersGenerateActionModal__title" level={4}>
            Generar acción
          </Title>
        }
        footer={null}
        onCancel={onClose}
      >
        <p className="ordersGenerateActionModal__description">
          Selecciona la acción que vas a realizar
        </p>
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={handleChangeOrderState}
            icon={<NewspaperClipping size={16} />}
            title="Enviar pedido a facturado"
          />
          <ButtonGenerateAction
            onClick={handleDownloadCSV}
            icon={<DownloadSimple size={16} />}
            title="Descargar CSV"
          />
          <ButtonGenerateAction
            onClick={handleDownloadBillingReport}
            icon={<DownloadSimple size={16} />}
            title="Descargar informe de facturación"
            disabled={isBillingReportLoading}
          />
          <ButtonGenerateAction
            onClick={handleDownloadSalesDetail}
            icon={<DownloadSimple size={16} />}
            title="Descargar informe de ventas"
            disabled={isSalesDetailLoading}
          />
          <ButtonGenerateAction
            onClick={handleDownloadPartialCsvShowQuestion}
            icon={<DownloadSimple size={16} />}
            title="Descarga parcial CSV"
            disabled={ordersId.length !== 1}
          />
          <ButtonGenerateAction
            onClick={handleDeleteRows}
            icon={<Trash size={16} />}
            title="Eliminar"
          />
          <ButtonGenerateAction
            onClick={handleSendInvite}
            icon={<EnvelopeSimple size={16} />}
            title="Enviar invitación"
          />
          <ButtonGenerateAction
            onClick={handleReturnToSeller}
            icon={<ArrowULeftDown size={16} />}
            title="Retornar al vendedor"
            disabled={ordersId.length !== 1}
          />
        </Flex>
      </Modal>

      <Modal
        open={isErrorModalOpen}
        onCancel={() => setIsErrorModalOpen(false)}
        footer={null}
        centered
        title={<Title level={4}>Descarga de plano de facturación</Title>}
      >
        <Flex vertical gap={12}>
          <Text>Ordenes sin stock</Text>
          <Text strong>{errorMessage}</Text>
        </Flex>
      </Modal>
    </>
  );
};
