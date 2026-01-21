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

interface AIProcessingInterfaceProps {
  files: File[];
  onProcessingComplete?: () => void;
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
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processDocument = async () => {
      try {
        setIsProcessing(true);

        // Simulate processing steps for demo purposes
        // TODO: Replace with actual API call to process documents
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

        // Processing complete
        setIsProcessing(false);

        // Notify completion
        if (onProcessingComplete) {
          onProcessingComplete();
        }

        // Auto-close after a short delay
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1500);
      } catch (err) {
        setError("Error al procesar el documento con IA");
        setIsProcessing(false);
      }
    };

    processDocument();
  }, [files, onProcessingComplete, onClose]);

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

          {!isProcessing && !error && (
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
                  Cerrando modal...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
