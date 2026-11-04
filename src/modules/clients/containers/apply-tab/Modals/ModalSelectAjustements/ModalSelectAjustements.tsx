import React from "react";
import { Modal } from "antd";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("clients.applyTab.selectAdjustmentModal");
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
          icon={<Globe size={20} />}
          title={t("global")}
          onClick={() => {
            setModalAction(2, "global");
          }}
        />
        <ButtonGenerateAction
          icon={<NewspaperClipping size={20} />}
          title={t("byInvoice")}
          onClick={() => {
            setModalAction(4, "byInvoice");
          }}
        />
      </div>
    </Modal>
  );
};
