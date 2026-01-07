"use client";

import { useEffect, useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Calendar,
  Users,
  MessageSquare,
  Paperclip
} from "lucide-react";

import { getApprovalById, resolveApproval } from "@/services/approvals/approvals";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Label } from "@/modules/chat/ui/label";
import { Textarea } from "@/modules/chat/ui/textarea";
import { ApproversTimeline } from "../approvers-timeline/approvers-timeline";

import { GenericResponse } from "@/types/global/IGlobal";
import { IApprovalItem, ApprovalDecision, IApprovalsResponse } from "@/types/approvals/IApprovals";

interface ApprovalDetailModalProps {
  approval?: IApprovalItem;
  onClose: () => void;
  mutateApprovals: KeyedMutator<GenericResponse<IApprovalsResponse>>;
}

export default function ApprovalDetailModal({
  approval,
  onClose,
  mutateApprovals
}: ApprovalDetailModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const { data: approvalDetail } = useSWR(approval?.id ? `approval-${approval.id}` : null, () =>
    getApprovalById(approval!.id)
  );

  useEffect(() => {
    // Reset state when modal is closed
    setShowRejectForm(false);
    setRejectReason("");
  }, [approval]);

  const canTakeAction = approvalDetail?.status === "PENDING";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getDaysUntil = (dateStr?: string): number | null => {
    if (!dateStr) return null;
    dayjs.extend(utc);
    const targetDate = dayjs.utc(dateStr).startOf("day");
    const today = dayjs.utc().startOf("day");
    return targetDate.diff(today, "day");
  };

  if (!approval) return null;

  const handleResolveApproval = async (decision: ApprovalDecision) => {
    if (!approval?.id) return;

    setIsResolving(true);
    try {
      await resolveApproval(approval.id, {
        decision,
        comment: decision === "REJECT" ? rejectReason : undefined
      });

      setShowRejectForm(false);
      setRejectReason("");
      mutateApprovals();
      onClose();
    } catch (error) {
      console.error("Error al resolver la aprobación:", error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Dialog open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-[1000px] !w-[95vw] md:!w-[90vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-4 md:px-8 py-4 pr-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: ID + Status */}
            <div className="flex items-center gap-2 md:gap-3">
              <DialogTitle className="text-lg md:text-xl font-bold">
                {approvalDetail?.referenceId}
              </DialogTitle>
              <Badge
                variant="outline"
                className={`flex-shrink-0 ${
                  status === "aprobado"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : status === "rechazado"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-amber-300 bg-amber-50 text-amber-700"
                }`}
                style={
                  approval?.status.color
                    ? {
                        color: approval.status.color,
                        backgroundColor: approval.status.backgroundColor,
                        borderColor: approval.status.color
                      }
                    : undefined
                }
              >
                {approval?.status.name}
              </Badge>
            </div>

            {/* Right side: Action buttons (only shown if can take action) */}
            {canTakeAction && !showRejectForm && (
              <div className="flex items-center gap-2 mr-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectForm(true)}
                  className="gap-1 md:gap-2 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 text-xs md:text-sm px-2 md:px-3"
                >
                  <XCircle className="h-3 md:h-4 w-3 md:w-4" />
                  <span className="hidden sm:inline">Rechazar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolveApproval("APPROVE")}
                  disabled={isResolving}
                  className="gap-1 md:gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 bg-transparent text-xs md:text-sm px-2 md:px-3"
                >
                  <CheckCircle2 className="h-3 md:h-4 w-3 md:w-4" />
                  <span className="hidden sm:inline">Aprobar</span>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[calc(90vh-100px)] overflow-hidden">
          {/* LEFT COLUMN - Approval Details */}
          <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto md:border-r px-4 md:px-8 py-4 md:py-6">
            {/* Solicitado por and Fecha de solicitud - Two columns at top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Solicitado por */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>Solicitado por</span>
                </div>
                <p className="text-sm">{approvalDetail?.requester.userName}</p>
              </div>

              {/* Fecha de solicitud */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Fecha de solicitud</span>
                </div>
                <p className="text-sm">
                  {formatDate(approvalDetail?.createdAt)}{" "}
                  {getDaysUntil(approvalDetail?.createdAt) !== null && (
                    <span className="text-amber-600 font-medium">
                      ({getDaysUntil(approvalDetail?.createdAt)} días)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Comment */}
            {approvalDetail?.observation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>Comentario</span>
                </div>
                <p className="text-sm text-foreground">{approvalDetail?.observation}</p>
              </div>
            )}

            {/* Attachments */}
            {approvalDetail?.attachments && approvalDetail.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  <span>Adjuntos ({approvalDetail.attachments.length})</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {approvalDetail.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.fileUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {attachment.fileName}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Detalle de aprobación - Section title */}
            <div className="pt-2">
              <h3 className="text-base font-semibold">Detalle de aprobación</h3>
            </div>

            {/* Document Details */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4 md:p-5">
              <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4">
                <div className="flex-1 w-full">
                  <h3 className="text-base md:text-lg font-semibold">
                    {approvalDetail?.typeActionCode}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p>{approvalDetail?.description}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 bg-background w-full md:w-auto"
                >
                  <a href={approvalDetail?.approvalLink} target="_blank" rel="noopener noreferrer">
                    Ver detalle
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Reject form */}
            {showRejectForm && (
              <div className="space-y-3 rounded-lg border-2 border-destructive bg-destructive/5 p-4">
                <Label htmlFor="reject-reason" className="text-sm font-medium">
                  Motivo del rechazo *
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Explica brevemente por qué rechazas esta solicitud..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleResolveApproval("REJECT")}
                    disabled={!rejectReason.trim() || isResolving}
                  >
                    Confirmar Rechazo
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Approvers Section - Responsive */}
          <div className="pt-4 border-t px-4 md:border-t-0  md:max-w-[500px] md:min-w-[430px] md:bg-muted/10 md:px-8 md:py-6 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 pb-3 md:border-b">
              <Users className="h-5 w-5" />
              <h3 className="text-base md:text-lg font-semibold">Aprobadores</h3>
            </div>
            <ApproversTimeline steps={approvalDetail?.steps || []} formatDate={formatDate} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
