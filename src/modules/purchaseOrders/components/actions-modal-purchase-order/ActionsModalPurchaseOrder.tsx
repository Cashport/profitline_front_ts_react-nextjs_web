import React, { useState } from "react";
import { Modal, message } from "antd";
import { useTranslations } from "use-intl";
import { DownloadSimple, Invoice, SubtractSquare, Trash } from "@phosphor-icons/react";
import { PackageCheck } from "lucide-react";

import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import {
  sendPackageToDispatch,
  sendPackageToBilling,
  removePurchaseOrdersFromPackage,
  deletePurchaseOrders,
  getSalesPlane,
  getInventoryExport,
  downloadMvpTxt,
  downloadMvpTxtV2
} from "@/services/purchaseOrders/purchaseOrders";

import "./actionsModalPurchaseOrder.scss";
import { ApiError } from "@/utils/api/api";
import { IPurchaseOrder, IOrder } from "@/types/purchaseOrders/purchaseOrders";
import { ModalDownloadPlane } from "../modal-download-plane/ModalDownloadPlane";
import { useAppStore } from "@/lib/store/store";

type ActionsModalPurchaseOrderProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPackageRows: IPurchaseOrder[];
  selectedOrders: IOrder[];
  mutate?: () => void;
  onUploadInvoices: () => void;
};

