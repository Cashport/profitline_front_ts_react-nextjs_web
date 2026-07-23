"use client";

import { useContext, useEffect, useRef, useState } from "react";
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
import { generateShortUuid } from "@/utils/utils";

import ProductsDetailsAndDiscounts from "./products-details-and-discounts";
import OrderShipmentConfirm from "./order-shipment-confirm/order-shipment-confirm";
import ModalPurchaseOrderInfo from "./modal-purchase-order-info";

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
    bonus,
    channelCode,
    businessUnit
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
  // Orden de compra (opcional): se adjunta desde el panel de envío y viaja en
  // cada split como marketplace_number + su archivo OC-{index}.
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [purchaseOrderFile, setPurchaseOrderFile] = useState<File | undefined>();

  // Conserva los uuids generados previamente para reutilizarlos cuando
  // se revalida el descuento (mismo sku + misma quantity => mismo uuid),
  // de modo que el backend pueda correlacionar el producto entre revalidaciones.
  const previousItemUuidsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const fetchTotalValues = async () => {
      if (selectedCategories.length === 0) return;
      const products = selectedCategories
        .flatMap((category) => category.products)
        .map((product) => ({
          product_sku: product.SKU,
          quantity: product.quantity
        }));
      // promotion_applyed se calcula SOLO con los bonificados comunes
      // (bonusOptions). Los "other bonified" (otherBonificated) NO cuentan,
      // porque no pertenecen al rango activo de la promoción.
      const promotionApplyed = (bonus?.bonusOptions ?? []).some((opt) =>
        opt.cards.some((card) => card.items.length > 0)
      );
      const payload: IConfirmOrderData = {
        discount_package: selectedDiscount,
        order_summary: products,
        executive_discounts: executiveDiscounts,
        deactivate_cross_selling: !deactivateCrossSelling,
        ...(bonus?.id !== undefined && { promotion_id: bonus.id }),
        promotion_applyed: promotionApplyed
      };
      try {
        const response = await confirmOrder(projectId, client?.id || "", payload);
        if (response.status === 200) {
          response?.data?.discounts?.discountItems?.forEach((item) => {
            const key = `${item.product_sku}::${item.quantity}`;
            const existing = previousItemUuidsRef.current.get(key);
            const item_uuid = existing ?? generateShortUuid();
            previousItemUuidsRef.current.set(key, item_uuid);
            item.item_uuid = item_uuid;
          });
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
    // 1) Para cada línea de order_summary.products, reutiliza el uuid previo
    //    si existe (mismo sku + quantity) o genera uno nuevo. Esto preserva
    //    la correlación cuando se revalida el descuento (override o
    //    desactivación de cross-selling).
    const summaryProducts = (confirmOrderData?.products ?? []).map((p) => {
      const key = `${p.product_sku}::${p.quantity}`;
      const existing = previousItemUuidsRef.current.get(key);
      const item_uuid = existing ?? generateShortUuid();
      previousItemUuidsRef.current.set(key, item_uuid);
      return { ...p, item_uuid };
    });

    // 2) Mapa de lookup por (sku + quantity) para inyectar el mismo uuid
    //    en discounts.discountItems y en order_split_details[*].products.
    const uuidByKey = new Map<string, string>();
    summaryProducts.forEach((p) => {
      if (p.item_uuid) uuidByKey.set(`${p.product_sku}::${p.quantity}`, p.item_uuid);
    });

    // 3) Inyecta el mismo uuid en order_summary.discounts.discountItems
    //    (mismo source que order_split_details[*].products).
    const summaryDiscountItems = (confirmOrderData?.discounts?.discountItems ?? []).map((p) => {
      const key = `${p.product_sku}::${p.quantity}`;
      const item_uuid = uuidByKey.get(key) ?? p.item_uuid ?? generateShortUuid();
      return { ...p, item_uuid };
    });

    // 4) Clona order_split_details inyectando item_uuid en cada producto del
    //    split y el # de orden de compra, que aplica a todos los splits.
    const cleanedPurchaseOrderNumber = purchaseOrderNumber.trim();
    const splitDetails = order_split_details.map((split) => ({
      ...split,
      products: split.products.map((p) => {
        const key = `${p.product_sku}::${p.quantity}`;
        const item_uuid = uuidByKey.get(key) ?? p.item_uuid ?? generateShortUuid();
        return { ...p, item_uuid };
      }),
      ...(cleanedPurchaseOrderNumber ? { marketplace_number: cleanedPurchaseOrderNumber } : {})
    }));

    const orderSummary: IOrderSummaryPayload = {
      ...confirmOrderData,
      products: summaryProducts,
      discounts: {
        ...confirmOrderData.discounts,
        discountItems: summaryDiscountItems
      },
      discount_package: selectedDiscount as IDiscountPackageAvailable,
      executive_discounts: executiveDiscounts,
      deactivate_cross_selling: !deactivateCrossSelling
    };

    // El range_promotion_id es el id del rango activo
    // (promotion.active_range.range_id) del que provienen los
    // bonificados comunes (bonusOptions). Los "other bonified"
    // (otherBonificated) no pertenecen a un rango, así que nunca
    // son fuente de este id; solo usamos bonusOptions para detectar
    // si aplica enviarlo.
    const hasCommonBonusProducts = (bonus?.bonusOptions ?? []).some((opt) =>
      opt.cards.some((card) => card.items.length > 0)
    );
    const activeRangeId = confirmOrderData?.promotion?.active_range?.range_id;

    return {
      order_summary: orderSummary,
      is_electronic_invoicing: isElectronicInvoicing,
      order_split_details: splitDetails,
      promotion_id: bonus?.id || undefined,
      nit_id: channelCode,
      // business_unit solo se envía cuando el usuario eligió un canal
      // (client_bu[n].bu_name). Es opcional y solo aplica a marketplace.
      ...(businessUnit ? { business_unit: businessUnit } : {}),
      ...(hasCommonBonusProducts && activeRangeId ? { range_promotion_id: activeRangeId } : {})
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
          paymentSupportFile,
          purchaseOrderFile
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
        paymentSupportFile,
        purchaseOrderFile
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
        purchaseOrderNumber={purchaseOrderNumber}
        purchaseOrderFile={purchaseOrderFile}
        onOpenPurchaseOrder={() => setIsPurchaseOrderModalOpen(true)}
        onClearPurchaseOrder={() => {
          setPurchaseOrderNumber("");
          setPurchaseOrderFile(undefined);
        }}
      />

      <ModalPurchaseOrderInfo
        isOpen={isPurchaseOrderModalOpen}
        onCancel={() => setIsPurchaseOrderModalOpen(false)}
        onOk={(number, file) => {
          setPurchaseOrderNumber(number);
          setPurchaseOrderFile(file);
          setIsPurchaseOrderModalOpen(false);
        }}
        initialPurchaseOrderNumber={purchaseOrderNumber}
        initialFile={purchaseOrderFile}
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
        confirmDisabled={selectedPaymentSupport.length === 0}
        loading={loadingFinish}
      />
    </div>
  );
}
