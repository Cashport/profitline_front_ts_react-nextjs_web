"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { extractSingleParam } from "@/utils/utils";

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
  PackageCheck
} from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Separator } from "@/modules/chat/ui/separator";
import { TimelineHistoryModal } from "../../components/timeline-history-modal/timeline-history-modal";
import { ApproveOrderModal } from "../../components/dialogs/approve-order-modal/approve-order-modal";
import { RejectOrderModal } from "../../components/dialogs/reject-order-modal/reject-order-modal";
import { SendToApprovalModal } from "../../components/dialogs/send-to-approval-modal/send-to-approval-modal";
import { InvoiceModal } from "../../components/dialogs/invoice-modal/invoice-modal";
import { DispatchModal } from "../../components/dialogs/dispatch-modal/dispatch-modal";
import { availableApprovers } from "../../constants/approvers";
import { useApp } from "../../context/app-context";
import { PurchaseOrderInfo } from "../../components/purchase-order-info/purchase-order-info";
import { PurchaseOrderProcess } from "../../components/purchase-order-process/purchase-order-process";
import { PurchaseOrderProducts } from "../../components/purchase-order-products/purchase-order-products";
import { PurchaseOrderDocument } from "../../components/purchase-order-document/purchase-order-document";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { fetcher } from "@/utils/api/api";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { GenericResponse } from "@/types/global/IGlobal";
import { ORDER_STAGES_CONFIG } from "../../constants/orderStagesConfig";
import { mergeTrackingWithStages, getCurrentStage } from "../../utils/processOrderStages";

