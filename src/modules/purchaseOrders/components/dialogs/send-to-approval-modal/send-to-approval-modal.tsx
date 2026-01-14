import React, { useState, useEffect } from "react";
import { SafeDialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Check } from "lucide-react";

interface Approver {
  id: string;
  name: string;
  role: string;
}

interface SendToApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedApproverIds: string[]) => void;
  availableApprovers: Approver[];
}

export function SendToApprovalModal({
  open,
  onOpenChange,
  onConfirm,
  availableApprovers
}: SendToApprovalModalProps) {
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedApprovers([]);
    }
  }, [open]);

  const toggleApprover = (approverId: string) => {
    setSelectedApprovers((prev) =>
      prev.includes(approverId) ? prev.filter((id) => id !== approverId) : [...prev, approverId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedApprovers);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <SafeDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={handleCancel}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedApprovers.length === 0}
            className="flex-1 text-black font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#CBE71E" }}
          >
            Enviar
          </Button>
        </div>
      </DialogContent>
    </SafeDialog>
  );
}
