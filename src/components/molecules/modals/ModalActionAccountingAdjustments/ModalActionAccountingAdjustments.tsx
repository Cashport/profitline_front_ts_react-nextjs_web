import React from "react";
import { message, Modal } from "antd";
import { HandTap, Invoice } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import "./modalActionAccountingAdjustments.scss";

type ModalActionPaymentProps = {
  isOpen: boolean;
  onClose: () => void;
  addAdjustmentsToApplicationTable: () => void;
  balanceLegalization?: () => void;
  // eslint-disable-next-line no-unused-vars
  handleOpenModal: (selected: number) => void;
  selectedRows?: FinancialDiscount[];
};

export const ModalActionAccountingAdjustments: React.FC<ModalActionPaymentProps> = ({
  isOpen,
  onClose,
  addAdjustmentsToApplicationTable,
  balanceLegalization,
  selectedRows
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
            if (!selectedRows || selectedRows.length === 0) {
              message.error("Debes seleccionar al menos un ajuste contable para aplicar");
              return;
            }
            addAdjustmentsToApplicationTable();
          }}
        />
        <ButtonGenerateAction
          icon={<Invoice size={16} />}
          title="Legalizar saldo"
          onClick={balanceLegalization}
        />
      </div>
    </Modal>
  );
};
