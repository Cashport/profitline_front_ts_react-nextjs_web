"use client";
import { Flex, Modal } from "antd";
import { useTranslations } from "use-intl";
import {
  PencilLine,
  User,
  CheckCircle,
  CirclesFour,
  FileArrowUp,
  ArrowsClockwise,
  ArrowDownLeft,
  CalendarBlank
} from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import "./modal-actions-banks-payments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  setSelectOpen: (args: { selected: number }) => void;
}

const ModalActionsBanksPayments = ({ isOpen, onClose, setSelectOpen }: Props) => {
  const t = useTranslations("banks.actionsModal");
  const handleOpenModal = (type: number) => {
    setSelectOpen({
      selected: type
    });
  };
  return (
    <Modal
      className="modalActionsBanksPayments"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsBanksPayments__description">{t("selectAction")}</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={() => {
            handleOpenModal(1);
          }}
          icon={<PencilLine size={16} />}
          title={t("editCustomer")}
        />
        <ButtonGenerateAction
          icon={<User size={16} />}
          title={t("assignCustomer")}
          onClick={() => {
            handleOpenModal(2);
          }}
        />
        <ButtonGenerateAction
          icon={<CheckCircle size={16} />}
          title={t("approveAssignment")}
          onClick={() => {
            handleOpenModal(3);
          }}
        />
        <ButtonGenerateAction
          icon={<CirclesFour size={16} />}
          title={t("splitPayment")}
          onClick={() => {
            handleOpenModal(4);
          }}
        />
        <ButtonGenerateAction
          icon={<FileArrowUp size={16} />}
          title={t("uploadSlip")}
          onClick={() => {
            handleOpenModal(5);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title={t("changeStatus")}
          onClick={() => {
            handleOpenModal(6);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={16} />}
          title={t("changeErpId")}
          onClick={() => {
            handleOpenModal(9);
          }}
        />
        <ButtonGenerateAction
          icon={<CalendarBlank size={16} />}
          title={t("changePeriod")}
          onClick={() => {
            handleOpenModal(10);
          }}
        />
        <ButtonGenerateAction
          icon={<ArrowDownLeft size={20} />}
          title={t("markUnidentified")}
          onClick={() => {
            handleOpenModal(8);
          }}
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsBanksPayments;
