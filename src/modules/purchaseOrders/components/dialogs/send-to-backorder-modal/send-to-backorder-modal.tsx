import { useState, useEffect } from "react";
import { message, Modal, Spin } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { getWarehouseProducts } from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";
import { sendToBackorder } from "@/services/purchaseOrders/purchaseOrders";
import { IWarehouseProductsStock } from "@/types/commerce/ICommerce";
import { Description } from "@radix-ui/react-dialog";

type IPhase = "loading" | "noData" | "allStock" | "noStock" | "partial" | "processAvailable";

interface SendToBackorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  orderId: string;
}

export function SendToBackorderModal({
  isOpen,
  onClose,
  warehouseId,
  orderId
}: SendToBackorderModalProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [phase, setPhase] = useState<IPhase>("loading");
  const [products, setProducts] = useState<IWarehouseProductsStock[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setPhase("loading");
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setPhase("loading");
        const data = await getWarehouseProducts(projectId, warehouseId, Number(orderId));

        if (!data || data.length === 0) {
          setPhase("noData");
          setProducts([]);
          return;
        }

        setProducts(data);

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
        message.error(
          error instanceof Error ? error.message : "Error al obtener productos de la bodega"
        );
        setPhase("noData");
      }
    };

    fetchProducts();
  }, [isOpen, projectId, warehouseId, orderId]);

  const handleSendAllToBackOrder = async () => {
    try {
      const modelData = products.map((p) => ({
        marketplace_order_product_id: p.product_id,
        description: p.description,
        quantity: p.quantity
      }));

      await sendToBackorder(orderId, modelData);
      message.success("Orden de compra enviada a Back Order exitosamente");
      onClose();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al enviar la orden de compra a Back Order"
      );
    }
  };

  const handleDeleteUnavailableProducts = () => {
    console.log(
      "Eliminar productos no disponibles:",
      products.filter((p) => p.inWarehouse < p.requested)
    );
  };

  const handleSaveInNewPurchaseOrder = () => {
    console.log(
      "Guardar en nueva OC los productos no disponibles:",
      products.filter((p) => p.inWarehouse < p.requested)
    );
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
        <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>
          No hay data de la bodega seleccionada
        </p>
      );
    }

    if (phase === "allStock") {
      return (
        <>
          <h3 style={{ textAlign: "center", fontSize: "1.125rem", fontWeight: 600 }}>
            Todos los productos tienen stock
          </h3>
          <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>
            ¿Está seguro que quiere enviar a Back Order?
          </p>
          <FooterButtons
            titleCancel="Rechazar"
            titleConfirm="Aceptar"
            onClose={onClose}
            handleOk={handleSendAllToBackOrder}
          />
        </>
      );
    }

    if (phase === "noStock") {
      return (
        <>
          <h3 style={{ textAlign: "center", fontSize: "1.125rem", fontWeight: 600 }}>
            Ninguno de los productos tiene stock
          </h3>
          <p style={{ textAlign: "center", fontSize: "1rem", margin: "1.5rem 0" }}>
            ¿Está seguro de enviar a Back Order?
          </p>
          <FooterButtons
            titleCancel="Rechazar"
            titleConfirm="Aceptar"
            onClose={onClose}
            handleOk={handleSendAllToBackOrder}
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
            Algunos productos tienen Stock
          </h3>
          <FooterButtons
            titleCancel="Enviar todo a Back order"
            titleConfirm="Procesar disponibles"
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
            ¿Desea eliminar los productos no disponibles o guardarlos en una orden de compra para
            después?
          </h3>
          <FooterButtons
            titleCancel="Eliminar no disponibles"
            titleConfirm="Guardar en nueva OC"
            onClose={handleDeleteUnavailableProducts}
            handleOk={handleSaveInNewPurchaseOrder}
          />
        </>
      );
    }

    return null;
  };

  return (
    <Modal open={isOpen} onCancel={onClose} footer={null} centered destroyOnClose width={600}>
      {renderContent()}
    </Modal>
  );
}
