import React, { useState } from "react";
import { message, Modal } from "antd";
import { ArrowsClockwise, DownloadSimple } from "@phosphor-icons/react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { ModalChangeBalanceStatus } from "../ModalChangeBalanceStatus/ModalChangeBalanceStatus";
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
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
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
      content: "Descargando informe comercial...",
      duration: 0
    });
    try {
      const res = await downloadBalanceAuditExcel();
      downloadFileFromUrl(res.url, res.filename);
      message.success("Descarga exitosa");
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar el archivo"
      );
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
        title="Selecciona la acción que vas a realizar"
        footer={null}
        onCancel={onClose}
        className="modal-action-payment"
        centered
      >
        <div className="modal-content">
          <ButtonGenerateAction
            icon={<DownloadSimple size={20} />}
            title="Descargar informe comercial"
            onClick={handleDownloadCommercialReport}
            disabled={isDownloadLoading}
          />

          {balanceIds.length > 0 && (
            <ButtonGenerateAction
              icon={<ArrowsClockwise size={20} />}
              title="Cambiar estado"
              onClick={() => {
                setIsChangeStatusOpen(true);
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
    </>
  );
};

export default ModalBalancesActions;
