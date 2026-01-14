import React, { useState, useEffect } from "react";
import { SafeDialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface DispatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes: string) => void;
  orderNumber: string;
}

export function DispatchModal({ open, onOpenChange, onConfirm, orderNumber }: DispatchModalProps) {
  const [dispatchNotes, setDispatchNotes] = useState("");

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setDispatchNotes("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(dispatchNotes);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <SafeDialog open={open} onOpenChange={onOpenChange}>
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
                  Orden de compra: {orderNumber}
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
            onClick={handleCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 text-black font-semibold"
            style={{ backgroundColor: "#CBE71E" }}
          >
            Confirmar despacho
          </Button>
        </div>
      </DialogContent>
    </SafeDialog>
  );
}
