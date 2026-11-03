import { Dispatch, Key, SetStateAction, useEffect, useRef, useState } from "react";
import { Flex, message, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
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
  uploadPurchaseOrders,
  dowloadOrderCSVOCFormat
} from "@/services/commerce/commerce";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { ModalDownloadBillingExcel } from "./modal-download-billing-excel";
import { UploadPurchaseOrdersProgressModal } from "./upload-purchase-orders-progress-modal";
import { UploadPurchaseOrdersSummaryModal } from "./upload-purchase-orders-summary-modal";

import { IOrder } from "@/types/commerce/ICommerce";

import "./orders-generate-action-modal.scss";
const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedOrders: IOrder[];
  selectedDrafts?: IOrder[];
  setFetchMutate: () => void;
  setSelectedRows: Dispatch<SetStateAction<IOrder[] | undefined>>;
  setSelectedRowKeys: Dispatch<SetStateAction<Key[]>>;
  handleDeleteRows: () => void;
  handleSendInvite: () => void;
}

export const OrdersGenerateActionModal = ({
  isOpen,
  onClose,
  selectedOrders,
  selectedDrafts = [],
  setFetchMutate,
  setSelectedRows,
  setSelectedRowKeys,
  handleDeleteRows,
  handleSendInvite
}: Props) => {
  const ordersId = selectedOrders.map((order) => order.id);
  const selectedCount = selectedOrders.length;
  const operationNumbersText = selectedOrders.map((order) => order.operation_number).join(", ");
  const draftsCount = selectedDrafts.length;
  const draftOperationNumbersText = selectedDrafts.map((order) => "dft-" + order.id).join(", ");
  const clientName = selectedOrders[0]?.client_name ?? "";
  const statusName = selectedOrders[0]?.order_status ?? "";
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();
  const t = useTranslations("commerce.generateAction");
  const tCommon = useTranslations("common");

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBillingReportLoading, setIsBillingReportLoading] = useState(false);
  const [isBillingDetailLoading, setIsBillingDetailLoading] = useState(false);
  const [isBillingDetailModalOpen, setIsBillingDetailModalOpen] = useState(false);
  const [isSalesDetailLoading, setIsSalesDetailLoading] = useState(false);
  const [isPartialCsvModalOpen, setIsPartialCsvModalOpen] = useState(false);
  const [isPartialCsvLoading, setIsPartialCsvLoading] = useState(false);
  const [isOcFormatModalOpen, setIsOcFormatModalOpen] = useState(false);
  const [isOcFormatLoading, setIsOcFormatLoading] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadProgressOpen, setIsUploadProgressOpen] = useState(false);
  const [isUploadSummaryOpen, setIsUploadSummaryOpen] = useState(false);
  const [uploadSummaryData, setUploadSummaryData] = useState<IUploadPurchaseOrdersData | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateOrdersSelected = (): boolean => {
    if (ordersId.length === 0) {
      message.error(t("noOrdersSelected"));
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
        } else return showMessage("error", t("csvDownloadError"));
      }
      createAndDownloadTxt(res.data);
      if (res.message == "") {
        showMessage("success", t("downloadSuccess"));
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

  const handleDownloadCSVOCFormat = async (downloadAllClient = false) => {
    if (!validateOrdersSelected()) return;
    try {
      const res = await dowloadOrderCSVOCFormat(ordersId, downloadAllClient);
      if (!res || !res.data) {
        if (res?.message) {
          return showMessage("error", res.message);
        } else return showMessage("error", t("csvDownloadError"));
      }
      createAndDownloadTxt(res.data);
      if (res.message == "") {
        showMessage(
          "success",
          downloadAllClient ? t("downloadAllClientSuccess") : t("downloadSuccess")
        );
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

  const handleDownloadCSVOCFormatShowQuestion = () => {
    if (!validateOrdersSelected()) return;
    setIsOcFormatModalOpen(true);
  };

  const handleConfirmOcFormat = async (downloadAllClient: boolean) => {
    setIsOcFormatLoading(true);
    try {
      await handleDownloadCSVOCFormat(downloadAllClient);
    } finally {
      setIsOcFormatLoading(false);
      setIsOcFormatModalOpen(false);
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
      content: t("downloadingBillingReport"),
      duration: 0
    });
    try {
      const res = await downloadBillingReportExcel(projectId);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", t("downloadSuccess"));
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : t("fileDownloadError"));
      console.error(error);
    } finally {
      hide();
      setIsBillingReportLoading(false);
    }
  };

  const handleOpenBillingDetailModal = () => {
    setIsBillingDetailModalOpen(true);
  };

  const handleDownloadBillingDetail = async (startDate: string, endDate: string) => {
    setIsBillingDetailLoading(true);
    const hide = message.open({
      type: "loading",
      content: t("downloadingBillingDetail"),
      duration: 0
    });
    try {
      const res = await downloadBillingDetailExcel(projectId, startDate, endDate);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", t("downloadSuccess"));
      setIsBillingDetailModalOpen(false);
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : t("fileDownloadError"));
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
      content: t("downloadingSalesReport"),
      duration: 0
    });
    try {
      const res = await downloadSalesDetailExcel(projectId);
      downloadFileFromUrl(res.url, res.filename);
      showMessage("success", t("downloadSuccess"));
      onClose();
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : t("fileDownloadError"));
      console.error(error);
    } finally {
      hide();
      setIsSalesDetailLoading(false);
    }
  };

  const handleDownloadCsvPartial = async (createBackorder: boolean) => {
    if (!validateOrdersSelected()) return;
    try {
      const res = await downloadPartialOrderCSV(ordersId, createBackorder);
      if (!res?.data) {
        return showMessage("error", res?.message || t("partialCsvError"));
      }
      const { txtContent, createdBackorderIds, failedOrders } = res.data;
      if (txtContent) {
        createAndDownloadTxt(txtContent);
      }
      if (createdBackorderIds?.length) {
        showMessage(
          "success",
          t("backordersCreated", {
            count: createdBackorderIds.length,
            ids: createdBackorderIds.join(", ")
          })
        );
      } else {
        showMessage("success", res.message || t("downloadSuccess"));
      }
      if (failedOrders?.length) {
        setErrorMessage(t("failedOrders", { ids: failedOrders.join(", ") }));
        setIsErrorModalOpen(true);
      }
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error: any) {
      showMessage("error", error?.message || t("partialCsvError"));
      console.error(error);
    }
  };

  const handleDownloadPartialCsvShowQuestion = () => {
    if (!validateOrdersSelected()) return;
    setIsPartialCsvModalOpen(true);
  };

  const handleConfirmPartialCsv = async () => {
    setIsPartialCsvLoading(true);
    try {
      await handleDownloadCsvPartial(true);
    } finally {
      setIsPartialCsvLoading(false);
      setIsPartialCsvModalOpen(false);
    }
  };

  const handleReturnToSeller = async () => {
    if (!validateOrdersSelected()) return;
    try {
      await changeStatusOrder(ordersId[0]);
      showMessage("success", t("statusChanged"));
      setFetchMutate();
      setSelectedRows([]);
      setSelectedRowKeys([]);
      onClose();
    } catch (error: any) {
      showMessage("error", error?.message || t("statusChangeError"));
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
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isXlsx) {
      showMessage("error", t("onlyXlsx"));
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
        const errorMessage = error instanceof Error ? error.message : t("purchaseOrdersError");
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
        open={isOpen && !isPartialCsvModalOpen && !isOcFormatModalOpen && !isBillingDetailModalOpen}
        title={
          <Title className="ordersGenerateActionModal__title" level={4}>
            {t("title")}
          </Title>
        }
        footer={null}
        onCancel={onClose}
      >
        <p className="ordersGenerateActionModal__description">{t("description")}</p>
        <div className="ordersGenerateActionModal__selectedOrders">
          <Text strong>{t("selectedCount", { count: selectedCount })} </Text>
          <Text>{operationNumbersText}</Text>
        </div>
        {draftsCount > 0 && (
          <div className="ordersGenerateActionModal__selectedOrders">
            <Text strong>{t("selectedDrafts")} </Text>
            <Text>{draftOperationNumbersText}</Text>
          </div>
        )}
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={handleChangeOrderState}
            icon={<NewspaperClipping size={16} />}
            title={t("actions.moveToBilled")}
          />
          <ButtonGenerateAction
            onClick={handleDownloadCSV}
            icon={<DownloadSimple size={16} />}
            title={t("actions.downloadCsv")}
          />
          <ButtonGenerateAction
            onClick={handleDownloadBillingReport}
            icon={<DownloadSimple size={16} />}
            title={t("actions.downloadBillingReport")}
            disabled={isBillingReportLoading}
          />
          <ButtonGenerateAction
            onClick={handleOpenBillingDetailModal}
            icon={<DownloadSimple size={16} />}
            title={t("actions.downloadBillingDetail")}
            disabled={isBillingDetailLoading}
          />
          <ButtonGenerateAction
            onClick={handleDownloadSalesDetail}
            icon={<DownloadSimple size={16} />}
            title={t("actions.downloadSalesReport")}
            disabled={isSalesDetailLoading}
          />
          <ButtonGenerateAction
            onClick={handleDownloadPartialCsvShowQuestion}
            icon={<DownloadSimple size={16} />}
            title={t("actions.partialCsv")}
          />
          <ButtonGenerateAction
            onClick={handleDownloadCSVOCFormatShowQuestion}
            icon={<DownloadSimple size={16} />}
            title={t("actions.downloadPoFormatCsv")}
          />
          <ButtonGenerateAction
            onClick={handleDeleteRows}
            icon={<Trash size={16} />}
            title={tCommon("actions.delete")}
          />
          <ButtonGenerateAction
            onClick={handleSendInvite}
            icon={<EnvelopeSimple size={16} />}
            title={t("actions.sendInvite")}
          />
          <ButtonGenerateAction
            onClick={handleReturnToSeller}
            icon={<ArrowULeftDown size={16} />}
            title={t("actions.returnToSeller")}
            disabled={ordersId.length !== 1}
          />
          <ButtonGenerateAction
            onClick={handleOpenUploadPurchaseOrders}
            icon={<FileArrowUp size={16} />}
            title={t("actions.uploadPurchaseOrder")}
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
        title={<Title level={4}>{t("billingFileTitle")}</Title>}
      >
        <Flex vertical gap={12}>
          <Text>{t("ordersWithoutStock")}</Text>
          <Text strong>{errorMessage}</Text>
        </Flex>
      </Modal>

      <ModalConfirmAction
        isOpen={isPartialCsvModalOpen}
        onClose={() => setIsPartialCsvModalOpen(false)}
        onOk={handleConfirmPartialCsv}
        title={t("splitOrderConfirm")}
        content={t("splitOrderContent")}
        okText={tCommon("status.yes")}
        cancelText={tCommon("status.no")}
        okLoading={isPartialCsvLoading}
      />

      <ModalConfirmAction
        isOpen={isOcFormatModalOpen}
        onClose={() => setIsOcFormatModalOpen(false)}
        onOk={() => handleConfirmOcFormat(false)}
        onCancel={() => handleConfirmOcFormat(true)}
        title={t("poFormat.title")}
        content={
          <Flex vertical gap={8}>
            <Text>{t("poFormat.question")}</Text>
            <Text type="secondary">
              {t.rich("poFormat.client", {
                name: clientName,
                strong: (chunks) => <Text strong>{chunks}</Text>
              })}
            </Text>
            <Text type="secondary">
              {t.rich("poFormat.status", {
                status: statusName,
                strong: (chunks) => <Text strong>{chunks}</Text>
              })}
            </Text>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>
                {t.rich("poFormat.onlySelectedHelp", {
                  count: selectedCount,
                  b: (chunks) => <b>{chunks}</b>
                })}
              </li>
              <li>{t.rich("poFormat.allClientHelp", { b: (chunks) => <b>{chunks}</b> })}</li>
            </ul>
          </Flex>
        }
        okText={t("poFormat.onlySelected")}
        cancelText={t("poFormat.allClient")}
        okLoading={isOcFormatLoading}
        cancelLoading={isOcFormatLoading}
      />

      <ModalDownloadBillingExcel
        isOpen={isBillingDetailModalOpen}
        onClose={() => setIsBillingDetailModalOpen(false)}
        onDownload={handleDownloadBillingDetail}
        isLoading={isBillingDetailLoading}
      />

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
