import React, { useState } from "react";
import { Modal } from "antd";
import { ArrowsClockwise } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalChangeBalanceStatus } from "../ModalChangeBalanceStatus/ModalChangeBalanceStatus";

import "@/components/molecules/modals/ModalActionAccountingAdjustments/modalActionAccountingAdjustments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balanceIds: number[];
  onSuccess: () => void;
}

export const ModalBalancesActions: React.FC<Props> = ({
  isOpen,
  onClose,
  balanceIds,
  onSuccess
}) => {
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);

  return (
    <>
      <Modal
        open={isOpen}
        title="Selecciona la acción que vas a realizar"
        footer={null}
        onCancel={onClose}
        className="modal-action-payment"
        centered
      >
        <div className="modal-content">
          <ButtonGenerateAction
            icon={<ArrowsClockwise size={20} />}
            title="Cambiar estado"
            onClick={() => {
              setIsChangeStatusOpen(true);
              onClose();
            }}
          />
        </div>
      </Modal>

      <ModalChangeBalanceStatus
        isOpen={isChangeStatusOpen}
        onClose={() => setIsChangeStatusOpen(false)}
        balanceIds={balanceIds}
        onSuccess={() => {
          onSuccess();
          setIsChangeStatusOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default ModalBalancesActions;
