"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

import { useAppStore } from "@/lib/store/store";
import {
  confirmOrder,
  createDraft,
  createOrder,
  createOrderFromDraft
} from "@/services/commerce/commerce";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import {
  IConfirmOrderData,
  ICreateOrderData,
  IDiscountPackageAvailable,
  IOrderSummaryPayload
} from "@/types/commerce/ICommerce";
import { useMessageApi } from "@/context/MessageContext";
import { ApiError } from "@/utils/api/api";
import { CETAPHIL_PROJECT_ID } from "@/utils/constants/globalConstants";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import WompiModal from "@/components/organisms/paymentWeb/PaymentWebView";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";
import { GenericResponse } from "@/types/global/IGlobal";

import ProductsDetailsAndDiscounts from "./products-details-and-discounts";
import OrderShipmentConfirm from "./order-shipment-confirm/order-shipment-confirm";

export type IShippingInfo = {
  id: string;
  addressSelectValue: string;
  addressId?: number;
  city: string;
  dispatch_address: string;
  email: string;
  indicativo: string;
  telefono: string;
  observaciones: string;
  cantidades: Record<string, number>;
  bonusCantidades: Record<string, number>;
  otherBonusCantidades: Record<string, number>;
};

export default function CheckoutPage() {
  const router = useRouter();
  const projectId = useAppStore((state) => state.selectedProject.ID);
  const draftInfo = useAppStore((state) => state.draftInfo);
  const {
    client,
    selectedCategories,
    selectedDiscount,
    executiveDiscounts,
    setConfirmOrderData,
    confirmOrderData,
    order_split_details,
    deactivateCrossSelling,
    bonus
  } = useContext(OrderViewContext);
  const { showMessage } = useMessageApi();

  const [multiEntrega, setMultiEntrega] = useState(false);
  const [entregas, setEntregas] = useState<IShippingInfo[]>([]);

  const [loadingFinish, setLoadingFinish] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [isElectronicBillingModalOpen, setIsElectronicBillingModalOpen] = useState(false);
  const [showPaymentSupportView, setShowPaymentSupportView] = useState(false);
  const [showWompiModal, setShowWompiModal] = useState(false);
  const [selectedPaymentSupport, setSelectedPaymentSupport] = useState<File[]>([]);

  useEffect(() => {
    const fetchTotalValues = async () => {
      if (selectedCategories.length === 0) return;
      const products = selectedCategories
        .flatMap((category) => category.products)
        .map((product) => ({
          product_sku: product.SKU,
          quantity: product.quantity
        }));
      const payload: IConfirmOrderData = {
        discount_package: selectedDiscount,
        order_summary: products,
        executive_discounts: executiveDiscounts,
        deactivate_cross_selling: !deactivateCrossSelling
      };
      try {
        const response = await confirmOrder(projectId, client?.id || "", payload);
        if (response.status === 200) {
          setConfirmOrderData(response.data);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("Error confirmando orden", error.message);
        } else {
          console.error("Unexpected error", error);
        }
      }
    };

    const timeOut = setTimeout(() => {
      fetchTotalValues();
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [selectedCategories, selectedDiscount, executiveDiscounts, deactivateCrossSelling]);

  const cantidadesAsignadas = (sku: string) =>
    entregas.reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  const cantidadesAsignadasExcluyendo = (sku: string, excludeId: string | null) =>
    entregas.filter((e) => e.id !== excludeId).reduce((s, e) => s + (e.cantidades[sku] ?? 0), 0);

  const bonusAsignadasExcluyendo = (sku: string, excludeId: string | null) =>
    entregas
      .filter((e) => e.id !== excludeId)
      .reduce((s, e) => s + (e.bonusCantidades[sku] ?? 0), 0);

  const otherBonusAsignadasExcluyendo = (sku: string, excludeId: string | null) =>
    entregas
      .filter((e) => e.id !== excludeId)
      .reduce((s, e) => s + (e.otherBonusCantidades[sku] ?? 0), 0);

  const buildOrderPayload = (isElectronicInvoicing: number): ICreateOrderData => {
    const orderSummary: IOrderSummaryPayload = {
      ...confirmOrderData,
      discount_package: selectedDiscount as IDiscountPackageAvailable,
      executive_discounts: executiveDiscounts,
      deactivate_cross_selling: !deactivateCrossSelling
    };
    return {
      order_summary: orderSummary,
      is_electronic_invoicing: isElectronicInvoicing,
      order_split_details,
      promotion_id: bonus?.id || 0
    };
  };

  const processOrderCreation = async (isElectronic: number) => {
    try {
      setLoadingFinish(true);
      if (!client?.id) {
        showMessage("error", "Cliente no encontrado");
        return;
      }
      const payload = buildOrderPayload(isElectronic);
      const paymentSupportFile = selectedPaymentSupport[0];

      if (draftInfo?.id) {
        const response = (await createOrderFromDraft(
          projectId,
          client.id,
          draftInfo.id,
          payload,
          showMessage,
          paymentSupportFile
        )) as GenericResponse<{ id_order: number }>;

        if (response.status === 200) {
          const url = `/comercio/pedidoConfirmado/${draftInfo.id}`;
          router.prefetch(url);
          router.push(url);
        }
        return;
      }

      const response = await createOrder(
        projectId,
        client.id,
        payload,
        showMessage,
        paymentSupportFile
      );
      if (response.status === 200) {
        const queryParams = [];
        if (response.data?.notificationId) {
          queryParams.push(`notification=${response.data.notificationId}`);
        }
        const queryParamsString = queryParams.join("&");

        const orders = response.data?.orders ?? [];
        if (orders.length === 0) {
          throw new Error("No se pudo obtener la orden creada");
        }

        const [firstOrder, ...restOrders] = orders;

        restOrders.forEach((o) => {
          const extraUrl = `/comercio/pedidoConfirmado/${o.orderId}`;
          window.open(extraUrl, "_blank", "noopener,noreferrer");
        });

        const firstUrl = `/comercio/pedidoConfirmado/${firstOrder.orderId}${
          queryParamsString ? `?${queryParamsString}` : ""
        }`;
        router.prefetch(firstUrl);
        router.push(firstUrl);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError) {
        showMessage("error", error.message || "Error al crear la orden");
        if (error.status === 400 && Array.isArray(error.data)) {
          error.data.forEach((err: { msg?: string }) => {
            if (err.msg) showMessage("error", err.msg);
          });
        }
      } else {
        showMessage("error", "Error al crear la orden");
      }
    } finally {
      setLoadingFinish(false);
    }
  };

  const handleFinishOrder = async () => {
    if (!confirmOrderData?.total || confirmOrderData.total <= 0) {
      showMessage("error", "El total no es válido");
      return;
    }
    if (!order_split_details?.length) {
      showMessage("error", "Faltan datos de envío");
      return;
    }

    if (client.payment_type === 2) {
      setShowPaymentSupportView(true);
      return;
    }

    if (CETAPHIL_PROJECT_ID === projectId && client.payment_type === 3) {
      setShowWompiModal(true);
      return;
    }

    if (CETAPHIL_PROJECT_ID === projectId) {
      setIsElectronicBillingModalOpen(true);
      return;
    }

    await processOrderCreation(0);
  };

  const handleWompiClose = async (transactionResult?: any) => {
    setShowWompiModal(false);
    if (transactionResult?.transaction?.status === "APPROVED") {
      setIsElectronicBillingModalOpen(true);
    } else {
      showMessage("info", "Pago no completado, orden no generada");
    }
  };

  const handleElectronicBillingClose = async (isElectronic?: boolean) => {
    if (isElectronic === undefined) {
      setIsElectronicBillingModalOpen(false);
      return;
    }
    setIsElectronicBillingModalOpen(false);
    await processOrderCreation(isElectronic ? 1 : 0);
  };

  const handlePaymentSupportSubmit = async () => {
    if (selectedPaymentSupport.length === 0) {
      showMessage("error", "Por favor, adjunta el soporte de pago");
      return;
    }

    if (CETAPHIL_PROJECT_ID === projectId) {
      setShowPaymentSupportView(false);
      setIsElectronicBillingModalOpen(true);
      return;
    }

    setShowPaymentSupportView(false);
    await processOrderCreation(0);
  };

  const handlePaymentSupportCancel = () => {
    setShowPaymentSupportView(false);
    setSelectedPaymentSupport([]);
  };

  const handleDraftOrder = async () => {
    if (!client?.id) return;
    if (!order_split_details?.length) {
      showMessage("error", "Faltan datos de envío");
      return;
    }
    setLoadingDraft(true);
    router.prefetch("/comercio");
    try {
      const payload = buildOrderPayload(0);
      const response = (await createDraft(
        projectId,
        client.id,
        payload,
        showMessage
      )) as GenericResponse<{ id_order: number }>;

      if (response.status === 200) {
        router.push("/comercio");
      }
    } catch {
      showMessage("error", "Error creating draft");
    } finally {
      setLoadingDraft(false);
    }
  };

  const wompiPrimaryShipping = order_split_details?.[0]?.shipping_information;
  const wompiPhoneRaw = wompiPrimaryShipping?.phone_number ?? "";
  const wompiPhoneMatch = wompiPhoneRaw.match(/^(\+\d{1,3})(\d+)$/);
  const wompiIndicative = wompiPhoneMatch ? wompiPhoneMatch[1] : "+57";
  const wompiPhone = wompiPhoneMatch ? wompiPhoneMatch[2] : wompiPhoneRaw;

  return (
    <div className="flex h-full gap-6 bg-[#F7F7F7] overflow-hidden">
      <ProductsDetailsAndDiscounts
        multiEntrega={multiEntrega}
        cantidadesAsignadas={cantidadesAsignadas}
      />
      <OrderShipmentConfirm
        multiEntrega={multiEntrega}
        setMultiEntrega={setMultiEntrega}
        entregas={entregas}
        setEntregas={setEntregas}
        cantidadesAsignadasExcluyendo={cantidadesAsignadasExcluyendo}
        bonusAsignadasExcluyendo={bonusAsignadasExcluyendo}
        otherBonusAsignadasExcluyendo={otherBonusAsignadasExcluyendo}
        onConfirm={handleFinishOrder}
        onDraft={handleDraftOrder}
        loadingFinish={loadingFinish}
        loadingDraft={loadingDraft}
      />

      <ModalConfirmAction
        isOpen={isElectronicBillingModalOpen}
        onClose={() => handleElectronicBillingClose(undefined)}
        onOk={() => handleElectronicBillingClose(true)}
        onCancel={() => handleElectronicBillingClose(false)}
        title="¿Necesita facturación electrónica?"
        okText="Sí, necesito"
        cancelText="No"
        cancelLoading={loadingFinish}
        okLoading={loadingFinish}
      />

      {showWompiModal && (
        <WompiModal
          visible={showWompiModal}
          onClose={handleWompiClose}
          client={{
            name: client.name,
            email: wompiPrimaryShipping?.email || client.email,
            phone: wompiPhone,
            indicative: {
              value: wompiIndicative
            }
          }}
          amountInCents={(confirmOrderData.total || 0) * 100}
          orderId={draftInfo?.id?.toString() || Date.now().toString()}
        />
      )}

      <ModalAttachEvidence
        selectedEvidence={selectedPaymentSupport}
        setSelectedEvidence={setSelectedPaymentSupport}
        handleAttachEvidence={handlePaymentSupportSubmit}
        isOpen={showPaymentSupportView}
        handleCancel={handlePaymentSupportCancel}
        customTexts={{
          title: "Cargar soporte de pago",
          description: "Cliente de contado, adjunta la evidencia del pago",
          acceptButtonText: "Enviar soporte",
          cancelButtonText: "Cancelar"
        }}
        multipleFiles={false}
        noComment={true}
        noDescription={true}
        isMandatory={{ evidence: true }}
        loading={loadingFinish}
      />
    </div>
  );
}
