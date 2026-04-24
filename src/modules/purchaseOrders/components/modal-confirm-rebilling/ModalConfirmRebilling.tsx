import { useState } from "react";
import { message, Modal, Typography } from "antd";
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
  const [creditNoteFile, setCreditNoteFile] = useState<File | undefined>();
  const [newInvoiceFile, setNewInvoiceFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
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
        message.error(
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
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
    if (!creditNoteFile || !newInvoiceFile) return;
    setIsLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Confirmando refacturación...",
      duration: 0
    });
    try {
      await confirmPurchaseOrderRebilling(purchaseOrderDetailId, creditNoteFile, newInvoiceFile);
      message.success("Refacturación confirmada exitosamente.");
      onSuccess?.();
      resetState();
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al confirmar la refacturación. Por favor, inténtalo de nuevo."
      );
    } finally {
      hide();
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>Confirmar refacturación</Title>}
      className="modalConfirmRebilling"
      width={600}
      footer={
        <FooterButtons
          titleConfirm="Guardar"
          titleCancel="Cancelar"
          onClose={handleClose}
          handleOk={handleSubmit}
          isConfirmDisabled={!creditNoteFile || !newInvoiceFile}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <div className="fileRow">
        <Text className="label">Nota crédito</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title="Nota crédito"
            fileName={creditNoteFile?.name}
            fileSize={creditNoteFile?.size}
            handleOnChange={handleChange(setCreditNoteFile)}
            handleOnDelete={handleDelete(setCreditNoteFile)}
          />
        </div>
      </div>
      <div className="fileRow">
        <Text className="label">Nueva factura</Text>
        <div className="documentButtonWrapper">
          <DocumentButton
            title="Nueva factura"
            fileName={newInvoiceFile?.name}
            fileSize={newInvoiceFile?.size}
            handleOnChange={handleChange(setNewInvoiceFile)}
            handleOnDelete={handleDelete(setNewInvoiceFile)}
          />
        </div>
      </div>
    </Modal>
  );
};
