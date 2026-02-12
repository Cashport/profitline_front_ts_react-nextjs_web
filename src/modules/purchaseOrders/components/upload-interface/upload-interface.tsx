"use client";

import type React from "react";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";

import { Upload, FileText, X, Scan, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Alert, AlertDescription } from "@/modules/chat/ui/alert";
import { AIProcessingInterface } from "../ai-processing-interface/ai-processing-interface";
import { uploadPurchaseOrder } from "@/services/purchaseOrders/purchaseOrders";

interface UploadInterfaceProps {
  onFileUpload?: (files: File[]) => void;
  onClose?: () => void;
}

export function UploadInterface({ onFileUpload, onClose }: UploadInterfaceProps) {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Solo se permiten archivos PDF";
    }
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return "El archivo es demasiado grande (máximo 50MB)";
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setProcessingFile(file);
      setShowAIProcessing(true);

      try {
        const response = await uploadPurchaseOrder(file);

        message.success("Orden cargada con éxito");
        router.push(`/purchase-orders/${response.marketplace_order_id}`);
      } catch (error: any) {
        setShowAIProcessing(false);

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error al cargar la orden de compra";

        setError(errorMessage);
        message.error(errorMessage);
      }

      if (onFileUpload) {
        onFileUpload([file]);
      }
    },
    [onFileUpload, router]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Check if the browser supports the Web Scanning API or use a fallback
      if ("navigator" in window && "mediaDevices" in navigator) {
        // For now, we'll simulate scanning - in a real app you'd integrate with scanning libraries
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Create a mock PDF file for demonstration
        const mockPdfContent = new Blob(["Mock scanned PDF content"], { type: "application/pdf" });
        const mockFile = new File([mockPdfContent], `factura-escaneada-${Date.now()}.pdf`, {
          type: "application/pdf"
        });

        handleFile(mockFile);
      } else {
        setError("La función de escaneo no está disponible en este navegador");
      }
    } catch (err) {
      setError("Error al acceder a la cámara para escanear");
    } finally {
      setIsScanning(false);
    }
  }, [handleFile]);

  const handleAIProcessingClose = useCallback(() => {
    setShowAIProcessing(false);
  }, []);

  if (showAIProcessing && processingFile) {
    return <AIProcessingInterface file={processingFile} onClose={handleAIProcessingClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-cashport-white border-cashport-gray-light max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-cashport-black">Cargar Orden de compra</CardTitle>
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
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-cashport-green bg-cashport-green/5"
                : "border-cashport-gray-light bg-cashport-gray-lighter"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-cashport-white rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-cashport-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cashport-black mb-2">
                  Arrastra tu archivo PDF aquí
                </h3>
                <p className="text-muted-foreground mb-4">
                  O selecciona un archivo desde tu dispositivo
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleFileSelect}
                  className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
                <Button
                  onClick={handleScan}
                  disabled={isScanning}
                  variant="outline"
                  className="border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter bg-transparent"
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Scan className="h-4 w-4 mr-2" />
                  )}
                  {isScanning ? "Escaneando..." : "Escanear Documento"}
                </Button>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}
