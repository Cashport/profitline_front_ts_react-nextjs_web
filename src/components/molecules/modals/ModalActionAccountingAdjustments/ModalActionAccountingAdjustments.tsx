import React from "react";
import { Modal } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { HandTap } from "@phosphor-icons/react";
import "./modalActionAccountingAdjustments.scss";

type ModalActionPaymentProps = {
  isOpen: boolean;
  onClose: () => void;
  addAdjustmentsToApplicationTable: () => void;
};

export const ModalActionAccountingAdjustments: React.FC<ModalActionPaymentProps> = ({
  isOpen,
  onClose,
  addAdjustmentsToApplicationTable
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Selecciona la acción que vas a realizar"
      footer={null}
      onCancel={onClose}
      className="modal-action-payment"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<HandTap size={20} />}
          title="Aplicar ajustes contables"
          onClick={() => {
            addAdjustmentsToApplicationTable();
          }}
        />
      </div>
    </Modal>
  );
};
