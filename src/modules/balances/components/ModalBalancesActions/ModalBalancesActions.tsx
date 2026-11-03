import React, { useState } from "react";
import { message, Modal } from "antd";
import { ArrowsClockwise, DownloadSimple } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalChangeBalanceStatus } from "../ModalChangeBalanceStatus/ModalChangeBalanceStatus";
import { ModalChangeBalanceEligibility } from "../ModalChangeBalanceEligibility/ModalChangeBalanceEligibility";
import { downloadBalanceAuditExcel } from "@/services/balances/balances";

import "@/components/molecules/modals/ModalActionAccountingAdjustments/modalActionAccountingAdjustments.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balanceIds: number[];
  onSuccess: () => void;
}

export const ModalBalancesActions: React.FC<Props> = ({
  isOpen,
  onClose,
  balanceIds,
  onSuccess
}) => {
  const t = useTranslations("balances.actions");
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isChangeEligibilityOpen, setIsChangeEligibilityOpen] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);

  const downloadFileFromUrl = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadCommercialReport = async () => {
    setIsDownloadLoading(true);
    const hide = message.open({
      type: "loading",
      content: t("downloadingReport"),
      duration: 0
    });
    try {
      const res = await downloadBalanceAuditExcel();
      downloadFileFromUrl(res.url, res.filename);
      message.success(t("downloadSuccess"));
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("downloadError"));
      console.error(error);
    } finally {
      hide();
      setIsDownloadLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        title={t("title")}
        footer={null}
        onCancel={onClose}
        className="modal-action-payment"
        centered
      >
        <div className="modal-content">
          <ButtonGenerateAction
            icon={<DownloadSimple size={20} />}
            title={t("downloadReport")}
            onClick={handleDownloadCommercialReport}
            disabled={isDownloadLoading}
          />

          {balanceIds.length > 0 && (
            <ButtonGenerateAction
              icon={<ArrowsClockwise size={20} />}
              title={t("changeStatus")}
              onClick={() => {
                setIsChangeStatusOpen(true);
                onClose();
              }}
            />
          )}
          {balanceIds.length > 0 && (
            <ButtonGenerateAction
              icon={<ArrowsClockwise size={20} />}
              title={t("changeOrigin")}
              onClick={() => {
                setIsChangeEligibilityOpen(true);
                onClose();
              }}
            />
          )}
        </div>
      </Modal>

      <ModalChangeBalanceStatus
        isOpen={isChangeStatusOpen}
        onClose={() => setIsChangeStatusOpen(false)}
        balanceIds={balanceIds}
        onSuccess={() => {
          onSuccess();
          setIsChangeStatusOpen(false);
          onClose();
        }}
      />

      <ModalChangeBalanceEligibility
        isOpen={isChangeEligibilityOpen}
        onClose={() => setIsChangeEligibilityOpen(false)}
        balanceIds={balanceIds}
        onSuccess={() => {
          onSuccess();
          setIsChangeEligibilityOpen(false);
          onClose();
        }}
      />
    </>
  );
};

export default ModalBalancesActions;
