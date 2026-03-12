import React, { useState } from "react";
import { Modal, message } from "antd";
import { DownloadSimple, Invoice, PaperPlaneTilt, SubtractSquare } from "@phosphor-icons/react";
import { PackageCheck } from "lucide-react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { SendToApprovalModal } from "../dialogs/send-to-approval-modal/send-to-approval-modal";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import {
  sendPackageToDispatch,
  sendPackageToBilling,
  removePurchaseOrdersFromPackage
} from "@/services/purchaseOrders/purchaseOrders";

import "./actionsModalPurchaseOrder.scss";
import { ApiError } from "@/utils/api/api";
import { IPurchaseOrder, IOrder } from "@/types/purchaseOrders/purchaseOrders";

type ActionsModalPurchaseOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCSV: () => void;
  isDownloadingCSV: boolean;
  selectedPackageRows: IPurchaseOrder[];
  selectedOrders: IOrder[];
  mutate?: () => void;
  onUploadInvoices: () => void;
};

export const ActionsModalPurchaseOrder: React.FC<ActionsModalPurchaseOrderProps> = ({
  isOpen,
  onClose,
  onDownloadCSV,
  isDownloadingCSV,
  selectedPackageRows,
  selectedOrders,
  mutate,
  onUploadInvoices
}) => {
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSeparateOrderModalOpen, setIsSeparateOrderModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDownloadCSV = () => {
    onDownloadCSV();
    onClose();
  };

  const validatePackageSelection = (): boolean => {
    if (selectedPackageRows.length === 0) {
      message.warning("Selecciona al menos un pedido para realizar esta acción");
      return false;
    }
    if (selectedPackageRows.length > 1) {
      message.warning("Solo puedes seleccionar un pedido para realizar esta acción");
      return false;
    }
    return true;
  };

  const validateOrderSelection = (): boolean => {
    if (selectedOrders.length === 0) {
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
      await sendPackageToDispatch(String(selectedPackageRows[0].packageId));
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

  const handleUploadInvoices = () => {
    if (!validateOrderSelection()) return;
    onClose();
    onUploadInvoices();
  };

  const handleRequestApproval = () => {
    if (!validatePackageSelection()) return;
    onClose();
    setIsApprovalModalOpen(true);
  };

  const handleSeparateOrder = () => {
    if (!validateOrderSelection()) return;
    const packageId = selectedOrders[0].packageId;
    if (selectedOrders.some((order) => order.packageId !== packageId)) {
      message.error("Todas las órdenes seleccionadas deben pertenecer al mismo pedido");
      return;
    }
    onClose();
    setIsSeparateOrderModalOpen(true);
  };

  const separateOrderRequest = async (selectedOrders: IOrder[]) => {
    setIsActionLoading(true);
    const modelData = {
      package_id: selectedOrders[0].packageId,
      marketplace_order_ids: selectedOrders.map((order) => order.id)
    };
    try {
      await removePurchaseOrdersFromPackage(modelData);
      message.success("Órdenes separadas del pedido exitosamente");
      mutate && mutate();
      setIsSeparateOrderModalOpen(false);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error separando las órdenes del pedido"
      );
    }
    setIsActionLoading(false);
  };

  const handleSendToBilling = async () => {
    if (!validatePackageSelection()) return;

    setIsBillingLoading(true);
    const hideLoading = message.loading("Enviando pedido a facturación...", 0);

    try {
      await sendPackageToBilling(String(selectedPackageRows[0].packageId));
      message.success("Pedido enviado a facturación exitosamente");
      mutate && mutate();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || "Error enviando pedido a facturación");
      } else {
        message.error("Error enviando pedido a facturación");
      }
    } finally {
      hideLoading();
      setIsBillingLoading(false);
    }
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
            disabled={isBillingLoading}
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
          <ButtonGenerateAction
            icon={<SubtractSquare className="h-4 w-4" />}
            title="Separar OC del pedido"
            onClick={handleSeparateOrder}
            disabled={isDispatchLoading}
          />
          <ButtonGenerateAction
            icon={<Invoice size={16} />}
            title="Cargar facturas"
            onClick={handleUploadInvoices}
            disabled={false}
          />
        </div>
      </Modal>

      <SendToApprovalModal
        open={isApprovalModalOpen}
        onOpenChange={setIsApprovalModalOpen}
        packageId={
          selectedPackageRows.length > 0 ? String(selectedPackageRows[0].packageId) : undefined
        }
        mutate={mutate}
      />

      <ModalConfirmAction
        isOpen={isSeparateOrderModalOpen}
        onClose={() => setIsSeparateOrderModalOpen(false)}
        onOk={() => {
          separateOrderRequest(selectedOrders);
        }}
        title="¿Está seguro de separar la(s) OC del pedido?"
        okLoading={isActionLoading}
      />
    </>
  );
};
