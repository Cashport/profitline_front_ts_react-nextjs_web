import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Check, Loader2, AlertTriangle } from "lucide-react";
import { message } from "antd";
import { getApprovers, purchaseOrderActions } from "@/services/purchaseOrders/purchaseOrders";
import {
  IApprover,
  IPurchaseOrderDetail,
  IApproveActionPayload
} from "@/types/purchaseOrders/purchaseOrders";
import { GenericResponse } from "@/types/global/IGlobal";
import { KeyedMutator } from "swr";

interface SendToApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrderId?: string;
  mutateOrderDetail: KeyedMutator<GenericResponse<IPurchaseOrderDetail>>;
}

export function SendToApprovalModal({
  open,
  onOpenChange,
  purchaseOrderId,
  mutateOrderDetail
}: SendToApprovalModalProps) {
  const [availableApprovers, setAvailableApprovers] = useState<IApprover[]>();
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedApprovers([]);
      setError(null);
    }
  }, [open]);

  const toggleApprover = (approverId: number) => {
    setSelectedApprovers((prev) =>
      prev.includes(approverId) ? prev.filter((id) => id !== approverId) : [...prev, approverId]
    );
  };

  const handleConfirm = async () => {
    if (!purchaseOrderId) return;
    setIsLoading(true);
    setError(null);

    try {
      const approvers = selectedApprovers.map((userId, index) => ({
        userId,
        order: index + 1
      }));

      const payload: IApproveActionPayload = {
        action: "approve",
        data: { approvers },
        observation: ""
      };

      await purchaseOrderActions(purchaseOrderId, payload);

      message.success("Orden enviada a aprobación correctamente");
      mutateOrderDetail();
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Error al enviar a aprobación";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedApprovers.length === 0 || isLoading}
            className="flex-1 text-black font-semibold disabled:opacity-50"
            style={{ backgroundColor: "#CBE71E" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
