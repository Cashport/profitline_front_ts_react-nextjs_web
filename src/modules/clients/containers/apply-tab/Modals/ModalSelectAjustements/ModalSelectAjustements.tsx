import React from "react";
import { Modal } from "antd";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import "./modalSelectAjustements.scss";
import { Globe, NewspaperClipping } from "phosphor-react";

type ModalSelectAjustementsProps = {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setModalAction: (modalAction: number, adjustmentType: "global" | "byInvoice") => void;
};

export const ModalSelectAjustements: React.FC<ModalSelectAjustementsProps> = ({
  isOpen,
  onClose,
  setModalAction
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Selecciona el tipo de aplicación del ajuste"
      footer={null}
      onCancel={onClose}
      className="modal-action-payment"
      centered
    >
      <div className="modal-content">
        <ButtonGenerateAction
          icon={<Globe size={20} />}
          title="Global"
          onClick={() => {
            setModalAction(2, "global");
          }}
        />
        <ButtonGenerateAction
          icon={<NewspaperClipping size={20} />}
          title="Por factura"
          onClick={() => {
            setModalAction(4, "byInvoice");
          }}
        />
      </div>
    </Modal>
  );
};
