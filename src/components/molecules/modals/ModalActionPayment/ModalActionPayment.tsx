import React, { Dispatch, SetStateAction } from "react";
import { message, Modal } from "antd";
import { MagnifyingGlassPlus, HandTap, PushPin, QuestionMark } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { IClientPayment } from "@/types/clientPayments/IClientPayments";

import "./modalActionPayment.scss";

type ModalActionPaymentProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onChangeTab: (activeKey: string) => void;
  setIsSelectedActionModalOpen: Dispatch<
    SetStateAction<{
      selected: number;
    }>
  >;
  setIsModalActionPaymentOpen: Dispatch<SetStateAction<boolean>>;
  addPaymentsToApplicationTable: () => void;
  selectedPayments: IClientPayment[];
};

export const ModalActionPayment: React.FC<ModalActionPaymentProps> = ({
  isOpen,
  onClose,
  onChangeTab,
  setIsSelectedActionModalOpen,
  setIsModalActionPaymentOpen,
  addPaymentsToApplicationTable,
  selectedPayments
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
          icon={<MagnifyingGlassPlus size={20} />}
          title="Identificar pago"
          onClick={() => {
            setIsModalActionPaymentOpen((prev) => !prev);
            setIsSelectedActionModalOpen({
              selected: 1
            });
          }}
        />
        <ButtonGenerateAction
          icon={<HandTap size={20} />}
          title="Aplicar pagos"
          onClick={() => {
            // onChangeTab("5");
            if (selectedPayments.length === 0) {
              message.info("No hay pagos seleccionados para aplicar.");
              return;
            }
            addPaymentsToApplicationTable();
          }}
        />
        <ButtonGenerateAction
          icon={<PushPin size={20} />}
          title="Cambiar de estado"
          onClick={() => {
            console.log("Cambiar de estado clicked");
          }}
        />
        <ButtonGenerateAction
          icon={<QuestionMark size={20} />}
          title="Marcar como no identificado"
          onClick={() => {
            if (selectedPayments.length === 0) {
              message.info("No hay pagos seleccionados para marcar como no identificados.");
              return;
            }
            setIsSelectedActionModalOpen({
              selected: 2
            });
            setIsModalActionPaymentOpen((prev) => !prev);
          }}
        />
      </div>
    </Modal>
  );
};
