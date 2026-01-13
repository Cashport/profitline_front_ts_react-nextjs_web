"use client";

import { useState, useEffect } from "react";

import {
  Brain,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Receipt,
  User,
  Package,
  DollarSign
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Progress } from "@/modules/chat/ui/progress";
import { Alert, AlertDescription } from "@/modules/chat/ui/alert";
import { InvoiceData, useApp } from "../../context/app-context";

interface AIProcessingInterfaceProps {
  files: File[];
  onProcessingComplete?: (data: InvoiceData) => void;
  onClose?: () => void;
}

const processingSteps = [
  { id: 1, name: "Analizando documento PDF", icon: FileText },
  { id: 2, name: "Extrayendo información de la factura", icon: Receipt },
  { id: 3, name: "Identificando datos del comprador y vendedor", icon: User },
  { id: 4, name: "Procesando detalle de productos", icon: Package },
  { id: 5, name: "Calculando montos y totales", icon: DollarSign },
  { id: 6, name: "Validando información extraída", icon: CheckCircle }
];

export function AIProcessingInterface({
  files,
  onProcessingComplete,
  onClose
}: AIProcessingInterfaceProps) {
  const { addInvoice } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processDocument = async () => {
      try {
        setIsProcessing(true);

        for (let step = 0; step < processingSteps.length; step++) {
          setCurrentStep(step);

          const stepDuration = 1500 + Math.random() * 1000;
          const stepProgress = ((step + 1) / processingSteps.length) * 100;

          await new Promise((resolve) => {
            const interval = setInterval(() => {
              setProgress((prev) => {
                const newProgress = Math.min(prev + 2, stepProgress);
                if (newProgress >= stepProgress) {
                  clearInterval(interval);
                  resolve(undefined);
                }
                return newProgress;
              });
            }, 50);
          });

          await new Promise((resolve) => setTimeout(resolve, stepDuration));
        }

        const mockData: InvoiceData = {
          id: "invoice-" + Date.now(),
          autoId: Date.now(),
          numeroFactura: "FAC-2024-001234",
          fechaFactura: "2024-10-15",
          fechaVencimiento: "2024-11-15",
          comprador: "EMPRESA COMPRADORA S.A.S",
          vendedor: "PROVEEDOR COLOMBIA LTDA",
          cantidad: 3,
          monto: 2850000,
          productos: [
            {
              idProducto: "PROD-001",
              nombreProducto: "Laptop Dell Inspiron 15",
              cantidad: 2,
              precioUnitario: 1200000,
              iva: 456000,
              precioTotal: 2400000
            },
            {
              idProducto: "PROD-002",
              nombreProducto: "Mouse Inalámbrico Logitech",
              cantidad: 5,
              precioUnitario: 45000,
              iva: 42750,
              precioTotal: 225000
            },
            {
              idProducto: "PROD-003",
              nombreProducto: "Teclado Mecánico RGB",
              cantidad: 1,
              precioUnitario: 225000,
              iva: 42750,
              precioTotal: 225000
            }
          ],
          alertas: ["Fecha de vencimiento próxima (30 días)", "Monto superior al promedio mensual"],
          estado: "Back order",
          fechaProcesamiento: new Date().toLocaleDateString("es-CO"),
          archivoOriginal: files[0]?.name || "factura.pdf",
          pdfUrl: files[0] ? URL.createObjectURL(files[0]) : undefined
        };

        setExtractedData(mockData);
        setIsProcessing(false);

        addInvoice(mockData);
        if (onClose) {
          onClose();
        }

        if (onProcessingComplete) {
          onProcessingComplete(mockData);
        }
      } catch (err) {
        setError("Error al procesar el documento con IA");
        setIsProcessing(false);
      }
    };

    processDocument();
  }, [files, onProcessingComplete, addInvoice, onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl bg-cashport-white border-cashport-gray-light max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cashport-green/10 rounded-lg">
              <Brain className="h-6 w-6 text-cashport-green" />
            </div>
            <div>
              <CardTitle className="text-cashport-black">Procesamiento con IA</CardTitle>
              <p className="text-sm text-muted-foreground">
                Analizando {files.length} documento{files.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-cashport-black hover:bg-cashport-gray-lighter"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {isProcessing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cashport-black">
                  Progreso del análisis
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              <div className="flex items-center space-x-3 p-4 bg-cashport-gray-lighter rounded-lg">
                <Loader2 className="h-5 w-5 text-cashport-green animate-spin" />
                <div>
                  <p className="font-medium text-cashport-black">
                    {processingSteps[currentStep]?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Paso {currentStep + 1} de {processingSteps.length}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {processingSteps.map((step, index) => {
                  const IconComponent = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCompleted
                          ? "bg-green-50 border border-green-200"
                          : isCurrent
                            ? "bg-cashport-green/5 border border-cashport-green/20"
                            : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                              ? "text-cashport-green"
                              : "text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <IconComponent className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isCompleted
                            ? "text-green-800 font-medium"
                            : isCurrent
                              ? "text-cashport-black font-medium"
                              : "text-gray-500"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {extractedData && !isProcessing && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-cashport-black">
                  Procesamiento Completado
                </h3>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-cashport-green/10 rounded-lg">
                <Loader2 className="h-4 w-4 text-cashport-green animate-spin" />
                <p className="text-sm text-cashport-black">
                  Redirigiendo al detalle de la factura...
                </p>
              </div>

              {extractedData.alertas.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <div className="font-medium mb-2">Se encontraron las siguientes alertas:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {extractedData.alertas.map((alerta, index) => (
                        <li key={index} className="text-sm">
                          {alerta}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-cashport-gray-light">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-cashport-black">
                      Información de la Factura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Número de Factura
                      </label>
                      <p className="text-sm font-medium text-cashport-black">
                        {extractedData.numeroFactura}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Fecha de Factura
                      </label>
                      <p className="text-sm font-medium text-cashport-black">
                        {extractedData.fechaFactura}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Tipo de Factura
                      </label>
                      <p className="text-sm font-medium text-cashport-black">XXXXXXXXXX</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Monto Total
                      </label>
                      <p className="text-sm font-medium text-cashport-black">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0
                        }).format(extractedData.monto)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Archivo Original
                      </label>
                      <p className="text-sm font-medium text-cashport-black">
                        {extractedData.archivoOriginal}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-cashport-gray-light">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-cashport-black">
                      Comprador y Vendedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Comprador</label>
                      <p className="text-sm font-medium text-cashport-black">
                        {extractedData.comprador}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Vendedor</label>
                      <p className="text-sm font-medium text-cashport-black">
                        {extractedData.vendedor}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Método de Pago
                      </label>
                      <p className="text-sm font-medium text-cashport-black">XXXXXXXXXX</p>
                    </div>
                    {extractedData.fechaVencimiento && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Fecha de Vencimiento
                        </label>
                        <p className="text-sm font-medium text-cashport-black">
                          {extractedData.fechaVencimiento}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-cashport-gray-light">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-cashport-black">
                    Productos ({extractedData.productos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {extractedData.productos.slice(0, 3).map((producto, index) => (
                      <div key={index} className="p-3 bg-cashport-gray-lighter rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-cashport-black">
                              {producto.nombreProducto}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {producto.idProducto}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-cashport-black">
                              {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0
                              }).format(producto.precioTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cant: {producto.cantidad}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {extractedData.productos.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        Y {extractedData.productos.length - 3} producto
                        {extractedData.productos.length - 3 !== 1 ? "s" : ""} más...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
