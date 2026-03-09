import React, { useState } from "react";
import { Modal, message } from "antd";
import { DownloadSimple, Invoice, PaperPlaneTilt } from "@phosphor-icons/react";
import { PackageCheck } from "lucide-react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { SendToApprovalModal } from "../dialogs/send-to-approval-modal/send-to-approval-modal";
import { sendPackageToDispatch } from "@/services/purchaseOrders/purchaseOrders";

import "./actionsModalPurchaseOrder.scss";
import { ApiError } from "@/utils/api/api";

type ActionsModalPurchaseOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCSV: () => void;
  isDownloadingCSV: boolean;
  selectedRowKeys: React.Key[];
  selectedOrderKeys: React.Key[];
  mutate?: () => void;
  onSendToBilling: () => void;
};

export const ActionsModalPurchaseOrder: React.FC<ActionsModalPurchaseOrderProps> = ({
  isOpen,
  onClose,
  onDownloadCSV,
  isDownloadingCSV,
  selectedRowKeys,
  selectedOrderKeys,
  mutate,
  onSendToBilling
}) => {
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleDownloadCSV = () => {
    onDownloadCSV();
    onClose();
  };

  const validatePackageSelection = (): boolean => {
    if (selectedRowKeys.length === 0) {
      message.warning("Selecciona al menos un pedido para realizar esta acción");
      return false;
    }
    if (selectedRowKeys.length > 1) {
      message.warning("Solo puedes seleccionar un pedido para realizar esta acción");
      return false;
    }
    return true;
  };

  const validateOrderSelection = (): boolean => {
    if (selectedOrderKeys.length === 0) {
      message.warning("Selecciona al menos una orden para realizar esta acción");
      return false;
    }
    return true;
  };

  const handleSendToDispatch = async () => {
    if (!validatePackageSelection()) return;

    setIsDispatchLoading(true);
    const hideLoading = message.loading("Enviando pedido a despacho...", 0);

    try {
      await sendPackageToDispatch(String(selectedRowKeys[0]));
      message.success("Pedido enviado a despacho exitosamente");
      mutate && mutate();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || "Error enviando pedido a despacho");
      } else {
        message.error("Error enviando pedido a despacho");
      }
    } finally {
      hideLoading();
      setIsDispatchLoading(false);
    }
  };

  const handleSendToBilling = () => {
    if (!validateOrderSelection()) return;
    onClose();
    onSendToBilling();
  };

  const handleRequestApproval = () => {
    if (!validatePackageSelection()) return;
    onClose();
    setIsApprovalModalOpen(true);
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Selecciona la acción que vas a realizar"
        footer={null}
        onCancel={onClose}
        className="actionsModalPurchaseOrder"
        centered
      >
        <div className="modal-content">
          <ButtonGenerateAction
            icon={<DownloadSimple size={20} />}
            title="Descargar plano"
            onClick={handleDownloadCSV}
            disabled={isDownloadingCSV}
          />
          <ButtonGenerateAction
            icon={<Invoice size={16} />}
            title="Enviar a facturación"
            onClick={handleSendToBilling}
            disabled={false}
          />
          <ButtonGenerateAction
            icon={<PackageCheck className="h-4 w-4" />}
            title="Enviar a despacho"
            onClick={handleSendToDispatch}
            disabled={isDispatchLoading}
          />
          <ButtonGenerateAction
            icon={<PaperPlaneTilt className="h-4 w-4" />}
            title="Solicitar aprobación"
            onClick={handleRequestApproval}
            disabled={isDispatchLoading}
          />
        </div>
      </Modal>

      <SendToApprovalModal
        open={isApprovalModalOpen}
        onOpenChange={setIsApprovalModalOpen}
        packageId={selectedRowKeys.length > 0 ? String(selectedRowKeys[0]) : undefined}
        mutate={mutate}
      />
    </>
  );
};
