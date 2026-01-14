import React, { useState, useEffect } from "react";
import { SafeDialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (invoiceIds: string) => void;
}

export function InvoiceModal({ open, onOpenChange, onConfirm }: InvoiceModalProps) {
  const [invoiceIds, setInvoiceIds] = useState("");

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setInvoiceIds("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(invoiceIds);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <SafeDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={handleCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!invoiceIds.trim()}
            className="flex-1 text-black font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#CBE71E" }}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </SafeDialog>
  );
}
