"use client";
import { message, Modal } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";

import "./modalBalanceLegalization.scss";

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
}

const ModalBalanceLegalization = ({ isOpen, onClose }: Props) => {
  const closeModal = () => {
    onClose();
  };

  return (
    <Modal
      className="modalBalanceLegalization"
      width={"70%"}
      footer={null}
      open={isOpen}
      onCancel={closeModal}
      destroyOnClose
    >
      <h3 className="modalBalanceLegalization__title">Legalización de Saldos</h3>
      <p className="modalBalanceLegalization__description">
        Selecciona la Nota credito´generada para la Legalización del saldo.
      </p>

      <FooterButtons
        className="modalAuditRequirements__footerButtons"
        onClose={() => onClose(true)}
        handleOk={() => {
          message.success("Funcionalidad en desarrollo");
        }}
        isConfirmLoading={false}
      />
    </Modal>
  );
};

export default ModalBalanceLegalization;
