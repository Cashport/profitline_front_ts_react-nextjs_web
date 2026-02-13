import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Upload, X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { message } from "antd";
import { purchaseOrderActions } from "@/services/purchaseOrders/purchaseOrders";
import { IInvoiceActionPayload } from "@/types/purchaseOrders/purchaseOrders";

interface InvoiceEntry {
  id: string;
  invoiceId: string;
  file: File | null;
}

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId: string;
  onSuccess?: () => void;
}

const createEmptyInvoice = (): InvoiceEntry => ({
  id: crypto.randomUUID(),
  invoiceId: "",
  file: null
});

export function InvoiceModal({
  open,
  onOpenChange,
  purchaseOrderId,
  onSuccess
}: InvoiceModalProps) {
  const [invoices, setInvoices] = useState<InvoiceEntry[]>([createEmptyInvoice()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (!open) {
      setInvoices([createEmptyInvoice()]);
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleInvoicePdfChange = (invoiceEntryId: string, file: File | null) => {
    if (file && file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      return;
    }

    if (file && file.size > 50 * 1024 * 1024) {
      setError("El archivo es demasiado grande (máximo 50MB)");
      return;
    }

    setError(null);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceEntryId ? { ...inv, file } : inv)));
  };

  const handleInvoiceIdChange = (invoiceEntryId: string, value: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceEntryId ? { ...inv, invoiceId: value } : inv))
    );
  };

  const handleAddInvoice = () => {
    setInvoices((prev) => [...prev, createEmptyInvoice()]);
  };

  const handleRemoveInvoice = (invoiceEntryId: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceEntryId));
  };

  const handleSaveInvoices = async () => {
    const incompleteInvoices = invoices.filter((inv) => !inv.invoiceId.trim() || !inv.file);

    if (incompleteInvoices.length > 0) {
      setError("Cada factura debe tener un ID y un archivo PDF");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invoiceIds = invoices.map((inv) => inv.invoiceId.trim());

      const payload: IInvoiceActionPayload = {
        action: "invoice",
        data: {
          invoice_ids: invoiceIds
        },
        observation: ""
      };

      const files = invoices.map((inv) => inv.file!);

      await purchaseOrderActions(purchaseOrderId, payload, files);

      message.success("Facturas agregadas correctamente");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al agregar las facturas";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = invoices.every((inv) => inv.invoiceId.trim() && inv.file);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Facturar Orden de Compra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">
            Puede dividir esta orden en múltiples facturas. Agregue el ID y el PDF de cada factura
            generada.
          </p>

          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current.set(invoice.id, el);
                    }}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleInvoicePdfChange(invoice.id, file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRefs.current.get(invoice.id)?.click()}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {invoice.file ? "Cambiar PDF" : "Subir PDF"}
                  </Button>
                </div>

                <div className="flex-1">
                  <Input
                    placeholder="ID de factura (Ej: FV-2024-001)"
                    value={invoice.invoiceId}
                    onChange={(e) => handleInvoiceIdChange(invoice.id, e.target.value)}
                    className="border-gray-300"
                  />
                </div>

                {invoice.file && (
                  <div className="flex items-center gap-1 text-sm text-green-600 flex-shrink-0">
                    <Check className="h-4 w-4" />
                    <span className="truncate max-w-[120px]">{invoice.file.name}</span>
                  </div>
                )}

                {invoices.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInvoice(invoice.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={handleAddInvoice}
            className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-transparent"
          >
            + Agregar otra factura
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información importante</p>
                <p>
                  Asegúrese de que la suma de todas las facturas corresponda al monto total de la
                  orden de compra.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveInvoices}
            disabled={isLoading || !isFormValid}
            style={{ backgroundColor: "#CBE71E", color: "#000" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar facturas"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
