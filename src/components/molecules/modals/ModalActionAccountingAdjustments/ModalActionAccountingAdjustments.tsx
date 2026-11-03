import React from "react";
import { message, Modal } from "antd";
import { HandTap, Invoice } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("modals.actionAccountingAdjustments");
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("title")}
      footer={null}
      onCancel={onClose}
      className="modal-action-payment"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<HandTap size={20} />}
          title={t("apply")}
          onClick={() => {
            if (!selectedRows || selectedRows.length === 0) {
              message.error(t("selectAtLeastOne"));
              return;
            }
            addAdjustmentsToApplicationTable();
          }}
        />
        <ButtonGenerateAction
          icon={<Invoice size={16} />}
          title={t("settleDeduction")}
          onClick={balanceLegalization}
        />
      </div>
    </Modal>
  );
};
