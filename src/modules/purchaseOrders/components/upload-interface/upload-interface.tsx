"use client";

import type React from "react";

import { useState, useCallback, useRef } from "react";
import { message } from "antd";

import { Upload, FileText, X, Scan, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/chat/ui/card";
import { Button } from "@/modules/chat/ui/button";
import { Alert, AlertDescription } from "@/modules/chat/ui/alert";
import { Progress } from "@/modules/chat/ui/progress";
import { AIProcessingInterface } from "../ai-processing-interface/ai-processing-interface";
import { uploadPurchaseOrder } from "@/services/purchaseOrders/purchaseOrders";

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  preview?: string;
}

interface UploadInterfaceProps {
  onFileUpload?: (files: File[]) => void;
  onClose?: () => void;
}

export function UploadInterface({ onFileUpload, onClose }: UploadInterfaceProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
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

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        const fileId = Math.random().toString(36).substr(2, 9);
        const uploadedFile: UploadedFile = {
          file,
          id: fileId,
          progress: 0,
          status: "uploading"
        };

        setUploadedFiles((prev) => [...prev, uploadedFile]);

        try {
          // Call the real API to upload the file
          await uploadPurchaseOrder(file);

          // On success, update file status
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, progress: 100, status: "completed" } : f))
          );

          message.success("Orden cargada con éxito");

          // Transition to AI processing interface after successful upload
          setTimeout(() => {
            setShowAIProcessing(true);
          }, 500);
        } catch (error: any) {
          // On error, update file status to error
          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f))
          );

          // Extract error message
          const errorMessage =
            error?.response?.data?.message || error?.message || "Error al cargar la orden de compra";

          message.error(errorMessage);
        }
      }

      if (onFileUpload) {
        onFileUpload(fileArray);
      }
    },
    [onFileUpload]
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
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
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

        handleFiles([mockFile]);
      } else {
        setError("La función de escaneo no está disponible en este navegador");
      }
    } catch (err) {
      setError("Error al acceder a la cámara para escanear");
    } finally {
      setIsScanning(false);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleProcessWithAI = useCallback(() => {
    const completedFiles = uploadedFiles.filter((f) => f.status === "completed").map((f) => f.file);
    if (completedFiles.length > 0) {
      setShowAIProcessing(true);
    }
  }, [uploadedFiles]);

  const handleProcessingComplete = useCallback(
    (data: any) => {
      console.log("Processing completed with data:", data);
      // Close the upload interface when processing is complete
      setShowAIProcessing(false);
      if (onClose) {
        onClose();
      }
    },
    [onClose]
  );

  if (showAIProcessing) {
    const completedFiles = uploadedFiles.filter((f) => f.status === "completed").map((f) => f.file);
    return (
      <AIProcessingInterface
        files={completedFiles}
        onProcessingComplete={handleProcessingComplete}
        onClose={() => setShowAIProcessing(false)}
      />
    );
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

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-cashport-black">Archivos Cargados</h4>
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center space-x-3 p-3 bg-cashport-gray-lighter rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {uploadedFile.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : uploadedFile.status === "error" ? (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-cashport-green animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-cashport-black truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {uploadedFile.status === "uploading" && (
                      <Progress value={uploadedFile.progress} className="mt-2 h-1" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="text-cashport-black hover:bg-cashport-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {uploadedFiles.some((f) => f.status === "completed") && !showAIProcessing && (
                <div className="flex items-center space-x-2 p-3 bg-cashport-green/10 rounded-lg">
                  <Loader2 className="h-4 w-4 text-cashport-green animate-spin" />
                  <p className="text-sm text-cashport-black">Iniciando procesamiento con IA...</p>
                </div>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}
