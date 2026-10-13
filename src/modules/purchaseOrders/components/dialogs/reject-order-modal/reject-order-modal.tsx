import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Textarea } from "@/modules/chat/ui/textarea";
import { ArrowLeft } from "lucide-react";

interface RejectOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, observation: string) => void;
}

export function RejectOrderModal({ open, onOpenChange, onConfirm }: RejectOrderModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectObservation, setRejectObservation] = useState("");

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setRejectReason("");
      setRejectObservation("");
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(rejectReason, rejectObservation);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
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
            onClick={handleCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!rejectReason || !rejectObservation.trim()}
            className="flex-1 text-black font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#CBE71E" }}
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
