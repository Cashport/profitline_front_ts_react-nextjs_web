import React, { Dispatch, SetStateAction } from "react";
import { message, Modal } from "antd";
import { MagnifyingGlassPlus, HandTap, PushPin, ArrowDownLeft } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { IClientPayment } from "@/types/clientPayments/IClientPayments";

import "./modalActionPayment.scss";

type ModalActionPaymentProps = {
  isOpen: boolean;
  onClose: () => void;
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
  onChangeTab: _onChangeTab,
  setIsSelectedActionModalOpen,
  setIsModalActionPaymentOpen,
  addPaymentsToApplicationTable,
  selectedPayments
}) => {
  const t = useTranslations("modals.actionPayment");
  const isApplyDisabled =
    selectedPayments.length === 0 || selectedPayments.some((p) => p.payments_status_id !== 1);

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
          icon={<MagnifyingGlassPlus size={20} />}
          title={t("identify")}
          onClick={() => {
            setIsModalActionPaymentOpen((prev) => !prev);
            setIsSelectedActionModalOpen({
              selected: 1
            });
          }}
        />
        <ButtonGenerateAction
          icon={<HandTap size={20} />}
          title={t("apply")}
          onClick={() => {
            // onChangeTab("5");
            if (selectedPayments.length === 0) {
              message.info(t("noneToApply"));
              return;
            }
            addPaymentsToApplicationTable();
          }}
          disabled={isApplyDisabled}
        />
        <ButtonGenerateAction
          icon={<PushPin size={20} />}
          title={t("changeStatus")}
          onClick={() => {
            console.log("Cambiar de estado clicked");
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowDownLeft size={20} />}
          title={t("notCustomerPayment")}
          onClick={() => {
            if (selectedPayments.length === 0) {
              message.info(t("noneToUnidentify"));
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
