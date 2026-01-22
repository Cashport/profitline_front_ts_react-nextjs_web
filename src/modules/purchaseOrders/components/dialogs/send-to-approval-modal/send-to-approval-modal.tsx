import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Check } from "lucide-react";
import { getApprovers } from "@/services/purchaseOrders/purchaseOrders";
import { IApprover } from "@/types/purchaseOrders/purchaseOrders";

interface SendToApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedApproverIds: number[]) => void;
}

export function SendToApprovalModal({ open, onOpenChange, onConfirm }: SendToApprovalModalProps) {
  const [availableApprovers, setAvailableApprovers] = useState<IApprover[]>();
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedApprovers([]);
    }
  }, [open]);

  const toggleApprover = (approverId: number) => {
    setSelectedApprovers((prev) =>
      prev.includes(approverId) ? prev.filter((id) => id !== approverId) : [...prev, approverId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedApprovers);
    console.log("Selected Approvers:", selectedApprovers);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    const fetchApprovers = async () => {
      const res = await getApprovers();
      setAvailableApprovers(res);
    };
    fetchApprovers();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Enviar a aprobación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">Selecciona quién debe aprobar esta novedad</p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Aprobadores</label>
            <div className="border rounded-lg divide-y">
              {availableApprovers?.map((approver) => (
                <div
                  key={approver.user_id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleApprover(approver.user_id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedApprovers.includes(approver.user_id)
                          ? "bg-[#CBE71E] border-[#CBE71E]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedApprovers.includes(approver.user_id) && (
                        <Check className="h-3 w-3 text-black" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{approver.user_name}</p>
                      <p className="text-xs text-gray-500">{approver.user_rol}</p>
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
    </Dialog>
  );
}
