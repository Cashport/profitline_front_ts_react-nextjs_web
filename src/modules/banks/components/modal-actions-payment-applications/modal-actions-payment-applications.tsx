"use client";
import { Flex, message, Modal } from "antd";
import { FileArrowDown } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { downloadPaymentsPlane } from "@/services/banksPayments/banksPayments";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";

import "./modal-actions-payment-applications.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: IPaymentApplication[] | undefined;
}

const ModalActionsPaymentApplications = ({ isOpen, onClose, selectedRows }: Props) => {
  const handleDownloadLayout = async () => {
    if (!selectedRows?.length) {
      message.warning("Selecciona al menos una aplicación de pago");
      return;
    }

    // Flatten payment_ids across every selected application (dedupe defensively)
    const paymentIds = [...new Set(selectedRows.flatMap((row) => row.payment_ids ?? []))];
    if (!paymentIds.length) {
      message.warning("Las aplicaciones seleccionadas no tienen pagos asociados");
      return;
    }

    const hideLoading = message.loading("Descargando plano...", 0);
    try {
      const res = await downloadPaymentsPlane(paymentIds);
      window.open(res.url, "_blank");
      message.success("Plano descargado correctamente");
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al descargar el plano");
    } finally {
      hideLoading();
    }
  };

  return (
    <Modal
      className="modalActionsPaymentApplications"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsPaymentApplications__description">
        Selecciona la acción que vas a realizar
      </p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={handleDownloadLayout}
          icon={<FileArrowDown size={16} />}
          title="Descargar layout"
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsPaymentApplications;