export const ActionsModalPurchaseOrder: React.FC<ActionsModalPurchaseOrderProps> = ({
  isOpen,
  onClose,
  selectedPackageRows,
  selectedOrders,
  mutate,
  onUploadInvoices
}) => {
  const t = useTranslations("purchaseOrders.actionsModal");
  const tCommon = useTranslations("common");
  const [isDispatchLoading, setIsDispatchLoading] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  const [isSeparateOrderModalOpen, setIsSeparateOrderModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);
  const [isDeleteOrderModalOpen, setIsDeleteOrderModalOpen] = useState(false);
  const [isDownloadPlaneOpen, setIsDownloadPlaneOpen] = useState(false);
  const [isInventoryExportLoading, setIsInventoryExportLoading] = useState(false);
  const [isMvpTxtLoading, setIsMvpTxtLoading] = useState(false);
  const [isMvpTxtV2Loading, setIsMvpTxtV2Loading] = useState(false);

  const selectedProject = useAppStore((state) => state.selectedProject);
  const isAbbott = selectedProject?.ID === 204;

  // TEMPORAL (Abbott 204): "Generar TXT ERP" oculto.
  // Para reactivarlo, cambiar únicamente este flag a true; el JSX, el handler
  // y la llamada a downloadMvpTxt se conservan completos.
  const isTxtErpEnabled = false;

  const canSendToBilling =
    selectedPackageRows.length === 1 &&
    selectedPackageRows[0].orders.every((o) => o.status === "Procesado");
  const canSendToDispatch =
    selectedPackageRows.length === 1 &&
    selectedPackageRows[0].orders.every((o) => o.status === "Facturado");
  const canUploadInvoices =
    selectedOrders.length > 0 && selectedOrders.every((o) => o.status === "En facturación");

  const allowedStatesForDelete = [
    "Procesado",
    "En aprobaciones",
    "Novedad",
    "Back order",
    "Rechazado"
  ];
  const canDelete =
    selectedOrders.length > 0 &&
    selectedOrders.every((o) => allowedStatesForDelete.includes(o.status));

  const allowedStatesForSeparate = [
    "Novedad",
    "Procesado",
    "En aprobaciones",
    "Back order",
    "Rechazado"
  ];
  const canSeparateOrder =
    selectedOrders.length > 0 &&
    selectedOrders.every((o) => allowedStatesForSeparate.includes(o.status));

  const allowedStatesForDownload = ["En facturación", "En despacho", "Facturado"];
  const canDownload =
    selectedPackageRows.length > 0 &&
    selectedPackageRows.every((p) =>
      p.orders.every((o) => allowedStatesForDownload.includes(o.status))
    );

  const validatePackageSelection = (): boolean => {
    if (selectedPackageRows.length === 0) {
      message.warning(t("selectAtLeastOneOrder"));
      return false;
    }
    if (selectedPackageRows.length > 1) {
      message.warning(t("selectOnlyOneOrder"));
      return false;
    }
    return true;
  };

  const validatePackagesSelection = (): boolean => {
    if (selectedPackageRows.length === 0) {
      message.warning(t("selectAtLeastOneOrder"));
      return false;
    }
    const firstStatus = selectedPackageRows[0].status;
    if (selectedPackageRows.some((p) => p.status !== firstStatus)) {
      message.warning(t("sameStatusRequired"));
      return false;
    }
    return true;
  };

  const validateOrderSelection = (): boolean => {
    if (selectedOrders.length === 0) {
      message.warning(t("selectAtLeastOnePo"));
      return false;
    }
    return true;
  };

  const handleSendToDispatch = async () => {
    if (!validatePackageSelection()) return;

    setIsDispatchLoading(true);
    const hideLoading = message.loading(t("sendingToDispatch"), 0);

    try {
      await sendPackageToDispatch(String(selectedPackageRows[0].packageId));
      message.success(t("sentToDispatch"));
      mutate && mutate();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || t("sendToDispatchError"));
      } else {
        message.error(t("sendToDispatchError"));
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

  const handleSeparateOrder = () => {
    if (!validateOrderSelection()) return;
    const packageId = selectedOrders[0].packageId;
    if (selectedOrders.some((order) => order.packageId !== packageId)) {
      message.error(t("sameOrderRequired"));
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
      message.success(t("splitSuccess"));
      mutate && mutate();
      setIsSeparateOrderModalOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("splitError"));
    }
    setIsActionLoading(false);
  };

  const handleSendToBilling = async (send_approval?: boolean) => {
    if (!validatePackageSelection()) return;

    setIsBillingLoading(true);
    const hideLoading = message.loading(t("sendingToBilling"), 0);

    try {
      await sendPackageToBilling(
        String(selectedPackageRows[0].packageId),
        send_approval && send_approval ? 1 : 0
      );
      message.success(t("sentToBilling"));
      mutate && mutate();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.data?.misstake_type === "INSUFFICIENT_QUOTA") {
          onClose();
          setIsBillingConfirmOpen(true);
        } else {
          message.error(error.message || t("sendToBillingError"));
        }
      } else {
        message.error(t("sendToBillingError"));
      }
    } finally {
      hideLoading();
      setIsBillingLoading(false);
    }
  };

  const handleDeleteOrders = () => {
    if (!validateOrderSelection()) return;
    onClose();
    setIsDeleteOrderModalOpen(true);
  };

  const deleteOrderRequest = async (selectedOrders: IOrder[]) => {
    setIsActionLoading(true);
    try {
      await deletePurchaseOrders(selectedOrders?.map((order) => order.id));
      mutate && mutate();
      setIsDeleteOrderModalOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("deleteError"));
    }
    setIsActionLoading(false);
  };

  const handleOpenDownloadPlaneModal = () => {
    if (!validatePackagesSelection()) return;
    onClose();
    setIsDownloadPlaneOpen(true);
  };

  const handleDownloadSalesPlane = async () => {
    const hideLoading = message.loading(t("downloadingSalesFile"), 0);
    try {
      const res = await getSalesPlane();
      window.open(res.url, "_blank");
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("salesFileError"));
    } finally {
      hideLoading();
    }
  };

  const handleDownloadInventory = async () => {
    setIsInventoryExportLoading(true);
    const hideLoading = message.loading(t("downloadingInventory"), 0);
    try {
      const res = await getInventoryExport();
      window.open(res.url, "_blank");
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("inventoryError"));
    } finally {
      setIsInventoryExportLoading(false);
      hideLoading();
    }
  };

  const handleDownloadMvpTxt = async () => {
    if (!validateOrderSelection()) return;

    setIsMvpTxtLoading(true);
    const hideLoading = message.loading(t("generatingTxt"), 0);
    try {
      await downloadMvpTxt({
        orderIds: selectedOrders.map((order) => order.id),
        variant: "sku"
      });
      message.success(t("txtGenerated"));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("txtError"));
    } finally {
      hideLoading();
      setIsMvpTxtLoading(false);
    }
  };

  const handleDownloadMvpTxtV2 = async () => {
    if (!validateOrderSelection()) return;

    setIsMvpTxtV2Loading(true);
    const hideLoading = message.loading(t("generatingTxtEan"), 0);
    try {
      await downloadMvpTxtV2({
        orderIds: selectedOrders.map((order) => order.id),
        variant: "sku"
      });
      message.success(t("txtEanGenerated"));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("txtEanError"));
    } finally {
      hideLoading();
      setIsMvpTxtV2Loading(false);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title={t("title")}
        footer={null}
        onCancel={onClose}
        className="actionsModalPurchaseOrder"
        centered
      >
        <div className="modal-content">
          {isAbbott ? (
            <>
              {/* TEMPORAL (Abbott 204): ERP oculto; el bloque se conserva para reactivación. */}
              {isTxtErpEnabled && (
                <ButtonGenerateAction
                  icon={<DownloadSimple className="h-4 w-4" />}
                  title={t("downloadTxtErp")}
                  onClick={handleDownloadMvpTxt}
                  disabled={isMvpTxtLoading || selectedOrders.length === 0}
                />
              )}
              <ButtonGenerateAction
                icon={<DownloadSimple className="h-4 w-4" />}
                title={t("downloadTxtEan")}
                onClick={handleDownloadMvpTxtV2}
                disabled={isMvpTxtV2Loading || selectedOrders.length === 0}
              />
              {canDelete && (
                <ButtonGenerateAction
                  icon={<Trash className="h-4 w-4" />}
                  title={t("deleteSelected")}
                  onClick={handleDeleteOrders}
                  disabled={isDispatchLoading}
                />
              )}
            </>
          ) : (
            <>
              {canDelete && (
                <ButtonGenerateAction
                  icon={<Trash className="h-4 w-4" />}
                  title={t("deleteSelected")}
                  onClick={handleDeleteOrders}
                  disabled={isDispatchLoading}
                />
              )}
              {canSeparateOrder && (
                <ButtonGenerateAction
                  icon={<SubtractSquare className="h-4 w-4" />}
                  title={t("splitPo")}
                  onClick={handleSeparateOrder}
                  disabled={isDispatchLoading}
                />
              )}
              {canSendToBilling && (
                <ButtonGenerateAction
                  icon={<Invoice size={16} />}
                  title={t("sendToBilling")}
                  onClick={() => handleSendToBilling()}
                  disabled={isBillingLoading}
                />
              )}
              {canUploadInvoices && (
                <ButtonGenerateAction
                  icon={<Invoice size={16} />}
                  title={t("uploadInvoices")}
                  onClick={handleUploadInvoices}
                  disabled={false}
                />
              )}
              {canDownload && (
                <ButtonGenerateAction
                  icon={<DownloadSimple className="h-4 w-4" />}
                  title={t("downloadFlatFile")}
                  onClick={handleOpenDownloadPlaneModal}
                  disabled={isDispatchLoading}
                />
              )}
              {canSendToDispatch && (
                <ButtonGenerateAction
                  icon={<PackageCheck className="h-4 w-4" />}
                  title={t("sendToDispatch")}
                  onClick={handleSendToDispatch}
                  disabled={isDispatchLoading}
                />
              )}
              <ButtonGenerateAction
                icon={<PackageCheck className="h-4 w-4" />}
                title={t("exportSalesFile")}
                onClick={handleDownloadSalesPlane}
                disabled={isDispatchLoading}
              />
              <ButtonGenerateAction
                icon={<DownloadSimple className="h-4 w-4" />}
                title={t("exportInventory")}
                onClick={handleDownloadInventory}
                disabled={isInventoryExportLoading}
              />
            </>
          )}
        </div>
      </Modal>

      <ModalConfirmAction
        isOpen={isSeparateOrderModalOpen}
        onClose={() => setIsSeparateOrderModalOpen(false)}
        onOk={() => {
          separateOrderRequest(selectedOrders);
        }}
        title={t("confirmSplit", { count: selectedOrders.length })}
        okLoading={isActionLoading}
      />

      <ModalConfirmAction
        isOpen={isBillingConfirmOpen}
        onClose={() => setIsBillingConfirmOpen(false)}
        onOk={() => {
          setIsBillingConfirmOpen(false);
          handleSendToBilling(true);
        }}
        title={t("confirmSendToApproval")}
        content={t("insufficientCredit")}
        okText={t("sendForApproval")}
        cancelText={tCommon("actions.cancel")}
      />

      <ModalConfirmAction
        isOpen={isDeleteOrderModalOpen}
        onClose={() => setIsDeleteOrderModalOpen(false)}
        onOk={() => {
          deleteOrderRequest(selectedOrders);
        }}
        title={t("confirmDelete", { count: selectedOrders.length })}
        okLoading={isActionLoading}
      />

      <ModalDownloadPlane
        isOpen={isDownloadPlaneOpen}
        onClose={() => setIsDownloadPlaneOpen(false)}
        packageIds={selectedPackageRows.map((row) => String(row.packageId)) || []}
      />
    </>
  );
};
