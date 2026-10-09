import React from "react";
import { Modal } from "antd";
import "./modalConfirmAction.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  title: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  okLoading?: boolean;
  cancelLoading?: boolean;
  hideOkButton?: boolean;
}

export const ModalConfirmAction = ({
  isOpen,
  onClose,
  onOk,
  onCancel,
  title,
  content,
  okText = "Aceptar",
  cancelText = "Cancelar",
  okLoading,
  cancelLoading,
  hideOkButton
}: Props) => {
  return (
    <Modal
      className="ModalConfirmAction"
      open={isOpen}
      onCancel={onClose}
      okButtonProps={{
        className: "acceptButton",
        loading: okLoading,
        style: hideOkButton ? { display: "none" } : undefined
      }}
      okText={okText}
      cancelButtonProps={{
        className: !hideOkButton ? "cancelButton" : "acceptButton",
        onClick: onCancel ? onCancel : onClose,
        loading: cancelLoading,
        style: hideOkButton ? { gridColumn: "1 / span 2" } : undefined
      }}
      cancelText={cancelText}
      title={title}
      onOk={onOk}
    >
      {content}
    </Modal>
  );
};
