"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { preload } from "swr";
import { message } from "antd";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  FileText,
  Edit,
  GripVertical,
  MoreHorizontal,
  Save,
  Receipt,
  Check,
  X,
  Send,
  FileOutput,
  PackageCheck,
  AlertTriangle,
  Boxes
} from "lucide-react";
import { Invoice } from "@phosphor-icons/react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";

import { extractSingleParam } from "@/utils/utils";
import { fetcher } from "@/utils/api/api";
import { mergeTrackingWithStages, getCurrentStage } from "../../utils/processOrderStages";
import {
  downloadPurchaseOrdersCSV,
  editPurchaseOrder,
  editPurchaseOrderProducts,
  sendToBilling
} from "@/services/purchaseOrders/purchaseOrders";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Separator } from "@/modules/chat/ui/separator";
import ProfitLoader from "@/components/ui/profit-loader";
import {
  PurchaseOrderInfo,
  PurchaseOrderInfoRef
} from "../../components/purchase-order-info/purchase-order-info";
import { PurchaseOrderProcess } from "../../components/purchase-order-process/purchase-order-process";
import { PurchaseOrderProducts } from "../../components/purchase-order-products/purchase-order-products";
import { PurchaseOrderDocument } from "../../components/purchase-order-document/purchase-order-document";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { ORDER_STAGES_CONFIG } from "../../constants/orderStagesConfig";
import {
  mapApiToFormData,
  mapFormDataToApi,
  mapApiProductsToForm,
  mapFormProductsToApi,
  PurchaseOrderInfoFormData,
  PurchaseOrderProductsFormData
} from "../../types/forms";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { GenericResponse } from "@/types/global/IGlobal";

// Dynamic imports for modals to reduce initial bundle size
const TimelineHistoryModal = dynamic(
  () =>
    import("../../components/timeline-history-modal/timeline-history-modal").then((mod) => ({
      default: mod.TimelineHistoryModal
    })),
  { ssr: false }
);

const ApproveOrderModal = dynamic(
  () =>
    import("../../components/dialogs/approve-order-modal/approve-order-modal").then((mod) => ({
      default: mod.ApproveOrderModal
    })),
  { ssr: false }
);

const RejectOrderModal = dynamic(
  () =>
    import("../../components/dialogs/reject-order-modal/reject-order-modal").then((mod) => ({
      default: mod.RejectOrderModal
    })),
  { ssr: false }
);

const SendToApprovalModal = dynamic(
  () =>
    import("../../components/dialogs/send-to-approval-modal/send-to-approval-modal").then(
      (mod) => ({ default: mod.SendToApprovalModal })
    ),
  { ssr: false }
);

const InvoiceModal = dynamic(
  () =>
    import("../../components/dialogs/invoice-modal/invoice-modal").then((mod) => ({
      default: mod.InvoiceModal
    })),
  { ssr: false }
);

const DispatchModal = dynamic(
  () =>
    import("../../components/dialogs/dispatch-modal/dispatch-modal").then((mod) => ({
      default: mod.DispatchModal
    })),
  { ssr: false }
);

const SendToBackorderModal = dynamic(
  () =>
    import("../../components/dialogs/send-to-backorder-modal/send-to-backorder-modal").then(
      (mod) => ({ default: mod.SendToBackorderModal })
    ),
  { ssr: false }
);

const ChangeWarehouseModal = dynamic(
  () =>
    import("@/components/molecules/modals/ChangeWarehouseModal/ChangeWarehouseModal").then(
      (mod) => ({ default: mod.ChangeWarehouseModal })
    ),
  { ssr: false }
);
import { createApproval } from "@/services/approvals/approvals";
import { ICreateApprovalRequest } from "@/types/approvals/IApprovals";

