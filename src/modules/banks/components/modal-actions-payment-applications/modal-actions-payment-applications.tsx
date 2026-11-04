"use client";
import { Flex, message, Modal } from "antd";
import { FileArrowDown } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { downloadPaymentsPlane } from "@/services/banksPayments/banksPayments";
import { IPaymentApplication } from "@/types/paymentApplications/IPaymentApplication";

import "./modal-actions-payment-applications.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: IPaymentApplication[] | undefined;
}

const ModalActionsPaymentApplications = ({ isOpen, onClose, selectedRows }: Props) => {
  const t = useTranslations("banks.paymentApplicationsActions");
  const tActions = useTranslations("banks.actionsModal");
  const handleDownloadLayout = async () => {
    if (!selectedRows?.length) {
      message.warning(t("selectAtLeastOne"));
      return;
    }

    // Flatten payment_ids across every selected application (dedupe defensively)
    const paymentIds = [...new Set(selectedRows.flatMap((row) => row.payment_ids ?? []))];
    if (!paymentIds.length) {
      message.warning(t("noPayments"));
      return;
    }

    const hideLoading = message.loading(t("downloading"), 0);
    try {
      const res = await downloadPaymentsPlane(paymentIds);
      window.open(res.url, "_blank");
      message.success(t("downloadSuccess"));
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("downloadError"));
    } finally {
      hideLoading();
    }
  };

  return (
    <Modal
      className="modalActionsPaymentApplications"
      width={686}
      open={isOpen}
      title={null}
      footer={null}
      onCancel={onClose}
    >
      <p className="modalActionsPaymentApplications__description">{tActions("selectAction")}</p>
      <Flex vertical gap="0.75rem">
        <ButtonGenerateAction
          onClick={handleDownloadLayout}
          icon={<FileArrowDown size={16} />}
          title={t("downloadLayout")}
        />
      </Flex>
    </Modal>
  );
};

export default ModalActionsPaymentApplications;
