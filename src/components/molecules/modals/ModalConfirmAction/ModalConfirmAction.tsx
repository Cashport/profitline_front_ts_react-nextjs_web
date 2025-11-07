import React from "react";
import { Modal } from "antd";

import "./modalConfirmAction.scss";

interface Props {
  isOpen: boolean;
  onClose: (cancelClicked?: boolean) => void;
  onOk?: () => void;
  title: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okLoading?: boolean;
  cancelLoading?: boolean;
}
export const ModalConfirmAction = ({
  isOpen,
  onClose,
  onOk,
  title,
  content,
  okText = "Aceptar",
  cancelText = "Cancelar",
  okLoading,
  cancelLoading
}: Props) => {
  // Handler para cerrar con X o clic fuera (cancelClicked = false)
  const handleClose = () => {
    onClose(false);
  };

  // Handler para cerrar con botón Cancelar (cancelClicked = true)
  const handleCancel = () => {
    onClose(true);
  };

  return (
    <Modal
      className="ModalConfirmAction"
      width={"50%"}
      open={isOpen}
      onCancel={handleClose}
      okButtonProps={{ className: "acceptButton", loading: okLoading }}
      okText={okText}
      cancelButtonProps={{
        className: "cancelButton",
        onClick: handleCancel,
        loading: cancelLoading
      }}
      cancelText={cancelText}
      title={title}
      onOk={onOk}
    >
      {content}
    </Modal>
  );
};
