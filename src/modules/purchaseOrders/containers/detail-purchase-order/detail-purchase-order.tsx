"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";

import {
  ArrowLeft,
  FileText,
  Edit,
  GripVertical,
  MoreHorizontal,
  Save,
  CheckCircle,
  ClipboardList,
  Receipt,
  Truck,
  Package,
  Check,
  X,
  AlertTriangle,
  ShoppingCart,
  PackageX,
  TrendingDown,
  MapPin,
  XOctagon,
  DollarSign,
  Send,
  FileOutput,
  PackageCheck
} from "lucide-react";
import { Card, CardContent } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
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

import "@/modules/chat/styles/chatStyles.css";
import "@/modules/aprobaciones/styles/approvalsStyles.css";

export function DetailPurchaseOrder() {
  const params = useParams();
  const router = useRouter();
  const { state, goToDashboard, selectInvoice } = useApp();

  const orderId = extractSingleParam(params.orderId);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // All hooks must be called before any conditional returns
  const [pdfWidth, setPdfWidth] = useState(50);
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStage, setCurrentStage] = useState(2);

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

  const [standardizedProducts, setStandardizedProducts] = useState<Record<string, string>>({
    "PROD-001": "laptop-dell-inspiron-15",
    "PROD-002": "",
    "PROMO-001": "mousepad-corporativo"
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

  // Sync URL param with context state
  useEffect(() => {
    if (!orderId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    // If we already have the correct invoice selected, use it
    if (state.selectedInvoice?.id === orderId) {
      setIsLoading(false);
      return;
    }

    // Find invoice by ID from context invoices array directly
    const invoice = state.invoices.find((inv) => inv.id === orderId);

    if (invoice) {
      selectInvoice(invoice);
      setIsLoading(false);
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [orderId, state.selectedInvoice?.id, state.invoices, selectInvoice]);

  // Sync editable state when invoiceData changes
  useEffect(() => {
    if (state.selectedInvoice) {
      const invoiceData = state.selectedInvoice;
      setEditableGeneralInfo({
        numeroFactura: invoiceData.numeroFactura,
        comprador: invoiceData.comprador,
        fechaFactura: invoiceData.fechaFactura,
        vendedor: invoiceData.vendedor || "",
        fechaVencimiento: invoiceData.fechaVencimiento || ""
      });
      setEditableDeliveryInfo({
        fechaEntrega: invoiceData.fechaEntrega || "",
        direccion: invoiceData.direccion || "",
        ciudad: invoiceData.ciudad || "",
        observacion: invoiceData.observacion || ""
      });
      setEditableProducts(
        invoiceData.productos.map((p) => ({
          idProducto: p.idProducto,
          nombreProducto: p.nombreProducto,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          iva: p.iva,
          precioTotal: p.precioTotal
        }))
      );
    }
  }, [state.selectedInvoice]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cashport-gray-lighter flex items-center justify-center">
        <p>Cargando orden de compra...</p>
      </div>
    );
  }

  // Not found state
  if (notFound || !state.selectedInvoice) {
    return (
      <div className="min-h-screen bg-cashport-gray-lighter flex items-center justify-center flex-col gap-4">
        <p>Orden de compra no encontrada</p>
        <Button onClick={() => router.push("/purchase-orders")}>Volver al listado</Button>
      </div>
    );
  }

  const invoiceData = state.selectedInvoice;
  const onBack = goToDashboard;

  const internalProducts = [
    { id: "laptop-dell-inspiron-15", name: "Laptop Dell Inspiron 15" },
    { id: "laptop-hp-pavilion", name: "Laptop HP Pavilion" },
    { id: "mouse-logitech-mx", name: "Mouse Logitech MX Master" },
    { id: "mouse-logitech-basic", name: "Mouse Logitech Básico" },
    { id: "teclado-logitech", name: "Teclado Logitech" },
    { id: "mousepad-corporativo", name: "Mousepad Corporativo" },
    { id: "monitor-samsung-24", name: 'Monitor Samsung 24"' },
    { id: "webcam-logitech", name: "Webcam Logitech HD" }
  ];

  const handleStandardizedProductChange = (productId: string, value: string) => {
    setStandardizedProducts((prev) => ({
      ...prev,
      [productId]: value
    }));
  };

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

  const handleDownloadPdf = () => {
    if (invoiceData.pdfUrl) {
      const link = document.createElement("a");
      link.href = invoiceData.pdfUrl;
      link.download = invoiceData.archivoOriginal || `factura-${invoiceData.numeroFactura}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
    setShowApproveModal(false);
  };

  const confirmReject = (reason: string, observation: string) => {
    console.log("Order rejected:", { reason, observation });
    // TODO: Implement rejection logic
    setShowRejectModal(false);
  };

  const estadoConfig = stateColorConfig[invoiceData.estado] || {
    color: "#B0BEC5",
    textColor: "text-white"
  };

  const novedadInfo =
    invoiceData.tipoNovedad && invoiceData.estado === "Novedad"
      ? novedadConfig[invoiceData.tipoNovedad]
      : null;

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
    link.setAttribute("download", `productos-${invoiceData.numeroFactura}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToApproval = (selectedApproverIds: string[]) => {
    console.log("Send to approval:", selectedApproverIds);
    // TODO: Implement send to approval logic
    setShowApprovalModal(false);
  };

  const handleAddInvoices = (invoiceIds: string) => {
    console.log("Invoice IDs:", invoiceIds);
    // TODO: Implement invoice addition logic
    setShowInvoiceModal(false);
  };

  const handleConfirmDispatch = (dispatchNotes: string) => {
    console.log("Dispatch confirmed with notes:", dispatchNotes);
    // TODO: Implement dispatch confirmation logic
    setShowDispatchModal(false);
  };

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cashport-gray-light text-cashport-black hover:bg-gray-50 bg-white"
                  >
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    Generar acción
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setShowApprovalModal(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar a aprobación
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowInvoiceModal(true)}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Facturar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDispatchModal(true)}>
                    <PackageCheck className="h-4 w-4 mr-2" />
                    Confirmar despacho
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDownloadCSV}>
                    <FileOutput className="h-4 w-4 mr-2" />
                    Descargar plano
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {invoiceData.estado === "En aprobaciones" && (
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
                className={`${estadoConfig.textColor} px-3 py-1 text-sm font-medium`}
                style={{ backgroundColor: estadoConfig.color }}
              >
                {invoiceData.estado}
              </Badge>
            </div>
          </div>

          {novedadInfo && (
            <div
              className="mb-6 rounded-lg border-2 p-4"
              style={{
                backgroundColor: novedadInfo.bgColor,
                borderColor: novedadInfo.borderColor
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${novedadInfo.color}20` }}
                >
                  <novedadInfo.icon className="h-5 w-5" style={{ color: novedadInfo.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-base" style={{ color: novedadInfo.color }}>
                      {invoiceData.tipoNovedad}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: novedadInfo.color,
                        color: novedadInfo.color,
                        backgroundColor: "white"
                      }}
                    >
                      Requiere atención
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{novedadInfo.description}</p>
                  {invoiceData.alertas.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {invoiceData.alertas.map((alerta, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>{alerta}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <PurchaseOrderInfo
            isEditMode={isEditMode}
            generalInfo={editableGeneralInfo}
            deliveryInfo={editableDeliveryInfo}
            onGeneralInfoChange={handleGeneralInfoChange}
            onDeliveryInfoChange={handleDeliveryInfoChange}
          />

          <PurchaseOrderProcess
            currentStage={currentStage}
            orderStages={orderStages}
            onShowHistory={() => setShowTimelineHistory(true)}
          />

          <Separator className="mb-6" />

          <div ref={containerRef} className="flex gap-4 overflow-hidden">
            <PurchaseOrderProducts
              editableProducts={editableProducts}
              standardizedProducts={standardizedProducts}
              isEditMode={isEditMode}
              isPdfCollapsed={isPdfCollapsed}
              pdfWidth={pdfWidth}
              onProductFieldChange={handleProductFieldChange}
              onStandardizedProductChange={handleStandardizedProductChange}
              formatCurrency={formatCurrency}
              internalProducts={internalProducts}
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
                pdfUrl={invoiceData.pdfUrl}
                archivoOriginal={invoiceData.archivoOriginal}
                numeroFactura={invoiceData.numeroFactura}
                pdfWidth={pdfWidth}
                onCollapse={() => setIsPdfCollapsed(true)}
                onDownload={handleDownloadPdf}
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
        orderNumber={invoiceData.numeroFactura}
      />

      <TimelineHistoryModal
        isOpen={showTimelineHistory}
        onClose={() => setShowTimelineHistory(false)}
        invoiceId={invoiceData.id}
        timeline={invoiceData.timeline || []}
      />
    </div>
  );
}

const orderStages = [
  {
    id: 1,
    name: "Orden de compra",
    icon: ClipboardList,
    completedBy: "Sistema",
    completedAt: "2024-01-14 10:00"
  },
  {
    id: 2,
    name: "Validaciones",
    icon: CheckCircle,
    completedBy: null,
    completedAt: null,
    subValidations: [
      {
        name: "Aprobado Cartera",
        completedBy: "Miguel Martinez",
        completedAt: "02/02/2025 12:00",
        isCompleted: true
      },
      {
        name: "Aprobado Financiera",
        completedBy: "Miguel Martinez",
        completedAt: "02/02/2025 12:00",
        isCompleted: true
      },
      {
        name: "Aprobado KAM",
        completedBy: "Miguel Martinez",
        completedAt: "02/02/2025 12:00",
        isCompleted: false
      }
    ]
  },
  {
    id: 3,
    name: "Facturado",
    icon: Receipt,
    completedBy: null,
    completedAt: null
  },
  {
    id: 4,
    name: "En despacho",
    icon: Truck,
    completedBy: null,
    completedAt: null
  },
  {
    id: 5,
    name: "Entregado",
    icon: Package,
    completedBy: null,
    completedAt: null
  }
];

const stateColorConfig: Record<string, { color: string; textColor: string }> = {
  "En validación": { color: "#2196F3", textColor: "text-white" },
  "En aprobaciones": { color: "#9C27B0", textColor: "text-white" },
  "En facturación": { color: "#FFC107", textColor: "text-black" },
  Facturado: { color: "#4CAF50", textColor: "text-white" },
  "En despacho": { color: "#009688", textColor: "text-white" },
  Entregado: { color: "#2E7D32", textColor: "text-white" },
  Novedad: { color: "#E53935", textColor: "text-white" },
  "Back order": { color: "#000000", textColor: "text-white" }
};

const novedadConfig = {
  "No tiene cupo": {
    icon: ShoppingCart,
    color: "#FF6B6B",
    bgColor: "#FFF5F5",
    borderColor: "#FFEBEB",
    description: "El cliente ha excedido su límite de crédito disponible"
  },
  "No tiene stock": {
    icon: PackageX,
    color: "#FF8C42",
    bgColor: "#FFF8F3",
    borderColor: "#FFEDD5",
    description: "No hay inventario suficiente para completar el pedido"
  },
  "No cumple especificaciones de entrega": {
    icon: AlertTriangle,
    color: "#FFA726",
    bgColor: "#FFF3E0",
    borderColor: "#FFE0B2",
    description: "La entrega no cumple con los requisitos establecidos"
  },
  "Cantidad fuera de promedio": {
    icon: TrendingDown,
    color: "#AB47BC",
    bgColor: "#F3E5F5",
    borderColor: "#E1BEE7",
    description: "La cantidad solicitada difiere significativamente del promedio histórico"
  },
  "Nuevo punto de entrega": {
    icon: MapPin,
    color: "#42A5F5",
    bgColor: "#E3F2FD",
    borderColor: "#BBDEFB",
    description: "Primera entrega en esta ubicación, requiere validación"
  },
  "No es posible cumplir con la entrega": {
    icon: XOctagon,
    color: "#EF5350",
    bgColor: "#FFEBEE",
    borderColor: "#FFCDD2",
    description: "Restricciones logísticas impiden completar la entrega"
  },
  "No coincide la lista de precios y/o productos": {
    icon: DollarSign,
    color: "#FF7043",
    bgColor: "#FBE9E7",
    borderColor: "#FFCCBC",
    description: "Discrepancia entre precios/productos solicitados y catálogo actual"
  }
};
