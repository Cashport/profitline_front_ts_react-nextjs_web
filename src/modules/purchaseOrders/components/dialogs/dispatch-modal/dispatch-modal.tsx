import React, { useState, useEffect } from "react";
import { useTranslations } from "use-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Button } from "@/modules/chat/ui/button";
import { Textarea } from "@/modules/chat/ui/textarea";
import { AlertTriangle, Loader2 } from "lucide-react";
import { message } from "antd";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IPurchaseOrderDetail,
  IDispatchActionPayload
} from "@/types/purchaseOrders/purchaseOrders";
import { KeyedMutator } from "swr";
import { purchaseOrderActions } from "@/services/purchaseOrders/purchaseOrders";

interface DispatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  purchaseOrderId?: string;
  mutateOrderDetail: KeyedMutator<GenericResponse<IPurchaseOrderDetail>>;
}

export function DispatchModal({
  open,
  onOpenChange,
  orderNumber,
  purchaseOrderId,
  mutateOrderDetail
}: DispatchModalProps) {
  const t = useTranslations("purchaseOrders.dispatchModal");
  const tCommon = useTranslations("common");
  const tStages = useTranslations("purchaseOrders.stages");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setDispatchNotes("");
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!purchaseOrderId) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload: IDispatchActionPayload = {
        action: "dispatch",
        data: {},
        observation: dispatchNotes
      };

      await purchaseOrderActions(purchaseOrderId, payload);

      message.success(t("success"));
      mutateOrderDetail();
      onOpenChange(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("error");
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600">{t("description")}</p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("notesLabel")}</label>
            <Textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder={t("notesPlaceholder")}
              className="min-h-[100px] resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {t("orderNumber", { number: orderNumber })}
                </p>
                <p className="text-[13px] text-blue-700 mt-1">
                  {t("statusWillChange", { status: tStages("inDispatch") })}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {tCommon("actions.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 text-black font-semibold"
            style={{ backgroundColor: "#CBE71E" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("dispatching")}
              </>
            ) : (
              t("title")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
