"use client";

import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/modules/chat/ui/badge";
import { IApprovalStep } from "@/types/approvals/IApprovals";

interface ApproversTimelineProps {
  steps: IApprovalStep[];
  formatDate: (dateStr?: string) => string;
}

export const ApproversTimeline = ({ steps, formatDate }: ApproversTimelineProps) => {
  if (!steps || steps.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay aprobadores asignados</p>;
  }

  // Group steps by order
  const stepsByOrder: Record<number, IApprovalStep[]> = {};
  steps.forEach((step) => {
    const order = step.order || 1;
    if (!stepsByOrder[order]) {
      stepsByOrder[order] = [];
    }
    stepsByOrder[order].push(step);
  });

  const orders = Object.keys(stepsByOrder)
    .map(Number)
    .sort((a, b) => a - b);

  const getStatusFromCode = (statusCode: string): "aprobado" | "rechazado" | "pendiente" => {
    const code = statusCode.toLowerCase();
    if (code === "approved" || code === "aprobado") return "aprobado";
    if (code === "rejected" || code === "rechazado") return "rechazado";
    return "pendiente";
  };

  return (
    <div className="space-y-6">
      {orders.map((order, orderIndex) => (
        <div key={order} className="relative">
          {/* Step indicator */}
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              Paso {order}
            </Badge>
            {stepsByOrder[order].length > 1 && (
              <span className="text-xs text-muted-foreground">
                ({stepsByOrder[order].length} aprobadores)
              </span>
            )}
          </div>

          {/* Approvers in this step */}
          <div className="space-y-3">
            {stepsByOrder[order].map((step) => {
              const status = getStatusFromCode(step.status.code);

              return (
                <div
                  key={step.id}
                  className="rounded-lg border bg-background p-4 shadow-sm md:transition-all md:hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left side: Icon and details */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Status icon */}
                      <div className="flex-shrink-0">
                        {status === "aprobado" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : status === "rechazado" ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-semibold text-base">{step.approverName}</p>

                        {/* Date */}
                        {step.approvedAt && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(step.approvedAt)}
                          </p>
                        )}

                        {/* Rejection reason */}
                        {step.rejectionReason && (
                          <p className="text-sm italic text-muted-foreground mt-2">
                            &quot;{step.rejectionReason}&quot;
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
                      style={
                        step.status.color
                          ? {
                              color: step.status.color,
                              backgroundColor: step.status.backgroundColor,
                              borderColor: step.status.color
                            }
                          : undefined
                      }
                    >
                      {step.status.name ||
                        (status === "aprobado"
                          ? "Aprobado"
                          : status === "rechazado"
                            ? "Rechazado"
                            : "Pendiente")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connecting line to next step */}
          {orderIndex < orders.length - 1 && (
            <div className="my-4 flex items-center gap-2 pl-2">
              <div className="h-8 w-0.5 bg-border"></div>
              <div className="text-xs text-muted-foreground">↓</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
