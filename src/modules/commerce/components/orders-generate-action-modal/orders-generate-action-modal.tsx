import { Dispatch, Key, SetStateAction, useEffect, useRef, useState } from "react";
import { Flex, message, Modal, Typography } from "antd";
import {
  ArrowULeftDown,
  DownloadSimple,
  EnvelopeSimple,
  FileArrowUp,
  NewspaperClipping,
  Trash
} from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { createAndDownloadTxt } from "@/utils/utils";
import {
  changeOrderState,
  changeStatusOrder,
  downloadBillingDetailExcel,
  downloadBillingReportExcel,
  downloadSalesDetailExcel,
  dowloadOrderCSV,
  downloadPartialOrderCSV,
  IUploadPurchaseOrdersData,
  uploadPurchaseOrders
} from "@/services/commerce/commerce";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { UploadPurchaseOrdersProgressModal } from "./upload-purchase-orders-progress-modal";
import { UploadPurchaseOrdersSummaryModal } from "./upload-purchase-orders-summary-modal";

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
  const [isBillingDetailLoading, setIsBillingDetailLoading] = useState(false);
  const [isSalesDetailLoading, setIsSalesDetailLoading] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadProgressOpen, setIsUploadProgressOpen] = useState(false);
  const [isUploadSummaryOpen, setIsUploadSummaryOpen] = useState(false);
  const [uploadSummaryData, setUploadSummaryData] =
    useState<IUploadPurchaseOrdersData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDownloadBillingDetail = async () => {
    setIsBillingDetailLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando informe de facturación detallado...",
      duration: 0
    });
    try {
      const res = await downloadBillingDetailExcel(projectId);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", "Descarga exitosa");
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "Error al descargar el archivo");
      console.error(error);
    } finally {
      hide();
      setIsBillingDetailLoading(false);
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

  const handleOpenUploadPurchaseOrders = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Resetea el input para permitir seleccionar el mismo archivo dos veces
    event.target.value = "";

    if (!file) return;

    const isXlsx =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isXlsx) {
      showMessage("error", "Solo se permiten archivos Excel (.xlsx)");
      return;
    }

    setUploadFile(file);
    setIsUploadProgressOpen(true);
  };

  const handleCancelUploadProgress = () => {
    setIsUploadProgressOpen(false);
    setUploadFile(null);
  };

  const handleCloseUploadSummary = () => {
    setIsUploadSummaryOpen(false);
    setUploadSummaryData(null);
    setUploadFile(null);
  };

  useEffect(() => {
    if (!isUploadProgressOpen) return;

    let cancelled = false;

    if (!uploadFile) return;

    // Se dispara la subida inmediatamente. La barra de carga del modal
    // avanza de forma independiente durante aprox. 3 minutos para dar
    // feedback visual al usuario mientras el servidor procesa.
    uploadPurchaseOrders(uploadFile)
      .then((response) => {
        if (cancelled) return;
        setIsUploadProgressOpen(false);
        setUploadSummaryData(response.data);
        setIsUploadSummaryOpen(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setIsUploadProgressOpen(false);
        setUploadFile(null);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al procesar las órdenes de compra";
        showMessage("error", errorMessage);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploadProgressOpen, uploadFile]);

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
            onClick={handleDownloadBillingDetail}
            icon={<DownloadSimple size={16} />}
            title="Descargar informe de facturación detallado"
            disabled={isBillingDetailLoading}
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
          <ButtonGenerateAction
            onClick={handleOpenUploadPurchaseOrders}
            icon={<FileArrowUp size={16} />}
            title="Subir orden de compra"
          />
        </Flex>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleUploadFileChange}
          style={{ display: "none" }}
        />
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

      <UploadPurchaseOrdersProgressModal
        isOpen={isUploadProgressOpen}
        file={uploadFile}
        onCancel={handleCancelUploadProgress}
      />

      <UploadPurchaseOrdersSummaryModal
        isOpen={isUploadSummaryOpen}
        data={uploadSummaryData}
        onClose={handleCloseUploadSummary}
      />
    </>
  );
};
