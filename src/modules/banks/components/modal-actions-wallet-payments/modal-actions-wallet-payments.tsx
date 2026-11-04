"use client";
import { useState } from "react";
import { Flex, message, Modal } from "antd";
import { ArrowsClockwise, CheckCircle, FileArrowDown } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ModalActionsConfirmCompensation from "../modal-actions-confirm-compensation";
import ModalActionsChangeErpId from "../modal-actions-change-erp-id";
import { useAppStore } from "@/lib/store/store";
import {
  approvePayment,
  changeStatusUploadERP,
  downloadPaymentsPlane
} from "@/services/banksPayments/banksPayments";
import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-wallet-payments.scss";

const IDENTIFICADO_STATUS_ID = 1;
const CARGADO_ERP_STATUS_ID = 20;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRows: ISingleBank[] | undefined;
  onSuccess?: () => void;
}

const ModalActionsWalletPayments = ({ isOpen, onClose, selectedRows, onSuccess }: Props) => {
  const t = useTranslations("banks.walletActions");
  const tApps = useTranslations("banks.paymentApplicationsActions");
  const tShared = useTranslations("banks.shared");
  const tActions = useTranslations("banks.actionsModal");
  const tCommon = useTranslations("common");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCompensationOpen, setIsCompensationOpen] = useState(false);
  const [isChangeErpIdOpen, setIsChangeErpIdOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { ID } = useAppStore((state) => state.selectedProject);

  const handleDowloadPlane = async () => {
    if (!selectedRows?.length) {
      message.warning(tShared("selectAtLeastOnePayment"));
      return;
    }

    const paymentIds = selectedRows.map((row) => row.id);
    const hideLoading = message.loading(tApps("downloading"), 0);
    try {
      const res = await downloadPaymentsPlane(paymentIds);
      window.open(res.url, "_blank");
      message.success(tApps("downloadSuccess"));
      onClose();
      const allIdentificado = selectedRows.every((row) => row.id_status === IDENTIFICADO_STATUS_ID);
      if (allIdentificado) {
        setIsConfirmOpen(true);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : tApps("downloadError"));
    } finally {
      hideLoading();
    }
  };

  const handleApproveAssignmentOpen = () => {
    if (!selectedRows?.length) {
      message.warning(tShared("selectAtLeastOnePayment"));
      return;
    }

    if (selectedRows.length > 1) {
      const clientId = selectedRows[0].id_client;
      if (!selectedRows.every((row) => row.id_client === clientId)) {
        message.info(tShared("sameCustomerOnly"));
        return;
      }
    }

    onClose();
    setIsApproveOpen(true);
  };

  const handleApproveAssignment = async () => {
    if (!selectedRows?.length) return;

    setIsApproving(true);
    try {
      await approvePayment({
        payments: selectedRows.map((row) => row.id),
        project_id: ID,
        client_id: selectedRows[0].id_client || ""
      });

      message.success(tShared("approveSuccess"));
      setIsApproveOpen(false);
      onSuccess?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : tShared("approveError"));
    } finally {
      setIsApproving(false);
    }
  };

  const handleConfirmErpUpload = () => {
    if (!selectedRows?.length) {
      message.warning(tShared("selectAtLeastOnePayment"));
      return;
    }

    const allIdentificado = selectedRows.every((row) => row.id_status === IDENTIFICADO_STATUS_ID);
    if (!allIdentificado) {
      message.warning(t("mustBeIdentified"));
      return;
    }

    onClose();
    setIsConfirmOpen(true);
  };

  const handleConfirmErp = async () => {
    if (!selectedRows?.length) return;

    setIsConfirming(true);
    try {
      await changeStatusUploadERP(selectedRows.map((row) => row.id));
      message.success(t("erpUploadSuccess"));
      setIsConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("erpUploadError"));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmCompensation = () => {
    if (selectedRows?.length !== 1) {
      message.warning(t("selectExactlyOne"));
      return;
    }

    if (selectedRows[0].id_status !== CARGADO_ERP_STATUS_ID) {
      message.warning(t("mustBeUploadedToErp"));
      return;
    }

    onClose();
    setIsCompensationOpen(true);
  };

  const handleChangeErpIdOpen = () => {
    if (selectedRows?.length !== 1) {
      message.warning(t("selectExactlyOne"));
      return;
    }

    onClose();
    setIsChangeErpIdOpen(true);
  };

  return (
    <>
      <Modal
        className="modalActionsWalletPayments"
        width={686}
        open={isOpen}
        title={null}
        footer={null}
        onCancel={onClose}
      >
        <p className="modalActionsWalletPayments__description">{tActions("selectAction")}</p>
        <Flex vertical gap="0.75rem">
          <ButtonGenerateAction
            onClick={handleDowloadPlane}
            icon={<FileArrowDown size={16} />}
            title={tApps("downloadLayout")}
          />
          <ButtonGenerateAction
            onClick={handleConfirmErpUpload}
            icon={<FileArrowDown size={16} />}
            title={t("confirmErpUpload")}
          />
          <ButtonGenerateAction
            onClick={handleConfirmCompensation}
            icon={<FileArrowDown size={16} />}
            title={t("confirmCompensation")}
          />
          <ButtonGenerateAction
            onClick={handleChangeErpIdOpen}
            icon={<ArrowsClockwise size={16} />}
            title={tActions("changeErpId")}
          />
          <ButtonGenerateAction
            onClick={handleApproveAssignmentOpen}
            icon={<CheckCircle size={16} />}
            title={tActions("approveAssignment")}
          />
        </Flex>
      </Modal>
      <ModalConfirmAction
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onOk={handleApproveAssignment}
        title={tShared("approveConfirmTitle")}
        okText={tCommon("actions.approve")}
        okLoading={isApproving}
      />
      <ModalConfirmAction
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onOk={handleConfirmErp}
        title={t("erpUploadConfirmTitle")}
        okText={tCommon("actions.confirm")}
        cancelText={t("dontConfirm")}
        okLoading={isConfirming}
      />
      <ModalActionsConfirmCompensation
        isOpen={isCompensationOpen}
        onClose={() => setIsCompensationOpen(false)}
        selectedRow={selectedRows?.[0]}
        onSuccess={onSuccess}
      />
      <ModalActionsChangeErpId
        isOpen={isChangeErpIdOpen}
        onClose={() => setIsChangeErpIdOpen(false)}
        selectedRows={selectedRows}
        onSuccess={onSuccess}
      />
    </>
  );
};

export default ModalActionsWalletPayments;
