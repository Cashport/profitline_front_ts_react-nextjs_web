"use client";
import { Flex, Modal } from "antd";
import { FileArrowDown } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./modal-actions-wallet-payments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ModalActionsWalletPayments = ({ isOpen, onClose }: Props) => {
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
        <ButtonGenerateAction icon={<FileArrowDown size={16} />} title="Descargar plano" />
      </Flex>
    </Modal>
  );
};

export default ModalActionsWalletPayments;
