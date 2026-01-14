"use client";

import React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { extractSingleParam } from "@/utils/utils";

import {
  ArrowLeft,
  FileText,
  Download,
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
  History,
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
import { Input } from "@/modules/chat/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/modules/chat/ui/tooltip";
import { Separator } from "@/modules/chat/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { SafeDialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Textarea } from "@/modules/chat/ui/textarea";
import { TimelineHistoryModal } from "../../components/timeline-history-modal/timeline-history-modal";
import { useApp } from "../../context/app-context";

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
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);
  const [invoiceIds, setInvoiceIds] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectObservation, setRejectObservation] = useState("");

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

  const totalUnits = editableProducts.reduce((sum, producto) => sum + producto.cantidad, 0);
  const totalIVA = editableProducts.reduce((sum, producto) => sum + producto.iva, 0);
  const totalAmount = editableProducts.reduce((sum, producto) => sum + producto.precioTotal, 0);

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

  const confirmReject = () => {
    console.log("Order rejected:", { reason: rejectReason, observation: rejectObservation });
    // TODO: Implement rejection logic
    setShowRejectModal(false);
    setRejectReason("");
    setRejectObservation("");
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

  const handleSendToApproval = () => {
    console.log("Send to approval:", selectedApprovers);
    // TODO: Implement send to approval logic
    setShowApprovalModal(false);
    setSelectedApprovers([]);
  };

  const handleAddInvoices = () => {
    console.log("Invoice IDs:", invoiceIds);
    // TODO: Implement invoice addition logic
    setShowInvoiceModal(false);
    setInvoiceIds("");
  };

  const handleConfirmDispatch = () => {
    console.log("Dispatch confirmed with notes:", dispatchNotes);
    // TODO: Implement dispatch confirmation logic
    setShowDispatchModal(false);
    setDispatchNotes("");
  };

  const toggleApprover = (approverId: string) => {
    setSelectedApprovers((prev) =>
      prev.includes(approverId) ? prev.filter((id) => id !== approverId) : [...prev, approverId]
    );
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

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-cashport-black mb-4">
                Información General
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Orden de compra
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editableGeneralInfo.numeroFactura}
                      onChange={(e) => handleGeneralInfoChange("numeroFactura", e.target.value)}
                      className="mt-1 h-8 text-sm font-semibold"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableGeneralInfo.numeroFactura}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Cliente
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editableGeneralInfo.comprador}
                      onChange={(e) => handleGeneralInfoChange("comprador", e.target.value)}
                      className="mt-1 h-8 text-sm font-semibold"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableGeneralInfo.comprador}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Fecha
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editableGeneralInfo.fechaFactura}
                      onChange={(e) => handleGeneralInfoChange("fechaFactura", e.target.value)}
                      className="mt-1 h-8 text-sm font-semibold"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableGeneralInfo.fechaFactura}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cashport-black mb-4">
                Información de Entrega
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Fecha/Hora entrega
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editableDeliveryInfo.fechaEntrega}
                      onChange={(e) => handleDeliveryInfoChange("fechaEntrega", e.target.value)}
                      className="mt-1 h-8 text-sm font-semibold"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableDeliveryInfo.fechaEntrega || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Dirección completa
                  </label>
                  {isEditMode ? (
                    <Input
                      value={
                        editableDeliveryInfo.direccion && editableDeliveryInfo.ciudad
                          ? `${editableDeliveryInfo.direccion}, ${editableDeliveryInfo.ciudad}`
                          : editableDeliveryInfo.direccion || editableDeliveryInfo.ciudad || ""
                      }
                      onChange={(e) => {
                        const parts = e.target.value.split(",");
                        handleDeliveryInfoChange("direccion", parts[0]?.trim() || "");
                        handleDeliveryInfoChange("ciudad", parts[1]?.trim() || "");
                      }}
                      className="mt-1 h-8 text-sm font-semibold"
                      placeholder="Dirección, Ciudad"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableDeliveryInfo.direccion && editableDeliveryInfo.ciudad
                        ? `${editableDeliveryInfo.direccion}, ${editableDeliveryInfo.ciudad}`
                        : editableDeliveryInfo.direccion || editableDeliveryInfo.ciudad || "-"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground tracking-wide">
                    Observación
                  </label>
                  {isEditMode ? (
                    <Input
                      value={editableDeliveryInfo.observacion}
                      onChange={(e) => handleDeliveryInfoChange("observacion", e.target.value)}
                      className="mt-1 h-8 text-sm font-semibold"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-cashport-black mt-1">
                      {editableDeliveryInfo.observacion || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <TooltipProvider>
            <div className="mb-8 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cashport-black">Proceso de la orden</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTimelineHistory(true)}
                  className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  Ver historial completo
                </Button>
              </div>

              <div className="flex items-center justify-between relative">
                {orderStages.map((stage, index) => {
                  const StageIcon = stage.icon;
                  const isCompleted = stage.id < currentStage;
                  const isCurrent = stage.id === currentStage;
                  const isPending = stage.id > currentStage;

                  return (
                    <React.Fragment key={stage.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center relative z-10">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-[#CBE71E] text-black"
                                  : isCurrent
                                    ? "bg-[#CBE71E] text-black"
                                    : "bg-gray-300 text-gray-500"
                              }`}
                            >
                              <StageIcon className="h-6 w-6" />
                            </div>
                            <span className="text-xs mt-2 text-center max-w-[80px] text-cashport-black font-medium">
                              {stage.name}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-cashport-black text-white">
                          {stage.subValidations ? (
                            <div className="text-xs space-y-2">
                              <p className="font-semibold mb-2">{stage.name}</p>
                              {stage.subValidations.map((subVal, idx) => (
                                <div
                                  key={idx}
                                  className="border-t border-gray-700 pt-2 first:border-t-0 first:pt-0"
                                >
                                  <p className="font-medium">{subVal.name}</p>
                                  {subVal.isCompleted ? (
                                    <>
                                      <p className="text-gray-300">{subVal.completedBy}</p>
                                      <p className="text-gray-400">{subVal.completedAt}</p>
                                    </>
                                  ) : (
                                    <p className="text-gray-400">Pendiente</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs">
                              <p className="font-semibold mb-1">{stage.name}</p>
                              {stage.completedBy ? (
                                <>
                                  <p>Completado por: {stage.completedBy}</p>
                                  <p>{stage.completedAt}</p>
                                </>
                              ) : (
                                <p className="text-gray-400">Pendiente</p>
                              )}
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>

                      {index < orderStages.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 transition-all ${
                            stage.id < currentStage ? "bg-[#CBE71E]" : "bg-gray-300"
                          }`}
                          style={{ marginTop: "-24px" }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>

          <Separator className="mb-6" />

          <div ref={containerRef} className="flex gap-4 overflow-hidden">
            <div
              className="space-y-6 transition-all duration-300 ease-in-out min-w-0"
              style={{
                flex: isPdfCollapsed ? "1" : `0 0 calc(${100 - pdfWidth}% - 1.5rem)`
              }}
            >
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-cashport-black">
                    Detalle de Productos
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cashport-gray-lighter border-b border-cashport-gray-light">
                      <tr>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          Producto cliente
                        </th>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          Producto
                        </th>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          Cantidad
                        </th>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          Precio unitario
                        </th>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          IVA
                        </th>
                        <th className="text-left p-3 font-semibold text-cashport-black text-xs">
                          Precio total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableProducts.map((producto, index) => {
                        const hasNoStandardizedProduct = !standardizedProducts[producto.idProducto];
                        const baseRowClass =
                          index % 2 === 0 ? "bg-white" : "bg-cashport-gray-lighter/30";

                        const rowClass = hasNoStandardizedProduct
                          ? "bg-red-50 border-b border-red-200"
                          : `border-b border-cashport-gray-light ${baseRowClass}`;

                        return (
                          <tr key={producto.idProducto} className={rowClass}>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="text-sm text-cashport-black">
                                  {producto.nombreProducto}
                                </span>
                                <span className="text-xs text-blue-600 mt-0.5">
                                  SKU: {producto.idProducto}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              {isEditMode ? (
                                <Select
                                  value={standardizedProducts[producto.idProducto] || ""}
                                  onValueChange={(value) =>
                                    handleStandardizedProductChange(producto.idProducto, value)
                                  }
                                >
                                  <SelectTrigger
                                    size="sm"
                                    className={`w-full ${!standardizedProducts[producto.idProducto] ? "border-red-300 bg-red-50" : ""}`}
                                  >
                                    <SelectValue placeholder="Seleccionar producto" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {internalProducts.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex flex-col">
                                  {standardizedProducts[producto.idProducto] ? (
                                    <>
                                      <span className="text-sm text-cashport-black">
                                        {internalProducts.find(
                                          (p) => p.id === standardizedProducts[producto.idProducto]
                                        )?.name || "-"}
                                      </span>
                                      <span className="text-xs text-blue-600 mt-0.5">
                                        ID: {standardizedProducts[producto.idProducto]}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              {isEditMode ? (
                                <Input
                                  type="number"
                                  value={producto.cantidad}
                                  onChange={(e) =>
                                    handleProductFieldChange(index, "cantidad", e.target.value)
                                  }
                                  className="w-20 h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm text-cashport-black">
                                  {producto.cantidad}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {isEditMode ? (
                                <Input
                                  type="number"
                                  value={producto.precioUnitario}
                                  onChange={(e) =>
                                    handleProductFieldChange(
                                      index,
                                      "precioUnitario",
                                      e.target.value
                                    )
                                  }
                                  className="w-28 h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm text-cashport-black">
                                  {formatCurrency(producto.precioUnitario)}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {isEditMode ? (
                                <Input
                                  type="number"
                                  value={producto.iva}
                                  onChange={(e) =>
                                    handleProductFieldChange(index, "iva", e.target.value)
                                  }
                                  className="w-24 h-8 text-sm"
                                />
                              ) : (
                                <span className="text-sm text-cashport-black">
                                  {formatCurrency(producto.iva)}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-sm text-cashport-black">
                              {formatCurrency(producto.precioTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-cashport-gray-lighter border-t-2 border-cashport-gray-light">
                      <tr>
                        <td
                          colSpan={2}
                          className="p-3 text-sm font-semibold text-cashport-black text-right"
                        >
                          Total
                        </td>
                        <td className="p-3 text-sm font-bold text-cashport-black">
                          {totalUnits.toLocaleString()}
                        </td>
                        <td className="p-3"></td>
                        <td className="p-3 text-sm font-bold text-cashport-black">
                          {formatCurrency(totalIVA)}
                        </td>
                        <td className="p-3 text-sm font-bold text-cashport-black">
                          {formatCurrency(totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {!isPdfCollapsed && (
              <div
                className="w-px bg-cashport-gray-light hover:bg-cashport-green cursor-col-resize flex items-center justify-center group transition-colors duration-200 flex-shrink-0"
                onMouseDown={handleMouseDown}
              >
                <GripVertical className="h-6 w-6 text-cashport-gray-light group-hover:text-cashport-green transition-colors duration-200" />
              </div>
            )}

            {!isPdfCollapsed && (
              <div
                className="transition-all duration-300 ease-in-out min-w-0"
                style={{ flex: `0 0 calc(${pdfWidth}% - 1.5rem)` }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center text-lg font-semibold text-cashport-black">
                      <FileText className="h-5 w-5 mr-2 text-cashport-green" />
                      Documento Original
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPdf}
                        disabled={!invoiceData.pdfUrl}
                        className="border-cashport-gray-light text-cashport-black hover:bg-cashport-white bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsPdfCollapsed(true)}
                        className="text-cashport-black hover:bg-cashport-white"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    {invoiceData.pdfUrl ? (
                      <div className="w-full h-full min-h-[400px] rounded-lg bg-cashport-gray-lighter flex flex-col">
                        <object
                          data={invoiceData.pdfUrl}
                          type="application/pdf"
                          className="w-full flex-1 min-h-[400px] rounded-lg"
                          title={`PDF: ${invoiceData.archivoOriginal || `factura-${invoiceData.numeroFactura}.pdf`}`}
                        >
                          <div className="p-8 text-center h-full flex items-center justify-center">
                            <div className="space-y-4">
                              <FileText className="h-16 w-16 mx-auto text-cashport-green opacity-50" />
                              <div>
                                <p className="text-lg font-medium text-cashport-black mb-2">
                                  Vista previa no disponible
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                  {invoiceData.archivoOriginal ||
                                    `factura-${invoiceData.numeroFactura}.pdf`}
                                </p>
                                <Button
                                  onClick={handleDownloadPdf}
                                  className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar PDF
                                </Button>
                              </div>
                            </div>
                          </div>
                        </object>
                      </div>
                    ) : (
                      <div className="bg-cashport-gray-lighter rounded-lg p-8 text-center h-full min-h-[400px] flex items-center justify-center">
                        <div className="space-y-4">
                          <FileText className="h-16 w-16 mx-auto text-cashport-green opacity-50" />
                          <div>
                            <p className="text-lg font-medium text-cashport-black mb-2">
                              Documento no disponible
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              {invoiceData.archivoOriginal ||
                                `factura-${invoiceData.numeroFactura}.pdf`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              El PDF original no está disponible para visualización
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

      <SafeDialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">¿Está seguro?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">¿Desea aprobar esta orden de compra?</p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmApprove}
              className="flex-1 text-black font-semibold"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </SafeDialog>

      <SafeDialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-lg mx-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowRejectModal(false)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-xl font-semibold">Rechazar orden</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Selecciona el motivo y agrega una observación</p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Motivo de rechazo</label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="precio-incorrecto">Precio incorrecto</SelectItem>
                  <SelectItem value="producto-no-disponible">Producto no disponible</SelectItem>
                  <SelectItem value="informacion-incompleta">Información incompleta</SelectItem>
                  <SelectItem value="error-cliente">Error del cliente</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Observación <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectObservation}
                onChange={(e) => setRejectObservation(e.target.value)}
                placeholder="Escribe una observación..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setRejectObservation("");
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectReason || !rejectObservation.trim()}
              className="flex-1 text-black font-semibold disabled:opacity-50"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </SafeDialog>

      <SafeDialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="sm:max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Enviar a aprobación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">Selecciona quién debe aprobar esta novedad</p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Aprobadores</label>
              <div className="border rounded-lg divide-y">
                {availableApprovers.map((approver) => (
                  <div
                    key={approver.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleApprover(approver.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedApprovers.includes(approver.id)
                            ? "bg-[#CBE71E] border-[#CBE71E]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedApprovers.includes(approver.id) && (
                          <Check className="h-3 w-3 text-black" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                        <p className="text-xs text-gray-500">{approver.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedApprovers([]);
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendToApproval}
              disabled={selectedApprovers.length === 0}
              className="flex-1 text-black font-semibold disabled:opacity-50"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Enviar
            </Button>
          </div>
        </DialogContent>
      </SafeDialog>

      <SafeDialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="sm:max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Facturar orden de compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Ingresa el ID o IDs de las facturas generadas para esta orden de compra
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ID de Factura(s) <span className="text-red-500">*</span>
              </label>
              <Input
                value={invoiceIds}
                onChange={(e) => setInvoiceIds(e.target.value)}
                placeholder="Ej: FV-2024-001, FV-2024-002"
                className="w-full"
              />
              <p className="text-xs text-gray-500">Separa múltiples IDs con comas</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowInvoiceModal(false);
                setInvoiceIds("");
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddInvoices}
              disabled={!invoiceIds.trim()}
              className="flex-1 text-black font-semibold disabled:opacity-50"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Guardar
            </Button>
          </div>
        </DialogContent>
      </SafeDialog>

      <SafeDialog open={showDispatchModal} onOpenChange={setShowDispatchModal}>
        <DialogContent className="sm:max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirmar despacho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Confirma que el pedido ha sido despachado por logística
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Observaciones</label>
              <Textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Agrega notas sobre el despacho (opcional)"
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Orden de compra: {invoiceData.numeroFactura}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    El estado cambiará a &quot;En despacho&quot; una vez confirmado
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDispatchModal(false);
                setDispatchNotes("");
              }}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDispatch}
              className="flex-1 text-black font-semibold"
              style={{ backgroundColor: "#CBE71E" }}
            >
              Confirmar despacho
            </Button>
          </div>
        </DialogContent>
      </SafeDialog>

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

const availableApprovers = [
  { id: "1", name: "Miguel Martínez", role: "KAM" },
  { id: "2", name: "Ana García", role: "Cartera" },
  { id: "3", name: "Carlos López", role: "Financiera" },
  { id: "4", name: "Laura Rodríguez", role: "Gerente" }
];