export function DetailPurchaseOrder() {
  const params = useParams();
  const router = useRouter();
  const { goToDashboard } = useApp();

  const orderId = extractSingleParam(params.orderId);
  const [notFound, setNotFound] = useState(false);

  // All hooks must be called before any conditional returns
  const [pdfWidth, setPdfWidth] = useState(50);
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const [editableGeneralInfo, setEditableGeneralInfo] = useState({
    numeroFactura: "",
    comprador: "",
    fechaFactura: "",
    vendedor: "",
    fechaVencimiento: ""
  });

  const [editableDeliveryInfo, setEditableDeliveryInfo] = useState({
    fechaEntrega: "",
    direccion: "",
    ciudad: "",
    observacion: ""
  });

  const [editableProducts, setEditableProducts] = useState<
    Array<{
      idProducto: string;
      nombreProducto: string;
      cantidad: number;
      precioUnitario: number;
      iva: number;
      precioTotal: number;
    }>
  >([]);

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

  // Sync editable state when data from API changes
  useEffect(() => {
    if (data) {
      setEditableGeneralInfo({
        numeroFactura: data.purchase_order_number,
        comprador: data.client_name,
        fechaFactura: data.created_at,
        vendedor: "XXXXX", // No disponible en API
        fechaVencimiento: "XXXXX" // No disponible en API
      });
      setEditableDeliveryInfo({
        fechaEntrega: data.delivery_date || "",
        direccion: data.delivery_address || "",
        ciudad: "XXXXX", // No disponible en API
        observacion: data.observations || ""
      });
      setEditableProducts(
        data.products.map((p) => ({
          idProducto: p.product_sku,
          nombreProducto: p.product_description,
          cantidad: p.quantity,
          precioUnitario: p.unit_price,
          iva: p.tax_amount,
          precioTotal: p.total_price
        }))
      );
    }
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cashport-gray-lighter flex items-center justify-center">
        <p>Cargando orden de compra...</p>
      </div>
    );
  }

  // Not found state
  if (notFound || (!isLoading && !data)) {
    return (
      <div className="min-h-screen bg-cashport-gray-lighter flex items-center justify-center flex-col gap-4">
        <p>Orden de compra no encontrada</p>
        <Button onClick={() => router.push("/purchase-orders")}>Volver al listado</Button>
      </div>
    );
  }

  // Early return if still loading or no data
  if (!data) {
    return null; // Loading state is already handled above
  }

  const onBack = goToDashboard;

  const handleProductFieldChange = (
    index: number,
    field: "cantidad" | "precioUnitario" | "iva",
    value: string
  ) => {
    const numValue = Number.parseFloat(value) || 0;
    setEditableProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: numValue
      };
      const cantidad = field === "cantidad" ? numValue : updated[index].cantidad;
      const precioUnitario = field === "precioUnitario" ? numValue : updated[index].precioUnitario;
      const iva = field === "iva" ? numValue : updated[index].iva;
      updated[index].precioTotal = cantidad * precioUnitario + iva;
      return updated;
    });
  };

  const handleGeneralInfoChange = (field: keyof typeof editableGeneralInfo, value: string) => {
    setEditableGeneralInfo((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliveryInfoChange = (field: keyof typeof editableDeliveryInfo, value: string) => {
    setEditableDeliveryInfo((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const expandPdf = () => {
    setIsPdfCollapsed(false);
    setPdfWidth(40); // Default width when expanding
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Log changes when exiting edit mode (mock data)
      console.log("Saving changes:", {
        generalInfo: editableGeneralInfo,
        deliveryInfo: editableDeliveryInfo,
        products: editableProducts
      });
    }
  };

  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    console.log("Order approved");
    // TODO: Implement approval logic
    // Note: Modal handles its own closing via onOpenChange
  };

  const confirmReject = (reason: string, observation: string) => {
    console.log("Order rejected:", { reason, observation });
    // TODO: Implement rejection logic
    // Note: Modal handles its own closing via onOpenChange
  };

  const handleDownloadCSV = () => {
    const headers = [
      "ID Producto",
      "Nombre Producto",
      "Cantidad",
      "Precio Unitario",
      "IVA",
      "Precio Total"
    ];
    const rows = editableProducts.map((p) => [
      p.idProducto,
      p.nombreProducto,
      p.cantidad,
      p.precioUnitario,
      p.iva,
      p.precioTotal
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToApproval = (selectedApproverIds: string[]) => {
    console.log("Send to approval:", selectedApproverIds);
    // TODO: Implement send to approval logic
  };

  const handleAddInvoices = (invoiceIds: string) => {
    console.log("Invoice IDs:", invoiceIds);
    // TODO: Implement invoice addition logic
  };

  const handleConfirmDispatch = (dispatchNotes: string) => {
    console.log("Dispatch confirmed with notes:", dispatchNotes);
    // TODO: Implement dispatch confirmation logic
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
          <h1 className="text-2xl font-bold text-cashport-black mb-6">
            Orden de compra {editableGeneralInfo.numeroFactura}
          </h1>

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

          {/* Novedades no disponibles en API
          {novedadInfo && (
            <div className="mb-6 rounded-lg border-2 p-4">
              Sección de novedades temporalmente deshabilitada
              Campos necesarios del backend: tipoNovedad, alertas
            </div>
          )}
          */}

          <PurchaseOrderInfo
            isEditMode={isEditMode}
            generalInfo={editableGeneralInfo}
            deliveryInfo={editableDeliveryInfo}
            onGeneralInfoChange={handleGeneralInfoChange}
            onDeliveryInfoChange={handleDeliveryInfoChange}
          />

          <PurchaseOrderProcess
            currentStage={currentStage}
            orderStages={processedStages}
            onShowHistory={() => setShowTimelineHistory(true)}
          />

          <Separator className="mb-6" />

          <div ref={containerRef} className="flex gap-4 overflow-hidden">
            <PurchaseOrderProducts
              editableProducts={editableProducts}
              isEditMode={isEditMode}
              isPdfCollapsed={isPdfCollapsed}
              pdfWidth={pdfWidth}
              onProductFieldChange={handleProductFieldChange}
              formatCurrency={formatCurrency}
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
        onConfirm={handleSendToApproval}
        availableApprovers={availableApprovers}
      />

      <InvoiceModal
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        onConfirm={handleAddInvoices}
      />

      <DispatchModal
        open={showDispatchModal}
        onOpenChange={setShowDispatchModal}
        onConfirm={handleConfirmDispatch}
        orderNumber={data.purchase_order_number}
      />

      <TimelineHistoryModal
        isOpen={showTimelineHistory}
        onClose={() => setShowTimelineHistory(false)}
        invoiceId={data.purchase_order_number}
        timeline={data.tracking.map((t) => ({
          id: t.id.toString(),
          title: t.step_name,
          description: t.event_description,
          actor: t.created_by_name,
          timestamp: t.created_at,
          type: "system" as const
        }))}
      />
    </div>
  );
}
