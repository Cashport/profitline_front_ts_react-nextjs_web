import React, { useState } from "react";
import { Modal, message } from "antd";
import { DownloadSimple, Receipt, Invoice } from "@phosphor-icons/react";
import { PackageCheck } from "lucide-react";
import { AxiosError } from "axios";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import {
  sendPackageToDispatch,
  sendPackageToBilling
} from "@/services/purchaseOrders/purchaseOrders";

import "./actionsModalPurchaseOrder.scss";

type ActionsModalPurchaseOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCSV: () => void;
  onMarkInvoiced: () => void;
  isDownloadingCSV: boolean;
  selectedRowKeys: React.Key[];
};

export const ActionsModalPurchaseOrder: React.FC<ActionsModalPurchaseOrderProps> = ({
  isOpen,
  onClose,
  onDownloadCSV,
  onMarkInvoiced,
  isDownloadingCSV,
  selectedRowKeys
}) => {
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const handleDownloadCSV = () => {
    onDownloadCSV();
    onClose();
  };

  const handleMarkInvoiced = () => {
    onMarkInvoiced();
    onClose();
  };

  const validateSelection = (): boolean => {
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

  const handleSendToDispatch = async () => {
    if (!validateSelection()) return;

    setIsDispatchLoading(true);
    const hideLoading = message.loading("Enviando pedido a despacho...", 0);

    try {
      await sendPackageToDispatch(String(selectedRowKeys[0]));
      message.success("Pedido enviado a despacho exitosamente");
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        message.error(error.response?.data?.message || "Error enviando pedido a despacho");
      } else {
        message.error("Error enviando pedido a despacho");
      }
    } finally {
      hideLoading();
      setIsDispatchLoading(false);
    }
  };

  const handleSendToBilling = async () => {
    if (!validateSelection()) return;

    setIsBillingLoading(true);
    const hideLoading = message.loading("Enviando pedido a facturar...", 0);

    try {
      await sendPackageToBilling(String(selectedRowKeys[0]));
      message.success("Pedido enviado a facturar exitosamente");
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        message.error(error.response?.data?.message || "Error enviando pedido a facturar");
      } else {
        message.error("Error enviando pedido a facturar");
      }
    } finally {
      hideLoading();
      setIsBillingLoading(false);
    }
  };

  return (
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
          icon={<Receipt size={20} />}
          title="Marcar como facturado"
          onClick={handleMarkInvoiced}
        />
        <ButtonGenerateAction
          icon={<PackageCheck className="h-4 w-4" />}
          title="Enviar a despacho"
          onClick={handleSendToDispatch}
          disabled={isDispatchLoading}
        />
        <ButtonGenerateAction
          icon={<Invoice size={16} />}
          title="Enviar a facturar"
          onClick={handleSendToBilling}
          disabled={isBillingLoading}
        />
      </div>
    </Modal>
  );
};
