"use client";

import { useState } from "react";
import useSWR from "swr";

import { getApprovalById } from "@/services/approvals/approvals";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Calendar,
  Users,
  MessageSquare,
  Paperclip,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/chat/ui/dialog";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Label } from "@/modules/chat/ui/label";
import { Textarea } from "@/modules/chat/ui/textarea";
import { IApprovalItem } from "@/types/approvals/IApprovals";

interface ApprovalDetailModalProps {
  approval?: IApprovalItem;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
}

const approvalTypeLabels: Record<string, string> = {
  "creacion-nota": "Creación de Nota",
  "cupo-credito": "Cupo de Crédito",
  "creacion-cliente": "Creación Cliente",
  "orden-compra": "Orden de Compra"
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "border-amber-300 bg-amber-50 text-amber-700" },
  aprobado: { label: "Aprobado", className: "border-green-300 bg-green-50 text-green-700" },
  rechazado: { label: "Rechazado", className: "border-red-300 bg-red-50 text-red-700" },
  "en-espera": { label: "En Espera", className: "border-blue-300 bg-blue-50 text-blue-700" }
};

export default function ApprovalDetailModal({
  approval,
  onClose,
  onApprove,
  onReject
}: ApprovalDetailModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: approvalDetail } = useSWR(approval?.id ? `approval-${approval.id}` : null, () =>
    getApprovalById(approval!.id)
  );

  console.log("Approval detail response:", approvalDetail);

  if (!approval) return null;

  const handleApprove = () => {
    onApprove(approval.id);
    setShowRejectForm(false);
    setRejectReason("");
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(approval.id, rejectReason);
      setShowRejectForm(false);
      setRejectReason("");
    }
  };

  const canTakeAction = approval.status === "PENDING";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <Dialog open={!!approval} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-none !w-[95vw] md:!w-[90vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-4 md:px-8 py-4 pr-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: ID + Status */}
            <div className="flex items-center gap-2 md:gap-3">
              <DialogTitle className="text-lg md:text-xl font-bold">
                {approvalDetail?.referenceId}
              </DialogTitle>
              <Badge variant="outline" className={`hidden md:flex text-xs font-medium`}>
                <Clock className="h-3 w-3 mr-1" />
                {approvalDetail?.status || approval.status}
              </Badge>
            </div>

            {/* Right side: Action buttons (only shown if can take action) */}
            {canTakeAction && !showRejectForm && (
              <div className="flex items-center gap-2">
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
                  onClick={handleApprove}
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
                <p className="text-sm">XXXXXXXX</p>
              </div>

              {/* Fecha de solicitud */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Fecha de solicitud</span>
                </div>
                <p className="text-sm">
                  {formatDate(approvalDetail?.createdAt)}{" "}
                  <span className="text-amber-600 font-medium">(XXXXXX días pendiente)</span>
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
                  {approvalDetail.attachments.map((attachment: string, index: number) => (
                    <a
                      key={index}
                      href="#"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      {attachment}
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
                    {approvalTypeLabels[approval.type]}
                  </h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Cliente:</span> CLIENTEXXXX
                    </p>
                    {true && (
                      <p>
                        <span className="font-medium">Monto:</span> $XXXXXXX
                      </p>
                    )}
                    {false && (
                      <div>
                        <p className="font-medium">Ítems:</p>
                        <ul className="ml-4 mt-1 list-disc space-y-0.5">
                          {approval.details.items.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 bg-background w-full md:w-auto"
                >
                  <a href={approval.detailLink} target="_blank" rel="noopener noreferrer">
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
                    variant="destructive"
                    size="sm"
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    Confirmar Rechazo
                  </Button>
                </div>
              </div>
            )}

            <div className="md:hidden space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 pb-3">
                <Users className="h-5 w-5" />
                <h3 className="text-base font-semibold">Aprobadores</h3>
              </div>

              <div className="space-y-6">
                {false && approval.otherApprovers.length > 0 ? (
                  (() => {
                    // Group approvers by step
                    const approversByStep: Record<number, any[]> = {};
                    approval.otherApprovers.forEach((approver: any) => {
                      const step = typeof approver === "string" ? 1 : approver.step || 1;
                      if (!approversByStep[step]) {
                        approversByStep[step] = [];
                      }
                      approversByStep[step].push(approver);
                    });

                    const steps = Object.keys(approversByStep)
                      .map(Number)
                      .sort((a, b) => a - b);

                    return steps.map((step, stepIndex) => (
                      <div key={step} className="relative">
                        {/* Step indicator */}
                        <div className="mb-3 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-semibold">
                            Paso {step}
                          </Badge>
                          {approversByStep[step].length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              ({approversByStep[step].length} aprobadores)
                            </span>
                          )}
                        </div>

                        {/* Approvers in this step */}
                        <div className="space-y-3">
                          {approversByStep[step].map((approver: any, approverIndex: number) => {
                            const status =
                              typeof approver === "string"
                                ? "pendiente"
                                : approver.status || "pendiente";
                            const name = typeof approver === "string" ? approver : approver.name;

                            return (
                              <div
                                key={`${step}-${approverIndex}`}
                                className="rounded-lg border bg-background p-4 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  {/* Left side: Icon and details */}
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {/* Status icon */}
                                    <div className="flex-shrink-0 pt-1">
                                      {status === "aprobado" ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      ) : status === "rechazado" ? (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      ) : (
                                        <Clock className="h-5 w-5 text-amber-500" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-1">
                                      <p className="font-semibold text-base">{name}</p>

                                      {/* Date and time */}
                                      {typeof approver !== "string" && approver.date && (
                                        <p className="text-xs text-muted-foreground">
                                          {formatDate(approver.date)}
                                          {approver.time && ` - ${approver.time}`}
                                        </p>
                                      )}

                                      {/* Comment */}
                                      {typeof approver !== "string" && approver.comment && (
                                        <p className="text-sm italic text-muted-foreground mt-2">
                                          &quot;{approver.comment}&quot;
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right side: Status badge */}
                                  <Badge
                                    variant="outline"
                                    className={`flex-shrink-0 ${
                                      status === "aprobado"
                                        ? "border-green-300 bg-green-50 text-green-700"
                                        : status === "rechazado"
                                          ? "border-red-300 bg-red-50 text-red-700"
                                          : "border-amber-300 bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {status === "aprobado"
                                      ? "Aprobado"
                                      : status === "rechazado"
                                        ? "Rechazado"
                                        : "Pendiente"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Connecting line to next step */}
                        {stepIndex < steps.length - 1 && (
                          <div className="my-4 flex items-center gap-2 pl-2">
                            <div className="h-8 w-0.5 bg-border"></div>
                            <div className="text-xs text-muted-foreground">↓</div>
                          </div>
                        )}
                      </div>
                    ));
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay otros aprobadores asignados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Approvers Timeline (Desktop only) */}
          <div className="hidden md:block md:w-[500px] flex-shrink-0 space-y-4 overflow-y-auto bg-muted/10 px-8 py-6">
            <div className="flex items-center gap-2 border-b pb-3">
              <Users className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Aprobadores</h3>
            </div>

            <div className="space-y-6">
              {approval.otherApprovers && approval.otherApprovers.length > 0 ? (
                (() => {
                  // Group approvers by step
                  const approversByStep: Record<number, any[]> = {};
                  approval.otherApprovers.forEach((approver: any) => {
                    const step = typeof approver === "string" ? 1 : approver.step || 1;
                    if (!approversByStep[step]) {
                      approversByStep[step] = [];
                    }
                    approversByStep[step].push(approver);
                  });

                  const steps = Object.keys(approversByStep)
                    .map(Number)
                    .sort((a, b) => a - b);

                  return steps.map((step, stepIndex) => (
                    <div key={step} className="relative">
                      {/* Step indicator */}
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          Paso {step}
                        </Badge>
                        {approversByStep[step].length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            ({approversByStep[step].length} aprobadores)
                          </span>
                        )}
                      </div>

                      {/* Approvers in this step */}
                      <div className="space-y-3">
                        {approversByStep[step].map((approver: any, approverIndex: number) => {
                          const status =
                            typeof approver === "string"
                              ? "pendiente"
                              : approver.status || "pendiente";
                          const name = typeof approver === "string" ? approver : approver.name;

                          return (
                            <div
                              key={`${step}-${approverIndex}`}
                              className="rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md"
                            >
                              <div className="flex items-start justify-between gap-3">
                                {/* Left side: Icon and details */}
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                  {/* Status icon */}
                                  <div className="flex-shrink-0 pt-1">
                                    {status === "aprobado" ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : status === "rechazado" ? (
                                      <XCircle className="h-5 w-5 text-red-600" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-amber-500" />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-1">
                                    <p className="font-semibold text-base">{name}</p>

                                    {/* Date and time */}
                                    {typeof approver !== "string" && approver.date && (
                                      <p className="text-xs text-muted-foreground">
                                        {formatDate(approver.date)}
                                        {approver.time && ` - ${approver.time}`}
                                      </p>
                                    )}

                                    {/* Comment */}
                                    {typeof approver !== "string" && approver.comment && (
                                      <p className="text-sm italic text-muted-foreground mt-2">
                                        &quot;{approver.comment}&quot;
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Right side: Status badge */}
                                <Badge
                                  variant="outline"
                                  className={`flex-shrink-0 ${
                                    status === "aprobado"
                                      ? "border-green-300 bg-green-50 text-green-700"
                                      : status === "rechazado"
                                        ? "border-red-300 bg-red-50 text-red-700"
                                        : "border-amber-300 bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {status === "aprobado"
                                    ? "Aprobado"
                                    : status === "rechazado"
                                      ? "Rechazado"
                                      : "Pendiente"}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Connecting line to next step */}
                      {stepIndex < steps.length - 1 && (
                        <div className="my-4 flex items-center gap-2 pl-2">
                          <div className="h-8 w-0.5 bg-border"></div>
                          <div className="text-xs text-muted-foreground">↓</div>
                        </div>
                      )}
                    </div>
                  ));
                })()
              ) : (
                <p className="text-sm text-muted-foreground">No hay otros aprobadores asignados</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