export function DetailPurchaseOrder() {
  const params = useParams();
  const router = useRouter();
  const orderId = extractSingleParam(params.orderId);

  // All hooks must be called before any conditional returns
  const [pdfWidth, setPdfWidth] = useState(50);
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoFormRef = useRef<PurchaseOrderInfoRef>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    data: orderData,
    isLoading,
    mutate
  } = useSWR<GenericResponse<IPurchaseOrderDetail>>(
    orderId ? `/purchaseorder/${orderId}` : null,
    fetcher
  );
  const data = orderData?.data;

  // Process tracking data to populate stage completion info
  const processedStages = useMemo(() => {
    if (!data?.tracking) return ORDER_STAGES_CONFIG;
    return mergeTrackingWithStages(ORDER_STAGES_CONFIG, data.tracking);
  }, [data?.tracking]);

  // Determine current stage from tracking data
  const currentStage = useMemo(() => {
    return getCurrentStage(processedStages);
  }, [processedStages]);

  // Modal states
  const [whichModalIsOpen, setWhichModalIsOpen] = useState({
    selected: 0
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const closeModals = () => setWhichModalIsOpen({ selected: 0 });

  // Dragging handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;

      const constrainedWidth = Math.max(20, Math.min(70, newWidth));

      if (constrainedWidth < 25) {
        setIsPdfCollapsed(true);
      } else {
        setIsPdfCollapsed(false);
        setPdfWidth(constrainedWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Dragging effect
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-cashport-gray-lighter flex items-center justify-center">
        <ProfitLoader size="large" message="Cargando orden de compra..." />
      </div>
    );
  }

  // Not found state
  if (!isLoading && !data) {
    return (
      <div className="h-screen bg-cashport-gray-lighter flex items-center justify-center flex-col gap-4">
        <p>Orden de compra no encontrada</p>
        <Button onClick={() => router.push("/purchase-orders")}>Volver al listado</Button>
      </div>
    );
  }

  // Early return if still loading or no data
  if (!data) {
    return null; // Loading state is already handled above
  }

  const onBack = () => router.push("/purchase-orders");

  const expandPdf = () => {
    setIsPdfCollapsed(false);
    setPdfWidth(40); // Default width when expanding
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Trigger save before exiting edit mode
      infoFormRef.current?.submitForm();
    }
    setIsEditMode(!isEditMode);
  };

  const handleInfoSave = async (formData: PurchaseOrderInfoFormData) => {
    try {
      // Only send changed fields to API
      const payload = mapFormDataToApi(formData);
      await editPurchaseOrder(orderId!, payload);

      // Refetch data
      mutate();

      // Show success message
      message.success("Información actualizada correctamente");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar la información");
    }
  };

  const handleProductsSave = async (formData: PurchaseOrderProductsFormData) => {
    try {
      const payload = mapFormProductsToApi(formData);
      await editPurchaseOrderProducts(orderId!, payload.products);

      mutate();
      message.success("Productos actualizados correctamente");
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al actualizar los productos");
    }
  };

  const handleApprove = () => {
    setWhichModalIsOpen({ selected: 5 });
  };

  const handleReject = () => {
    setWhichModalIsOpen({ selected: 6 });
  };

  const handlePrefetchHistory = () => {
    if (orderId) {
      preload(`/purchaseorder/${orderId}/events`, fetcher);
    }
  };

  const confirmApprove = async () => {
    setIsActionLoading(true);
    const modelData: ICreateApprovalRequest = {
      typeActionCode: "PURCHASE_ORDER",
      approvalName: `Aprobación para orden de compra ${data.purchase_order_number}`,
      approvalLink: `/purchase-orders/${orderId}`,
      referenceId: orderId!
    };

    try {
      await createApproval(modelData);
      message.success("Orden de compra enviada a aprobación");
      setWhichModalIsOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al aprobar la orden de compra");
    }
    setIsActionLoading(false);
  };

  const confirmReject = (_reason: string, _observation: string) => {
    // TODO: Implement rejection logic
    // Note: Modal handles its own closing via onOpenChange
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await downloadPurchaseOrdersCSV([orderId!]);
      // Crea un link temporal en memoria (no visible ni navegable)
      const link = document.createElement("a");
      link.href = response.url;
      link.setAttribute("download", `orden-${data.purchase_order_number}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar el plano de la orden de compra"
      );
    }
  };

  const handleSendToBilling = async () => {
    setWhichModalIsOpen({ selected: 7 });
  };

  const sendOrderToBilling = async (orderId?: string): Promise<any> => {
    if (!orderId) {
      message.error("ID de orden de compra no válido");
      return;
    }
    setIsActionLoading(true);
    try {
      await sendToBilling(orderId!);
      message.success("Orden de compra enviada a facturación correctamente");
      closeModals();
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al enviar la orden de compra a facturación"
      );
    }
    setIsActionLoading(false);
  };

  const actionItems: DropdownItem[] = [
    {
      key: "approval",
      label: "Enviar a aprobación",
      icon: <Send className="h-4 w-4" />,
      onClick: () => setWhichModalIsOpen({ selected: 2 })
    },
    {
      key: "invoice",
      label: "Facturar",
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => setWhichModalIsOpen({ selected: 3 })
    },
    {
      key: "dispatch",
      label: "Confirmar despacho",
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => setWhichModalIsOpen({ selected: 4 })
    },
    {
      key: "back-order",
      label: "Marcar como Backorder",
      icon: <Boxes className="h-4 w-4" />,
      onClick: () => setWhichModalIsOpen({ selected: 8 })
    },
    {
      key: "divider-1",
      type: "divider"
    },
    {
      key: "download",
      label: "Descargar plano",
      icon: <FileOutput className="h-4 w-4" />,
      onClick: handleDownloadCSV
    }
  ];

  return (
    <div className="min-h-screen bg-cashport-gray-lighter">
      <Card className="bg-cashport-white border-0 shadow-sm pt-0">
        <CardContent className="px-6 pb-6 pt-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-cashport-black hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 " />
                Volver
              </Button>
              <GeneralDropdown items={actionItems} align="start" customDropdownClass="m-0">
                <ButtonGenerateAction
                  icon={<MoreHorizontal className="h-4 w-4" />}
                  title="Generar acción"
                  hideArrow
                />
              </GeneralDropdown>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditToggle}
                className="h-[48px] px-4 bg-[#f7f7f7] border border-transparent font-semibold text-cashport-black hover:bg-gray-200"
              >
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 " />
                    Guardar
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Editar
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {data.status_name === "En aprobaciones" && (
                <Button
                  variant="outline"
                  onClick={handleSendToBilling}
                  className="rounded-full border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 h-auto flex items-center gap-2"
                >
                  <Invoice size={16} />
                  <span className="text-sm font-medium text-black">Enviar a facturación</span>
                </Button>
              )}
              {data.status_name === "En aprobaciones" && (
                <div className="flex items-center gap-2 mr-2">
                  <Button
                    variant="outline"
                    onClick={handleApprove}
                    className="rounded-full border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" style={{ color: "#CBE71E" }} />
                    <span className="text-sm font-medium text-black">Aprobar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="rounded-full border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 h-auto flex items-center gap-2"
                  >
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-black">Rechazar</span>
                  </Button>
                </div>
              )}
              <Badge
                className="text-white px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: data.status_color || "#B0BEC5" }}
              >
                {data.status_name ? data.status_name : "Desconocido"}
              </Badge>
            </div>
          </div>

          {data.novelties.length > 0 && (
            <div
              className="mb-6 rounded-lg border-2 p-4"
              style={{
                backgroundColor: "#FFF3E0",
                borderColor: "#FFE0B2"
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#FFA72620" }}
                >
                  <AlertTriangle className="h-5 w-5" style={{ color: "#FFA726" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-base" style={{ color: "#FFA726" }}>
                      Novedades
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: "#FFA726",
                        color: "#FFA726",
                        backgroundColor: "white"
                      }}
                    >
                      Requiere atención
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {data.novelties.map((novelty) => (
                      <div key={novelty.id} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-500 mt-0.5">•</span>
                        <p className="text-gray-700 text-xs">
                          <strong>{novelty.novelty_type_name}:</strong> {novelty.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <PurchaseOrderInfo
            ref={infoFormRef}
            isEditMode={isEditMode}
            initialData={mapApiToFormData(data)}
            onSave={handleInfoSave}
            onCancel={() => setIsEditMode(false)}
            clientId={data.client_nit}
          />

          <PurchaseOrderProcess
            currentStage={currentStage}
            orderStages={processedStages}
            onShowHistory={() => setWhichModalIsOpen({ selected: 1 })}
            onShowStock={() => setWhichModalIsOpen({ selected: 9 })}
            onPrefetchHistory={handlePrefetchHistory}
          />

          <Separator className="mb-6" />

          <div ref={containerRef} className="flex gap-4 overflow-hidden">
            <PurchaseOrderProducts
              clientId={data.client_nit}
              initialProducts={mapApiProductsToForm(data.products)}
              isPdfCollapsed={isPdfCollapsed}
              pdfWidth={pdfWidth}
              onSave={handleProductsSave}
              summary={data.summary}
            />

            {!isPdfCollapsed && (
              <div
                className="w-px bg-cashport-gray-light hover:bg-cashport-green cursor-col-resize flex items-center justify-center group transition-colors duration-200 flex-shrink-0"
                onMouseDown={handleMouseDown}
              >
                <GripVertical className="h-6 w-6 text-cashport-gray-light group-hover:text-cashport-green transition-colors duration-200" />
              </div>
            )}

            {!isPdfCollapsed && (
              <PurchaseOrderDocument
                pdfUrl={data.document_url}
                archivoOriginal={data.document_name}
                numeroFactura={data.purchase_order_number}
                pdfWidth={pdfWidth}
                onCollapse={() => setIsPdfCollapsed(true)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {isPdfCollapsed && (
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            onClick={expandPdf}
            className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black rounded-l-lg rounded-r-none px-3 py-8 shadow-lg flex flex-col items-center justify-center"
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">PDF</span>
          </Button>
        </div>
      )}

      <ApproveOrderModal
        open={whichModalIsOpen.selected === 5}
        onOpenChange={closeModals}
        onConfirm={confirmApprove}
        loading={isActionLoading}
      />

      <RejectOrderModal
        open={whichModalIsOpen.selected === 6}
        onOpenChange={closeModals}
        onConfirm={confirmReject}
      />

      <SendToApprovalModal
        open={whichModalIsOpen.selected === 2}
        onOpenChange={closeModals}
        purchaseOrderId={orderId}
        mutateOrderDetail={mutate}
      />

      <InvoiceModal
        open={whichModalIsOpen.selected === 3}
        onOpenChange={closeModals}
        purchaseOrderId={orderId!}
        onSuccess={() => mutate()}
      />

      <DispatchModal
        open={whichModalIsOpen.selected === 4}
        onOpenChange={closeModals}
        orderNumber={data.purchase_order_number}
        purchaseOrderId={orderId}
        mutateOrderDetail={mutate}
      />

      <TimelineHistoryModal
        isOpen={whichModalIsOpen.selected === 1}
        onClose={closeModals}
        purchaseOrderId={orderId}
      />

      <ModalConfirmAction
        isOpen={whichModalIsOpen.selected === 7}
        onClose={closeModals}
        onOk={() => sendOrderToBilling(orderId)}
        title="¿Está seguro que desea enviar esta orden a facturación?"
        okText="Enviar"
        okLoading={isActionLoading}
      />

      <SendToBackorderModal
        isOpen={whichModalIsOpen.selected === 8}
        onClose={closeModals}
        warehouseId={data.warehouseId!}
        orderId={orderId!}
        mutate={mutate}
      />

      <ChangeWarehouseModal
        isOpen={whichModalIsOpen.selected === 9}
        onClose={closeModals}
        selectedOrder={data.id}
        currentWarehouseId={data.warehouseId!}
        setFetchMutate={() => mutate()}
      />
    </div>
  );
}
