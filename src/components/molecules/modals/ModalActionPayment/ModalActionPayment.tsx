import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { MagnifyingGlassPlus, HandTap, PushPin } from "@phosphor-icons/react";
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
  addPaymentssToApplicationTable: () => void;
};

export const ModalActionPayment: React.FC<ModalActionPaymentProps> = ({
  isOpen,
  onClose,
  onChangeTab,
  setIsSelectedActionModalOpen,
  setIsModalActionPaymentOpen,
  addPaymentssToApplicationTable
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
            console.log("Aplicar pagos clicked");

            // onChangeTab("5");
            addPaymentssToApplicationTable();
          }}
        />
        <ButtonGenerateAction
          icon={<PushPin size={20} />}
          title="Cambiar de estado"
          onClick={() => {
            console.log("Cambiar de estado clicked");
          }}
        />
      </div>
    </Modal>
  );
};
