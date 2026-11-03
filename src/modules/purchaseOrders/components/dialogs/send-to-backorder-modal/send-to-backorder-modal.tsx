import { useState, useEffect } from "react";
import { message, Modal, Spin } from "antd";
import { useTranslations } from "use-intl";

import { getWarehouseProducts } from "@/services/commerce/commerce";
import { sendToBackorder, sendToBackorderStock } from "@/services/purchaseOrders/purchaseOrders";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useAppStore } from "@/lib/store/store";

import "./send-to-backorder-modal.scss";

type IPhase = "loading" | "noData" | "allStock" | "noStock" | "partial" | "processAvailable";

interface SendToBackorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  orderId: string;
  mutate: () => void;
}

export function SendToBackorderModal({
  isOpen,
  onClose,
  warehouseId,
  orderId,
  mutate
}: SendToBackorderModalProps) {
  const t = useTranslations("purchaseOrders.backorderModal");
  const tCommon = useTranslations("common");
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [phase, setPhase] = useState<IPhase>("loading");

  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPhase("loading");
      return;
    }

    const fetchProducts = async () => {
      try {
        setPhase("loading");
        const data = await getWarehouseProducts(projectId, warehouseId, Number(orderId));

        if (!data || data.length === 0) {
          setPhase("noData");
          return;
        }

        const allHaveStock = data.every((p) => p.inWarehouse >= p.requested);
        const noneHaveStock = data.every((p) => p.inWarehouse < p.requested);

        if (allHaveStock) {
          setPhase("allStock");
        } else if (noneHaveStock) {
          setPhase("noStock");
        } else {
          setPhase("partial");
        }
      } catch (error) {
        message.error(error instanceof Error ? error.message : t("fetchError"));
        setPhase("noData");
      }
    };

    fetchProducts();
  }, [isOpen, projectId, warehouseId, orderId, t]);

  const handleSendAllToBackOrder = async () => {
    setIsActionLoading(true);
    try {
      await sendToBackorder(orderId);
      message.success(t("sentSuccess"));
      onClose();
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("sendError"));
    }
    setIsActionLoading(false);
  };

  const handleSendPartialToBackOrder = async (saveRest: boolean) => {
    setIsActionLoading(true);
    try {
      await sendToBackorderStock(orderId, saveRest);
      message.success(t("processedSuccess"));
      onClose();
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("removeError"));
    }
    setIsActionLoading(false);
  };

  const renderContent = () => {
    if (phase === "loading") {
      return (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (phase === "noData") {
      return (
        <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>{t("noData")}</p>
      );
    }

    if (phase === "allStock") {
      return (
        <>
          <h3 style={{ textAlign: "center", fontSize: "1.125rem", fontWeight: 600 }}>
            {t("allInStock")}
          </h3>
          <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>
            {t("confirmSendAll")}
          </p>
          <FooterButtons
            titleCancel={tCommon("actions.reject")}
            titleConfirm={tCommon("actions.accept")}
            onClose={onClose}
            handleOk={handleSendAllToBackOrder}
            isConfirmLoading={isActionLoading}
          />
        </>
      );
    }

    if (phase === "noStock") {
      return (
        <>
          <h3 style={{ textAlign: "center", fontSize: "1.125rem", fontWeight: 600 }}>
            {t("noneInStock")}
          </h3>
          <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>
            {t("confirmSend")}
          </p>
          <FooterButtons
            titleCancel={tCommon("actions.reject")}
            titleConfirm={tCommon("actions.accept")}
            onClose={onClose}
            handleOk={handleSendAllToBackOrder}
            isConfirmLoading={isActionLoading}
          />
        </>
      );
    }

    if (phase === "partial") {
      return (
        <>
          <h3
            style={{
              textAlign: "center",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1.5rem"
            }}
          >
            {t("someInStock")}
          </h3>
          <FooterButtons
            titleCancel={t("sendAllToBackorder")}
            titleConfirm={t("processAvailable")}
            onClose={handleSendAllToBackOrder}
            handleOk={() => setPhase("processAvailable")}
          />
        </>
      );
    }

    if (phase === "processAvailable") {
      return (
        <>
          <h3
            style={{
              textAlign: "center",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1.5rem"
            }}
          >
            {t("processAvailableQuestion")}
          </h3>
          <FooterButtons
            titleCancel={t("removeUnavailable")}
            titleConfirm={t("saveInNewPo")}
            onClose={() => handleSendPartialToBackOrder(false)}
            handleOk={() => handleSendPartialToBackOrder(true)}
            isConfirmLoading={isActionLoading}
          />
        </>
      );
    }

    return null;
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      width={600}
      className="sendToBackorderModal"
    >
      {renderContent()}
    </Modal>
  );
}
