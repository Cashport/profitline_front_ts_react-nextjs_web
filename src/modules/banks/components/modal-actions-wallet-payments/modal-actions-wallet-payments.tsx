"use client";
import { Flex, message, Modal } from "antd";
import { FileArrowDown } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { downloadPaymentsPlane } from "@/services/banksPayments/banksPayments";
import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-wallet-payments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: ISingleBank[] | undefined;
}

const ModalActionsWalletPayments = ({ isOpen, onClose, selectedRows }: Props) => {
  const handleDowloadPlane = async () => {
    if (!selectedRows?.length) {
      message.warning("Selecciona al menos un pago");
      return;
    }

    const paymentIds = selectedRows.map((row) => row.id);
    const hideLoading = message.loading("Descargando plano...", 0);
    try {
      const blob = await downloadPaymentsPlane(paymentIds);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `plano_atemco_${Date.now()}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

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
      className="modalActionsWalletPayments"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsWalletPayments__description">
        Selecciona la acción que vas a realizar
      </p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={handleDowloadPlane}
          icon={<FileArrowDown size={16} />}
          title="Descargar plano"
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsWalletPayments;
