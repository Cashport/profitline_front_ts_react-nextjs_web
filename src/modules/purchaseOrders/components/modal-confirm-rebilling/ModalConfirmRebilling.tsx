import { useState } from "react";
import { Input, message, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";
import type { UploadFile } from "antd";
import { UploadChangeParam } from "antd/es/upload";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import { confirmPurchaseOrderRebilling } from "@/services/purchaseOrders/purchaseOrders";

import "./modalConfirmRebilling.scss";

const { Title, Text } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderDetailId: string;
  onSuccess?: () => void;
}

export const ModalConfirmRebilling = ({
  isOpen,
  onClose,
  purchaseOrderDetailId,
  onSuccess
}: Props) => {
  const t = useTranslations("purchaseOrders.rebillingModal");
  const tCommon = useTranslations("common");
  const [invoiceId, setInvoiceId] = useState("");
  const [creditNoteFile, setCreditNoteFile] = useState<File | undefined>();
  const [newInvoiceFile, setNewInvoiceFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setInvoiceId("");
    setCreditNoteFile(undefined);
    setNewInvoiceFile(undefined);
  };

  const handleClose = () => {
    if (isLoading) return;
    resetState();
    onClose();
  };

  const extractFile = (info: UploadChangeParam<UploadFile<any>>): File | undefined => {
    const raw = info.file as unknown as File & { originFileObj?: File };
    return raw?.originFileObj ?? raw;
  };

  const handleChange =
    (setter: (file: File | undefined) => void) => (info: UploadChangeParam<UploadFile<any>>) => {
      const file = extractFile(info);
      if (!file) return;
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        message.error(t("fileTooLarge", { maxMb: 30 }));
        return;
      }
      setter(file);
    };

  const handleDelete =
    (setter: (file: File | undefined) => void) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setter(undefined);
    };

  const handleSubmit = async () => {
    const cleanedInvoiceId = invoiceId.trim();
    if (!cleanedInvoiceId || !creditNoteFile || !newInvoiceFile) return;
    setIsLoading(true);
    try {
      await confirmPurchaseOrderRebilling(
        purchaseOrderDetailId,
        cleanedInvoiceId,
        creditNoteFile,
        newInvoiceFile
      );
      message.success(t("success"));
      onSuccess?.();
      resetState();
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>{t("title")}</Title>}
      className="modalConfirmRebilling"
      width={600}
      footer={
        <FooterButtons
          titleConfirm={tCommon("actions.save")}
          titleCancel={tCommon("actions.cancel")}
          onClose={handleClose}
          handleOk={handleSubmit}
          isConfirmDisabled={!invoiceId.trim() || !creditNoteFile || !newInvoiceFile}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <div className="fileRow">
        <Text className="label">{t("invoiceId")}</Text>
        <div className="invoiceInputWrapper">
          <Input
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder={t("invoiceIdPlaceholder")}
            maxLength={50}
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="fileRow mt-[-16px]">
        <Text className="label">{t("newInvoice")}</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title={t("newInvoice")}
            fileName={newInvoiceFile?.name}
            fileSize={newInvoiceFile?.size}
            handleOnChange={handleChange(setNewInvoiceFile)}
            handleOnDelete={handleDelete(setNewInvoiceFile)}
          />
        </div>
      </div>
      <div className="fileRow">
        <Text className="label">{t("creditNote")}</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title={t("creditNote")}
            fileName={creditNoteFile?.name}
            fileSize={creditNoteFile?.size}
            handleOnChange={handleChange(setCreditNoteFile)}
            handleOnDelete={handleDelete(setCreditNoteFile)}
          />
        </div>
      </div>
    </Modal>
  );
};
