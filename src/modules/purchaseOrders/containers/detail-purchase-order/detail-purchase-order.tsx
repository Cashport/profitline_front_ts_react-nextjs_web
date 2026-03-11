"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR, { preload } from "swr";
import { message } from "antd";
import dynamic from "next/dynamic";
import { FileText, GripVertical } from "lucide-react";

import { extractSingleParam } from "@/utils/utils";
import { fetcher } from "@/utils/api/api";
import { mergeTrackingWithStages, getCurrentStage } from "../../utils/processOrderStages";
import { downloadPurchaseOrdersCSV } from "@/services/purchaseOrders/purchaseOrders";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Separator } from "@/modules/chat/ui/separator";
import ProfitLoader from "@/components/ui/profit-loader";
import {
  PurchaseOrderInfo,
  PurchaseOrderInfoRef
} from "../../components/purchase-order-info/purchase-order-info";
import { PurchaseOrderProcess } from "../../components/purchase-order-process/purchase-order-process";
import { PurchaseOrderProducts } from "../../components/purchase-order-products/purchase-order-products";
import { PurchaseOrderDocument } from "../../components/purchase-order-document/purchase-order-document";
import { PurchaseOrderDetailHeader } from "../../components/purchase-order-detail-header/purchase-order-detail-header";
import { PurchaseOrderNoveltyCard } from "../../components/purchase-order-novelty-card/purchase-order-novelty-card";

import { ORDER_STAGES_CONFIG } from "../../constants/orderStagesConfig";
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
import { resolveApproval } from "@/services/approvals/approvals";

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

  const handleOpenModal = (modal: number) => {
    setWhichModalIsOpen({ selected: modal });
  };

  const handlePrefetchHistory = () => {
    if (orderId) {
      preload(`/purchaseorder/${orderId}/events`, fetcher);
    }
  };

  const confirmApprove = async () => {
    setIsActionLoading(true);
    try {
      await resolveApproval(data.approvation!.approval_id, { decision: "APPROVE" });
      message.success("Orden de compra aprobada");
      setWhichModalIsOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al aprobar la orden de compra");
    }
    setIsActionLoading(false);
  };

  const confirmReject = async (reason: string, observation: string) => {
    setIsActionLoading(true);
    try {
      await resolveApproval(data.approvation!.approval_id, {
        decision: "REJECT",
        comment: `${reason} - ${observation}`
      });
      message.success("Orden de compra rechazada");
      setWhichModalIsOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al rechazar la orden de compra"
      );
    }
    setIsActionLoading(false);
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await downloadPurchaseOrdersCSV({ orderIds: [orderId!] });
      // Crea un link temporal en memoria (no visible ni navegable)
      window.open(response.url, "_blank");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al descargar el plano de la orden de compra"
      );
    }
  };

  return (
    <div className="min-h-screen bg-cashport-gray-lighter">
      <Card className="bg-cashport-white border-0 shadow-sm pt-0">
        <CardContent className="px-6 pb-6 pt-6">
          <PurchaseOrderDetailHeader
            data={data}
            orderId={orderId!}
            isEditMode={isEditMode}
            onEditToggle={handleEditToggle}
            onOpenModal={handleOpenModal}
            onDownloadCSV={handleDownloadCSV}
          />

          <PurchaseOrderNoveltyCard novelties={data.novelties} />

          <PurchaseOrderInfo
            ref={infoFormRef}
            isEditMode={isEditMode}
            data={data}
            orderId={orderId!}
            mutate={mutate}
            onCancel={() => setIsEditMode(false)}
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
              data={data}
              orderId={orderId!}
              mutate={mutate}
              isPdfCollapsed={isPdfCollapsed}
              pdfWidth={pdfWidth}
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
                data={data}
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
        purchaseOrderData={data}
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
