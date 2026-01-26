"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { preload } from "swr";
import { extractSingleParam } from "@/utils/utils";
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
  AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Separator } from "@/modules/chat/ui/separator";
import ProfitLoader from "@/components/ui/profit-loader";

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
import {
  PurchaseOrderInfo,
  PurchaseOrderInfoRef
} from "../../components/purchase-order-info/purchase-order-info";
import { PurchaseOrderProcess } from "../../components/purchase-order-process/purchase-order-process";
import { PurchaseOrderProducts } from "../../components/purchase-order-products/purchase-order-products";
import { PurchaseOrderDocument } from "../../components/purchase-order-document/purchase-order-document";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { fetcher } from "@/utils/api/api";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { GenericResponse } from "@/types/global/IGlobal";
import { ORDER_STAGES_CONFIG } from "../../constants/orderStagesConfig";
import { mergeTrackingWithStages, getCurrentStage } from "../../utils/processOrderStages";
import {
  mapApiToFormData,
  mapFormDataToApi,
  mapApiProductsToForm,
  mapFormProductsToApi,
  PurchaseOrderInfoFormData,
  PurchaseOrderProductsFormData
} from "../../types/forms";
import {
  downloadPurchaseOrdersCSV,
  editPurchaseOrder,
  editPurchaseOrderProducts
} from "@/services/purchaseOrders/purchaseOrders";

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

  // Modal states - must be before conditional returns
  const [showTimelineHistory, setShowTimelineHistory] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Dragging handlers - must be before conditional returns
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

  // Dragging effect - must be before conditional returns
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
      console.error("Error saving:", error);
      message.error("Error al actualizar la información");
    }
  };

  const handleProductsSave = async (formData: PurchaseOrderProductsFormData) => {
    try {
      const payload = mapFormProductsToApi(formData);
      await editPurchaseOrderProducts(orderId!, payload.products);

      mutate();
      message.success("Productos actualizados correctamente");
    } catch (error) {
      console.error("Error saving products:", error);
      message.error("Error al actualizar los productos");
    }
  };

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handlePrefetchHistory = () => {
    if (orderId) {
      preload(`/purchaseorder/${orderId}/events`, fetcher);
    }
  };

  const confirmApprove = () => {
    // TODO: Implement approval logic
    // Note: Modal handles its own closing via onOpenChange
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
    } catch (error: any) {
      message.error(error ? error : "Error al descargar el plano de la orden de compra");
    }
  };

  const actionItems: DropdownItem[] = [
    {
      key: "approval",
      label: "Enviar a aprobación",
      icon: <Send className="h-4 w-4" />,
      onClick: () => setShowApprovalModal(true)
    },
    {
      key: "invoice",
      label: "Facturar",
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => setShowInvoiceModal(true)
    },
    {
      key: "dispatch",
      label: "Confirmar despacho",
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => setShowDispatchModal(true)
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
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-cashport-black hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <GeneralDropdown items={actionItems} align="start">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cashport-gray-light text-cashport-black hover:bg-gray-50 bg-white"
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Generar acción
                </Button>
              </GeneralDropdown>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                className="border-cashport-gray-light text-cashport-black hover:bg-gray-50 bg-white"
              >
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
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
                        <p className="text-gray-700">
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
            onShowHistory={() => setShowTimelineHistory(true)}
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
        open={showApproveModal}
        onOpenChange={setShowApproveModal}
        onConfirm={confirmApprove}
      />

      <RejectOrderModal
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        onConfirm={confirmReject}
      />

      <SendToApprovalModal
        open={showApprovalModal}
        onOpenChange={setShowApprovalModal}
        purchaseOrderId={orderId}
        mutateOrderDetail={mutate}
      />

      <InvoiceModal
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        purchaseOrderId={orderId!}
        onSuccess={() => mutate()}
      />

      <DispatchModal
        open={showDispatchModal}
        onOpenChange={setShowDispatchModal}
        orderNumber={data.purchase_order_number}
        purchaseOrderId={orderId}
        mutateOrderDetail={mutate}
      />

      <TimelineHistoryModal
        isOpen={showTimelineHistory}
        onClose={() => setShowTimelineHistory(false)}
        purchaseOrderId={orderId}
      />
    </div>
  );
}
